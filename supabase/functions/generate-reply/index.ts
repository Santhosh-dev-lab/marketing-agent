
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { brand_id, comment_text, post_context } = await req.json();

        // 1. Fetch Brand Voice
        const { data: brand } = await supabaseClient
            .from('brands')
            .select('*')
            .eq('id', brand_id)
            .single();

        const voiceDesc = brand?.tone_voice?.description || "Friendly & Professional";

        const systemPrompt = `You are a Community Manager for ${brand.name}.
        Voice: ${voiceDesc}
        
        Task: Write a reply to the user's comment.
        - Be helpful, engaging, and on-brand.
        - Keep it under 280 characters if for Twitter.
        - If the comment is negative, be diplomatic.
        
        Return JSON: { "reply": "..." }`;

        const userPrompt = `Post Context: ${post_context}\nUser Comment: "${comment_text}"`;

        const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
        const model = "mistralai/Mistral-7B-Instruct-v0.3";

        const hfRes = await fetch(`https://router.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs: `[INST] ${systemPrompt}\n\n${userPrompt} [/INST]`,
                parameters: { max_new_tokens: 200, temperature: 0.6, return_full_text: false }
            })
        });

        if (!hfRes.ok) throw new Error(`Model Error: ${hfRes.statusText}`);
        const aiResult = await hfRes.json();
        const generatedText = Array.isArray(aiResult) ? aiResult[0].generated_text : aiResult.generated_text;

        let jsonRes = { reply: generatedText.trim().replace(/^"|"$/g, '') }; // Fallback cleanup
        const match = generatedText.match(/\{[\s\S]*\}/);
        if (match) {
            try { jsonRes = JSON.parse(match[0]); } catch (e) { }
        }

        return new Response(
            JSON.stringify(jsonRes),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )

    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        )
    }
})
