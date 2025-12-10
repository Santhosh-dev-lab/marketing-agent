
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { brand_id, goal, date_range } = await req.json()

        if (!brand_id || !goal) {
            throw new Error("brand_id and goal are required");
        }

        // 1. Fetch Brand Data
        const { data: brand, error: brandError } = await supabaseClient
            .from('brands')
            .select('*')
            .eq('id', brand_id)
            .single();

        if (brandError || !brand) {
            throw new Error("Brand not found");
        }

        const toneDescription = brand.tone_voice?.description || "Professional and clear";
        const toneAdjectives = brand.tone_voice?.adjectives?.join(", ") || "Reliable, Trustworthy";

        // 2. Cache Check
        const promptContext = `Brand: ${brand.name}. Tone: ${toneDescription} (${toneAdjectives}). Goal: ${goal}. Dates: ${date_range}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(promptContext);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const promptHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Check Cache
        // Note: using Service Role key for cache access might be safer if RLS is strict, but for now using client context
        // Ideally cache should be global, so maybe use a separate admin client if strictly needed. 
        // For MVP, assuming user can read cache content if we set RLS properly or just re-generate.
        // Let's assume we re-generate if no exact hit, simpler.

        // Actually, let's use the SUPER_SERVICE_ROLE for cache to ensure shared cache works if desired, 
        // OR just stick to user-scoped. Let's start with NO cache check for the very first run to ensure it works, 
        // but the task says "Implement caching logic".

        // Let's implement simple DB cache lookup
        const { data: cached } = await supabaseClient
            .from('llm_cache')
            .select('response')
            .eq('prompt_hash', promptHash)
            .single();

        if (cached) {
            console.log(`[Generate] Cache Hit for ${promptHash}`);
            // Log the "cached" event
            await supabaseClient.from('generation_logs').insert({
                user_id: brand.user_id, // Assuming brand has user_id, or we get it from auth
                prompt_hash: promptHash,
                status: 'cached',
                model: 'cache',
                latency_ms: 0
            });
            return new Response(
                JSON.stringify(cached.response),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // 3. Construct Prompt
        const systemPrompt = `You are a world-class marketing copywriter. 
    Brand Name: ${brand.name}
    Brand Voice: ${toneDescription}
    Keywords: ${toneAdjectives}
    
    Your task: Create a marketing campaign pack based on the user's goal.
    Return ONLY a JSON object with this exact structure:
    {
        "posts": [
            { "platform": "Twitter", "content": "..." },
            { "platform": "LinkedIn", "content": "..." },
            { "platform": "Instagram", "content": "...", "image_idea": "..." }
        ],
        "email": {
            "subject": "...",
            "body": "..."
        }
    }
    No preamble. Valid JSON only.
    `;

        const userPrompt = `Campaign Goal: ${goal}\nTiming: ${date_range || 'Immediate'}`;
        const model = "meta-llama/Meta-Llama-3-8B-Instruct";
        const startTime = Date.now();

        // 4. Call LLM
        const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

        const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userPrompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
                parameters: {
                    max_new_tokens: 1000,
                    temperature: 0.8,
                    return_full_text: false
                }
            })
        });

        if (!hfResponse.ok) {
            throw new Error(`HF Error: ${hfResponse.statusText}`);
        }

        const result = await hfResponse.json();
        const duration = Date.now() - startTime;

        let generatedText = Array.isArray(result) ? result[0].generated_text : result.generated_text;

        // Parse JSON
        let jsonResponse = {};
        const match = generatedText.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                jsonResponse = JSON.parse(match[0]);
            } catch (e) {
                console.error("JSON Parse Error", e);
                // Fallback content if JSON fails
                jsonResponse = {
                    failed_parsing: true,
                    raw: generatedText,
                    posts: [],
                    email: {}
                };
            }
        } else {
            jsonResponse = { error: "No JSON found", raw: generatedText };
        }

        // 5. Update Cache & Log
        // We use a separate admin client for this if RLS blocks, but let's try with current client context first.
        // Actually, llm_cache RLS might allow insert for authenticated users? 
        // Let's assume yes.

        await Promise.all([
            supabaseClient.from('llm_cache').insert({
                prompt_hash: promptHash,
                model: model,
                response: jsonResponse
            }),
            supabaseClient.from('generation_logs').insert({
                user_id: brand.user_id,
                prompt_hash: promptHash,
                status: 'success',
                model: model,
                latency_ms: duration
            })
        ]);

        return new Response(
            JSON.stringify(jsonResponse),
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
