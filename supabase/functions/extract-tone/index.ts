import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

// Retry Helper
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return res;
            if (res.status === 503 || res.status === 429) {
                const errorText = await res.text();
                console.warn(`Attempt ${i + 1} failed: ${res.status} ${errorText}. Retrying...`);
                await new Promise(r => setTimeout(r, backoff * (i + 1))); // Linear backoff: 1s, 2s, 3s
                continue;
            }
            return res; // Return other errors (400, 401, 404) immediately
        } catch (e) {
            console.warn(`Attempt ${i + 1} network error: ${e}. Retrying...`);
            await new Promise(r => setTimeout(r, backoff * (i + 1)));
        }
    }
    throw new Error(`Failed after ${retries} attempts.`);
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { url, brand_id } = await req.json()
        const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

        // Scrape
        const response = await fetch(url, { headers: { 'User-Agent': 'MarketingAgentBot/1.0' } });
        const html = await response.text();
        const $ = cheerio.load(html);
        $('script, style, nav, footer').remove();
        const pageText = $('p').text().substring(0, 2000);

        // Analyze with Gemini
        // Using 'gemini-flash-latest' with RETRY LOGIC
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        const prompt = `Analyze this text for Brand Voice. Return strictly valid JSON with no markdown formatting: { "tone": "...", "adjectives": ["..."], "description": "...", "archetype": "..." }\n\nText: ${pageText}`;

        const geminiRes = await fetchWithRetry(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!geminiRes.ok) {
            const errorText = await geminiRes.text();
            // Keep Diagnostics
            if (geminiRes.status === 404) {
                const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
                const modelsRes = await fetch(modelsUrl);
                if (modelsRes.ok) {
                    const modelsData = await modelsRes.json();
                    const modelNames = modelsData.models?.map((m: any) => m.name) || [];
                    throw new Error(`Gemini Model 404. AVAILABLE MODELS: ${modelNames.join(', ')}. Original Error: ${errorText}`);
                }
            }
            throw new Error(`Gemini API Error: ${geminiRes.status} ${errorText}`);
        }

        const result = await geminiRes.json();
        let generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        const voiceProfile = JSON.parse(generatedText);

        if (brand_id) {
            await supabase.from('brands').update({ tone_voice: voiceProfile, website: url }).eq('id', brand_id);
        }

        return new Response(JSON.stringify(voiceProfile), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 })
    }
})
