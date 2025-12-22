
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { messages } = await req.json(); // Standard OpenAI format input from frontend

        // --- CONFIGURATION ---
        const geminiKeysString = Deno.env.get("GEMINI_API_KEYS") || Deno.env.get("GEMINI_API_KEY") || "";
        const geminiKeys = geminiKeysString.split(',').map(k => k.trim()).filter(k => k.length > 0);

        const groqKey = Deno.env.get("GROQ_API_KEY");

        if (geminiKeys.length === 0 && !groqKey) {
            throw new Error("Missing GEMINI_API_KEYS and GROQ_API_KEY");
        }

        let systemPrompt = `You are Mark, the AI Assistant for 'Marketing Agent', a platform tailored for marketing professionals.

---
### Your Role
- Answer questions about the website features, navigation, and capabilities.
- Provide general marketing advice.
- Be helpful, concise, and professional.

---
### Website Capabilities & Structure (Knowledge Base)

1. **Dashboard** (\`/dashboard\`)
   - **Location**: Access via "Log In" or top navigation under **Product > Performance Dashboard**.
   - **Key Pages** (Found in the **Left Sidebar** of the Dashboard):
     - **Overview** (\`/dashboard\`): Real-time analytics.
     - **Campaigns** (\`/dashboard/campaigns\`): Manage and create new campaigns.
     - **Brand Twin** (\`/dashboard/brand\`): Configure your AI persona.
     - **Tasks** (\`/dashboard/tasks\`): AI-recommended daily tasks.

2. **Resources & Learning**
   - **Blogs** (\`/blogs\`): Educational articles.
     - **Location**: Top Navigation Bar > **Resources** > **Blog**.
   - **Help Center** (\`/help-center\`): Guides and FAQs.
     - **Location**: Top Navigation Bar > **Resources** > **Help Center**.

3. **Campaign Tools** (\`/wizard\`)
   - **Purpose**: AI-powered tool to generate complete marketing campaigns.
   - **Location**: Click "New Campaign" on the Dashboard Overview.

4. **Newsletter** (\`/newsletter\`)
   - **Purpose**: Weekly automated updates.

---
### Response Guidelines
- **Be Specific about Location**: When telling a user where to go, mention the UI element (e.g., "Go to the **Resources** menu in the top navigation and click **Blog**").
- If a user asks "Where are the blogs?", answer: "You can find the blogs in the **Resources** menu at the top of the page, or visit \`/blogs\` directly."
- If a user asks "How do I create a campaign?", answer: "Go to your **Dashboard**, and click **Campaigns** in the sidebar, or use the **New Campaign** button."
`;

        // 1. Prepare Content for Gemini (Native Format)
        const geminiContents = [];
        let isFirstUser = true;
        // Simple conversion: System prompt merged into first user message or history
        // Gemini doesn't strictly support 'system' role in 'contents' in the same way as OpenAI 'messages' for system instructions in some versions, 
        // but 1.5-flash supports system_instruction. For simplicity/compatibility, we prepending to first user msg.

        // However, let's stick to the previous working robust pattern:
        // Filter out system msg from loop, prepend to first user msg.
        for (const msg of messages) {
            if (msg.role === 'system') continue;

            let role = msg.role === 'assistant' ? 'model' : 'user';
            let text = msg.content;

            if (isFirstUser && role === 'user') {
                text = systemPrompt + "\n\nUser Query: " + text;
                isFirstUser = false;
            }

            geminiContents.push({
                role: role,
                parts: [{ text: text }]
            });
        }
        if (geminiContents.length === 0 && !isFirstUser) {
            // Fallback if only system prompt existed
            geminiContents.push({ role: 'user', parts: [{ text: systemPrompt + "\n\nHello" }] });
        }


        let finalText = "";
        let attemptSuccess = false;
        let lastError = "";

        // --- STRATEGY 1: GEMINI ROTATION ---
        for (const apiKey of geminiKeys) {
            try {
                // console.log("Attempting Gemini with key ending in...", apiKey.slice(-4));
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: geminiContents })
                });

                if (response.ok) {
                    const data = await response.json();
                    finalText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (finalText) {
                        attemptSuccess = true;
                        break; // Success! Exit loop.
                    }
                } else {
                    const errText = await response.text();
                    const status = response.status;
                    const thisError = `[Gemini Key ${apiKey.slice(-4)}: ${status} - ${errText.slice(0, 100)}]`;
                    console.warn(thisError);
                    lastError += thisError + "; ";
                }
            } catch (err) {
                const thisError = `[Gemini Net Error: ${err.message}]`;
                console.error("Gemini Fetch Error:", err);
                lastError += thisError + "; ";
            }
        }

        // --- STRATEGY 2: GROQ FALLBACK ---
        if (!attemptSuccess && groqKey) {
            console.log("All Gemini keys failed. Attempting Groq Fallback...");
            try {
                // Prepare OpenAI Format for Groq
                const groqMessages = [
                    { role: 'system', content: systemPrompt }
                ];
                for (const msg of messages) {
                    if (msg.role === 'system') continue;
                    groqMessages.push({
                        role: msg.role === 'model' ? 'assistant' : msg.role,
                        content: msg.content
                    });
                }

                const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${groqKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        messages: groqMessages,
                        model: "llama-3.3-70b-versatile"
                    })
                });

                if (groqResponse.ok) {
                    const data = await groqResponse.json();
                    finalText = data.choices?.[0]?.message?.content;
                    if (finalText) attemptSuccess = true;
                } else {
                    const errText = await groqResponse.text();
                    const thisError = `[Groq Failed (${groqResponse.status}): ${errText.slice(0, 200)}]`;
                    console.error("Groq Failed:", errText);
                    lastError += thisError;
                }

            } catch (err) {
                const thisError = `[Groq Net Error: ${err.message}]`;
                console.error("Groq Error:", err);
                lastError += thisError;
            }
        }

        if (!attemptSuccess) {
            throw new Error(`All providers failed. Details: ${lastError || "Unknown"}`);
        }

        // --- STREAMING RESPONSE ---
        // (Simulate SSE stream for frontend compatibility)
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        (async () => {
            const sseChunk = `data: ${JSON.stringify({
                choices: [{ delta: { content: finalText } }]
            })}\n\n`;
            await writer.write(encoder.encode(sseChunk));
            await writer.write(encoder.encode("data: [DONE]\n\n"));
            await writer.close();
        })();

        return new Response(readable, {
            headers: {
                ...corsHeaders,
                "Content-Type": "text/event-stream",
            },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
