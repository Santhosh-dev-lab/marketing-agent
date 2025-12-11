import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const { brand_id, prompt } = await req.json();

        // Credit Check
        const { data: credits } = await supabase.from('user_credits').select('*').eq('brand_id', brand_id).eq('agent_type', 'visual').single();
        let currentCredits = credits?.credits_remaining ?? 3;
        if (!credits) await supabase.from('user_credits').insert({ brand_id, agent_type: 'visual', credits_remaining: 3 });

        if (currentCredits <= 0) return new Response(JSON.stringify({ error: "Insufficient credits" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 });

        const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
        // Note: Staying with HF for image generation as standard Gemini Flash is text-only. 
        // Could enable Imagen if needed, but HF XL is solid.
        let hfRes = await fetch('https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0', {
            method: 'POST', headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: prompt })
        });

        if (!hfRes.ok) {
            hfRes = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
                method: 'POST', headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: prompt })
            });
        }

        if (!hfRes.ok) throw new Error("Image Gen Failed");
        const blob = await hfRes.blob();
        const fileName = `${brand_id}/${Date.now()}.jpg`;

        await supabase.storage.from('campaign-assets').upload(fileName, blob, { contentType: 'image/jpeg' });
        const { data: { publicUrl } } = supabase.storage.from('campaign-assets').getPublicUrl(fileName);

        await supabase.from('assets').insert({ brand_id, file_path: fileName, file_type: 'image', metadata: { prompt } });

        // Deduct
        await supabase.from('user_credits').update({ credits_remaining: currentCredits - 1 }).eq('brand_id', brand_id).eq('agent_type', 'visual');

        return new Response(JSON.stringify({ success: true, imageUrl: publicUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 })
    }
})
