import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { brand_id, goal, date_range } = await req.json()
        if (!brand_id || !goal) throw new Error("brand_id and goal are required");

        // Credit Check
        const { data: credits } = await supabaseClient.from('user_credits').select('*').eq('brand_id', brand_id).eq('agent_type', 'strategy').single();
        let currentCredits = credits?.credits_remaining ?? 3;
        if (!credits) await supabaseClient.from('user_credits').insert({ brand_id, agent_type: 'strategy', credits_remaining: 3 });

        if (currentCredits <= 0) return new Response(JSON.stringify({ error: "Insufficient credits" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 });

        const { data: brand } = await supabaseClient.from('brands').select('*').eq('id', brand_id).single();
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

        // 1. RAG Embedding (Retry Logic)
        const embedUrl = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
        const embedRes = await fetchWithRetry(embedUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "models/text-embedding-004", content: { parts: [{ text: goal }] } })
        });

        let queryVector: number[] = [];
        if (embedRes.ok) {
            const json = await embedRes.json();
            queryVector = json.embedding?.values || [];
        }

        let contextMemories = "";
        if (queryVector.length > 0) {
            const { data: memories } = await supabaseClient.rpc('match_memories', {
                query_embedding: queryVector,
                match_threshold: 0.5,
                match_count: 5,
                p_brand_id: brand_id
            });
            if (memories?.length) contextMemories = memories.map((m: any) => `- ${m.content}`).join("\\n");
        }

        // 2. Generate Plan (Gemini Flash Latest + Retry)
        const toneDesc = brand.tone_voice?.description || "Professional";
        const systemPrompt = `You are a Chief Marketing Officer AI Agent.
    Brand: ${brand.name}
    Voice: ${toneDesc}
    Context: ${contextMemories}
    
    Goal: Create a detailed 30-day Campaign Strategy.
    Return strictly JSON (no markdown):
    {
      "campaign_title": "...",
      "strategy_summary": "...",
      "weekly_themes": [ { "week": 1, "theme": "...", "focus_channels": ["twitter"] } ],
      "content_plan": [ { "day": 1, "platform": "twitter", "topic": "..." } ]
    }`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        const aiRes = await fetchWithRetry(geminiUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nGoal: ${goal}\nTiming: ${date_range}` }] }] })
        });

        if (!aiRes.ok) throw new Error("Gemini Generation Failed " + aiRes.statusText + await aiRes.text());
        const aiJson = await aiRes.json();
        let text = aiJson.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const plan = JSON.parse(text);

        // 3. Store
        const { data: campaign, error: campError } = await supabaseClient
            .from('campaigns')
            .insert({ brand_id, name: plan.campaign_title || `Campaign: ${goal}`, goal, start_date: new Date().toISOString(), status: 'draft' })
            .select().single();

        if (campError) throw campError;

        // Deduct
        await supabaseClient.from('user_credits').update({ credits_remaining: currentCredits - 1 }).eq('brand_id', brand_id).eq('agent_type', 'strategy');

        return new Response(JSON.stringify({ success: true, campaign_id: campaign.id, plan, credits_remaining: currentCredits - 1 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 })
    }
})
