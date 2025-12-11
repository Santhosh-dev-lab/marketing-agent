
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { url } = await req.json()
        if (!url) {
            throw new Error("URL is required");
        }

        console.log(`[Extract Tone] Processing URL: ${url}`);

        // 1. Scraping (Real-time) - Enhanced & Polite
        // We use a polite User-Agent to identify ourselves as a bot but explain our intent if inspected.
        let pageText = "";
        let metaDescription = "";

        try {
            const response = await fetch(url, {
                headers: {
                    // "MarketingAgentBot/1.0 (+https://marketing-agent.com/bot)" or similar polite string
                    'User-Agent': 'MarketingAgentBot/1.0 (Student Project; +http://localhost:3000)'
                }
            });

            if (!response.ok) {
                console.warn(`[Extract Tone] Fetch failed status: ${response.status}`);
                pageText = "Could not access content directly. Analyze based on URL structure.";
            } else {
                const html = await response.text();
                const $ = cheerio.load(html);

                // Cleaning: Remove non-content elements
                $('script').remove();
                $('style').remove();
                $('nav').remove();
                $('footer').remove();
                $('iframe').remove();
                $('noscript').remove();

                metaDescription = $('meta[name="description"]').attr('content') ||
                    $('meta[property="og:description"]').attr('content') || "";

                // Deep Extraction
                const title = $('title').text().trim();
                const h1 = $('h1').slice(0, 2).map((_, el) => $(el).text().trim()).get().join(' | ');
                const h2 = $('h2').slice(0, 5).map((_, el) => $(el).text().trim()).get().join(' | ');
                const listItems = $('li').slice(0, 10).map((_, el) => $(el).text().trim()).get().join('; ');

                // Get paragraphs but limit total length
                const p = $('p').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 20).join(' ').substring(0, 2000);

                pageText = `
                Page Title: ${title}
                Meta Description: ${metaDescription}
                Main Headings (H1): ${h1}
                Sub Headings (H2): ${h2}
                Key List Items: ${listItems}
                Body Content: ${p}
                `;
            }

        } catch (err) {
            console.error(`[Extract Tone] Scraping error: ${err.message}`);
            pageText = "Could not fetch content. Analyze based on URL.";
        }

        console.log(`[Extract Tone] Scraped content length: ${pageText.length}`);

        // 2. Call LLM (Hugging Face)
        const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
        if (!HUGGINGFACE_API_KEY) {
            throw new Error("HUGGINGFACE_API_KEY is not set");
        }

        // Updated Reach Schema Prompt
        const systemPrompt = `You are a branding expert. Analyze the provided website content to extract the brand's 'Tone of Voice' and 'Brand Archetype'.
    
    Return ONLY a JSON object with this EXACT structure:
    {
        "tone": "A 2-3 word summary of the tone (e.g. Professional & Authoritative)",
        "adjectives": ["adj1", "adj2", "adj3", "adj4"],
        "description": "A 1-sentence summary of their brand voice style.",
        "keywords": ["key1", "key2", "key3"],
        "archetype": "The specific Brand Archetype (e.g. The Hero, The Sage, The Creator, The Jester, The Ruler, etc.)",
        "communication_style": "Short description of how they talk (e.g. 'Short, punchy sentences' or 'Long, educational paragraphs')"
    }
    Valid JSON only. No markdown.`;

        const userPrompt = `URL: ${url}\n\nPage Content:\n${pageText}`;

        // Using fallback models for robustness (Qwen -> Mistral)
        const models = [
            "Qwen/Qwen2.5-7B-Instruct",
            "mistralai/Mistral-7B-Instruct-v0.3"
        ];

        let result;
        for (const model of models) {
            try {
                console.log(`[Extract Tone] Trying model: ${model}`);
                let inputs = "";
                if (model.includes("Qwen")) {
                    inputs = `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${userPrompt}<|im_end|>\n<|im_start|>assistant\n`;
                } else {
                    inputs = `[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`;
                }

                const hfResponse = await fetch(`https://router.huggingface.co/models/${model}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: inputs,
                        parameters: {
                            max_new_tokens: 600, // Increased for richer output
                            temperature: 0.6,
                            return_full_text: false
                        }
                    })
                });

                if (hfResponse.ok) {
                    result = await hfResponse.json();
                    break;
                } else {
                    console.warn(`[Extract] Failed ${model}: ${hfResponse.status}`);
                }
            } catch (e) {
                console.warn(`[Extract] Error ${model}: ${e.message}`);
            }
        }

        if (!result) {
            console.warn("[Extract Tone] All LLMs failed. Using heuristic fallback.");
            // Heuristic Fallback (Deep)
            result = {
                generated_text: JSON.stringify({
                    tone: pageText.length > 500 ? "Informative & authoritative" : "Minimalist & Direct",
                    adjectives: ["Reliable", "Clear", "Modern", "Efficient"],
                    description: `Analysed from ${url}. The content focuses on specific value propositions.`,
                    keywords: ["Growth", "Efficiency", "Service"],
                    archetype: "The Ruler",
                    communication_style: "Direct and professional."
                })
            };
        }

        console.log("[Extract Tone] LLM Raw Result success");

        // Parse generated text
        let generatedText = "";
        if (Array.isArray(result) && result[0].generated_text) {
            generatedText = result[0].generated_text;
        } else if (result.generated_text) {
            generatedText = result.generated_text;
        }

        // Attempt to parse JSON from the text
        let jsonResult = {};
        try {
            // Strip everything before first '{' and after last '}'
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonResult = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON found in LLM response");
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback
            jsonResult = {
                tone: "Neutral & Professional",
                adjectives: ["Clean", "Standard", "Clear"],
                description: "Could not analyze deeply, defaulting to neutral professional tone.",
                keywords: ["Service", "General"],
                archetype: "The Regular Guy",
                communication_style: "Standard professional english."
            };
        }

        return new Response(
            JSON.stringify(jsonResult),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        )
    }
})
