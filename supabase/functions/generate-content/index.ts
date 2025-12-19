import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // ... (rest of the logic stays same)
        // 1. Check API Key
        const apiKey = Deno.env.get('GROQ_API_KEY');
        if (!apiKey) {
            throw new Error("Missing GROQ_API_KEY secret");
        }

        // 2. Initialize Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
        const authHeader = req.headers.get('Authorization');

        if (!supabaseUrl || !supabaseKey || !authHeader) {
            throw new Error("Missing Supabase configuration or Authorization header");
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } },
        })

        // 3. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error("Auth Error:", authError);
            throw new Error("Unauthorized: Invalid token");
        }

        // 4. Parse Body
        let body;
        try {
            body = await req.json();
        } catch (e) {
            throw new Error("Invalid JSON body");
        }
        const { topic, type, platform, brand_id } = body;

        // 5. Fetch Brand
        let brandQuery = supabase.from('brands').select('*')
        if (brand_id) {
            brandQuery = brandQuery.eq('id', brand_id)
        } else {
            brandQuery = brandQuery.eq('user_id', user.id).limit(1)
        }

        const { data: brands, error: brandError } = await brandQuery

        if (brandError) {
            throw new Error(`Database Error: ${brandError.message}`);
        }
        if (!brands || brands.length === 0) {
            throw new Error('Brand profile not found. Please create a brand first.');
        }
        const brand = brands[0]

        // 6. Context Preparation
        const toneVoice = brand.tone_voice
        const persona = brand.audience_persona
        const values = brand.brand_values
        const industry = brand.industry || "General"

        let voiceDesc = ""
        if (typeof toneVoice === 'object' && toneVoice !== null) {
            voiceDesc = `
        - Archetype: ${toneVoice.archetype || 'N/A'}
        - Tone: ${toneVoice.tone || 'Professional'}
        - Style: ${toneVoice.communication_style || 'Direct'}
        - Adjectives: ${Array.isArray(toneVoice.adjectives) ? toneVoice.adjectives.join(', ') : 'N/A'}
        `
        } else {
            voiceDesc = String(toneVoice || "Professional and engaging")
        }

        const systemPrompt = `
    You are an expert Social Media Manager for a brand in the ${industry} industry.
    
    BRAND IDENTITY:
    - Name: ${brand.name}
    - Voice & Tone: ${voiceDesc}
    - Target Audience: ${JSON.stringify(persona || "General Public")}
    - Core Values: ${JSON.stringify(values || "Quality, Integrity")}
    
    YOUR TASK:
    Generate ${type} content for ${platform} about "${topic}".
    
    REQUIREMENTS:
    - Strict adherence to the brand voice described above.
    - Use appropriate hashtags for ${platform}.
    - Format with emojis if the tone allows.
    - Output ONLY the content (caption/post), no conversational filler.
    `

        // 7. Generate with Groq (Llama 3.1 70B)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Generate content for ${platform} about: ${topic}` }
                ],
                model: 'llama-3.1-70b-versatile',
                temperature: 0.7,
                max_tokens: 1024,
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Groq API Error:", errData);
            throw new Error(`Groq API Error: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "No content generated.";

        return new Response(JSON.stringify({ content: content }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        const msg = error instanceof Error ? error.message : "Internal Server Error";
        console.error("Function Error:", msg);
        return new Response(JSON.stringify({ error: msg }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
