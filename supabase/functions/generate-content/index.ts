import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

// Retry Helper
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) return res;
            if (res.status === 503 || res.status === 429) {
                console.warn(`Attempt ${i + 1} failed: ${res.status}. Retrying...`);
                await new Promise(r => setTimeout(r, backoff * (i + 1)));
                continue;
            }
            return res;
        } catch (e) {
            console.warn(`Attempt ${i + 1} error: ${e}. Retrying...`);
            await new Promise(r => setTimeout(r, backoff * (i + 1)));
        }
    }
    throw new Error(`Failed after ${retries} attempts.`);
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization')! } } })
        const { brand_id, topic, platform } = await req.json();

        // Credit Check
        const { data: credits } = await supabase.from('user_credits').select('*').eq('brand_id', brand_id).eq('agent_type', 'content').single();
        let currentCredits = credits?.credits_remaining ?? 3;
        if (!credits) await supabase.from('user_credits').insert({ brand_id, agent_type: 'content', credits_remaining: 3 });

        if (currentCredits <= 0) return new Response(JSON.stringify({ error: "Insufficient credits" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 });

        const { data: brand } = await supabase.from('brands').select('*').eq('id', brand_id).single();

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
        const prompt = `Write a ${platform} post for ${brand.name}. Topic: ${topic}. Voice: ${brand.tone_voice?.description}. Return Strictly JSON: { "content": "...", "hashtags": [] }`;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

        const res = await fetchWithRetry(geminiUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!res.ok) throw new Error("Generation Failed: " + await res.text());
        const json = await res.json();
        let text = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(text);

        // Deduct
        await supabase.from('user_credits').update({ credits_remaining: currentCredits - 1 }).eq('brand_id', brand_id).eq('agent_type', 'content');

        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 })
    }
})
