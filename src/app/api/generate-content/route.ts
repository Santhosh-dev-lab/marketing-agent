import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/client"; // Note: This is client-side lib, for API route we usually want server/admin client or just use it with proper handling? 
// WAIT: The "client" lib usually uses browser auth. For API route, we should use @supabase/ssr or create a client with cookies.
// However, to keep it simple and consistent with the project structure (which seems to use client.ts often), I'll check how other API routes do it.
// Actually, for API routes, we need to extract the session token or use service role if strictly internal.
// Let's use standard creating client from request cookies if possible, or just standard "supabase-js" with anon key and forward the Auth header.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic, type, platform, brand_id } = body;

        // 1. Authenticate User & Initialize Supabase
        const cookieStore = cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch Brand Context
        // We use the passed brand_id or fetch the user's first brand
        let brandQuery = supabase.from('brands').select('*');
        if (brand_id) {
            brandQuery = brandQuery.eq('id', brand_id);
        } else {
            brandQuery = brandQuery.eq('user_id', user.id).limit(1);
        }

        const { data: brands, error: brandError } = await brandQuery;

        if (brandError || !brands || brands.length === 0) {
            return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
        }
        const brand = brands[0];

        // 3. Construct Context Prompt
        // Safe access to JSONB fields
        const toneVoice = brand.tone_voice; // Can be string or object based on schema history, assuming object from screenshot
        const persona = brand.audience_persona;
        const values = brand.brand_values;
        const industry = brand.industry || "General";

        let voiceDesc = "";
        if (typeof toneVoice === 'object' && toneVoice !== null) {
            // If it's the complex object seen in screenshot (archetype, adjectives, etc.)
            voiceDesc = `
            - Archetype: ${toneVoice.archetype || 'N/A'}
            - Tone: ${toneVoice.tone || 'Professional'}
            - Style: ${toneVoice.communication_style || 'Direct'}
            - Adjectives: ${Array.isArray(toneVoice.adjectives) ? toneVoice.adjectives.join(', ') : 'N/A'}
            `;
        } else {
            voiceDesc = String(toneVoice || "Professional and engaging");
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
        `;

        // 4. Generate with Gemini
        // Use Flash model for speed/free tier
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        return NextResponse.json({ content: responseText });

    } catch (e: any) {
        console.error("Content Generation Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
