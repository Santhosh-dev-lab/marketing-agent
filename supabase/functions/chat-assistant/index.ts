
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
        const { messages } = await req.json();
        const apiKey = Deno.env.get("GEMINI_API_KEY");

        if (!apiKey) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        let systemPrompt = `You are the AI Assistant for 'Marketing Agent', a platform tailored for marketing professionals.
Your Role:
- Answer questions about the website features (Dashboard, Newsletter, Blogs, Campaigns).
- Provide general marketing advice and strategy tips.
- Be helpful, concise, and professional.
- If you don't know something about the specific website implementation, admit it or give general advice.

Website Context:
- The 'Dashboard' allows users to manage marketing campaigns and brands.
- The 'Newsletter' is an automated weekly email with trending news.
- The 'Blogs' section features articles on AI marketing.
- The 'Help Center' contains FAQs and Documentation.
`;

        // Prepare History for Gemini
        const contents = [];
        let isFirstUser = true;

        for (const msg of messages) {
            if (msg.role === 'system') continue;

            let role = msg.role === 'assistant' ? 'model' : 'user';
            let text = msg.content;

            if (isFirstUser && role === 'user') {
                text = systemPrompt + "\n\nUser Query: " + text;
                isFirstUser = false;
            }

            contents.push({
                role: role,
                parts: [{ text: text }]
            });
        }

        if (contents.length === 0 && !isFirstUser) {
            contents.push({ role: 'user', parts: [{ text: systemPrompt + "\n\nHello" }] });
        }

        // Use generateContent (Non-streaming)
        // Switch to Gemini Flash Latest (Free Tier Friendly)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini Error:", errorText);
            throw new Error(`Gemini API Error: ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

        // Stream as ONE SSE chunk for compatibility
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();

        (async () => {
            const sseChunk = `data: ${JSON.stringify({
                choices: [{ delta: { content: text } }]
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
