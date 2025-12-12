import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { brand_id, website_url } = await req.json();

        if (!brand_id || !website_url) throw new Error("Missing brand_id or website_url");

        // 1. Crawl Strategy: Jina AI (Primary) -> Cheerio (Fallback)
        console.log(`Crawling ${website_url}...`);
        let scrapedData = { markdown: "", title: "" };
        const JINA_KEY = Deno.env.get('JINA_API_KEY');

        try {
            // Priority 1: Jina AI (Advanced Config)
            console.log("Attempting Jina AI...");
            const headers: any = {
                'X-With-Generated-Alt': 'true',     // AI captions for images
                'X-With-Links-Summary': 'true',     // Append links section at bottom
                'X-With-Images-Summary': 'true',    // Append images section at bottom
                'X-Respond-With': 'markdown'
            };
            if (JINA_KEY) headers['Authorization'] = `Bearer ${JINA_KEY}`;

            const crawlerRes = await fetch(`https://r.jina.ai/${website_url}`, { headers });
            
            if (crawlerRes.ok) {
                const markdown = await crawlerRes.text();
                const titleMatch = markdown.match(/^# (.*$)/m);
                scrapedData.title = titleMatch ? titleMatch[1] : "Website Analysis";
                scrapedData.markdown = markdown.substring(0, 15000);
            } else {
                console.warn(`Jina AI failed (${crawlerRes.status}). using fallback.`);
                throw new Error("Jina failed");
            }
        } catch (jinaError) {
             // Priority 2: Cheerio Fallback
             console.log("Falling back to Cheerio Basic Scraper...");
             try {
                const res = await fetch(website_url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarketingAgentBot/1.0)' }
                });
                
                if (!res.ok) throw new Error(`Basic fetch failed: ${res.status}`);
                
                const html = await res.text();
                const $ = cheerio.load(html);
                
                // Remove clutter
                $('script, style, nav, footer, iframe, svg').remove();
                
                scrapedData.title = $('title').text().trim() || "Website Analysis";
                const h1 = $('h1').map((_, el) => $(el).text().trim()).get().join('; ');
                const body = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 8000);
                
                // Convert to pseudo-markdown for the AI
                scrapedData.markdown = `# ${scrapedData.title}\n\n## H1: ${h1}\n\n${body}`;
             } catch (cheerioError) {
                 console.error("All crawlers failed:", cheerioError);
                 throw new Error("Could not crawl website. Please check URL complexity or add JINA_API_KEY.");
             }
        }

        // 2. Analyze with Gemini (Advanced Growth Engineering Prompt)
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
        const prompt = `
        You are a World-Class Growth Engineer and Chief Marketing Officer (CMO).
        Perform a comprehensive, deep-dive audit of the following website content (provided as Markdown).
        
        Target URL: ${website_url}
        Content Context:
        ---
        ${scrapedData.markdown}
        ---

        ### Your Mission
        Identify **5 to 7 critical, high-impact opportunities** to drastically improve this brand's online performance. 
        Do not provide generic advice. Look for specific gaps in the provided content.
        
        Focus your analysis on these three pillars:
        1. **Conversion Engineering (CRO)**:
           - Are the Calls to Action (CTAs) clear, compelling, and visible?
           - Is there sufficient Social Proof (testimonials, logos) above the fold?
        
        2. **Technical & Content SEO (Use Links/Images Data)**:
           - **Internal Linking**: Check the 'Links Summary' at the bottom. Are there key internal pages missing from the main navigation?
           - **Visual SEO**: Check the 'Images Summary'. do meaningful images exist? 
           - Is the content semantically rich or thin?

        3. **Brand Authority & UX**:
           - Does the tone build trust?
           - Are there visual or structural friction points?

        ### Output Format
        Return a strict JSON array of objects (no markdown, no explanations outside JSON):
        [
            { 
                "title": "Actionable, punchy title (e.g. 'Implement Sticky CTA on Mobile')", 
                "description": "Insight: [What is wrong]. \nAction: [Specific technical or content change to make]. \nImpact: [Expected Result].",
                "priority": "critical" | "high" | "medium"
            }
        ]
        `;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        const aiRes = await fetch(geminiUrl, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!aiRes.ok) throw new Error("AI Analysis Service failed: " + aiRes.statusText);
        
        const aiJson = await aiRes.json();
        let text = aiJson.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let tasks = [];
        try {
            tasks = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI JSON", text);
            throw new Error("AI returned invalid task format");
        }

        // 3. Insert Tasks
        const taskInserts = tasks.map((t: any) => ({
            brand_id,
            title: t.title,
            description: t.description,
            priority: ['high', 'medium', 'low', 'critical'].includes(t.priority?.toLowerCase()) ? t.priority.toLowerCase() : 'medium',
            status: 'todo',
            source_url: website_url
        }));

        const { error: insertError } = await supabase.from('tasks').insert(taskInserts);
        if (insertError) throw insertError;

        // 4. INGEST KNOWLEDGE (Brand Twin Merge)
        // We also want to "remember" this content for future AI generation (email, posts, etc.)
        console.log("Generating Embeddings for Brand Twin...");
        
        // chunking markdown roughly by paragraphs or headers
        const rawChunks = scrapedData.markdown.split(/\n\n+/).filter(c => c.length > 50);
        const chunks = rawChunks.slice(0, 20); // Limit to top 20 meaningful blocks to save tokens/time

        if (chunks.length > 0) {
            try {
                const embeddings = await generateEmbeddingsGemini(chunks, GEMINI_API_KEY);
                
                const memories = chunks.map((content, i) => ({
                    brand_id,
                    content: content.substring(0, 1000), // Limit char count per chunk
                    embedding: embeddings[i],
                    source_type: 'website_crawl',
                    metadata: { url: website_url, title: scrapedData.title }
                })).filter((_, i) => embeddings[i]); // Ensure embedding exists

                if (memories.length > 0) {
                     await supabase.from('memories').insert(memories);
                     console.log(`Ingested ${memories.length} memory chunks.`);
                }
            } catch (embedError) {
                console.error("Embedding generation failed:", embedError);
                // We do not fail the whole request if embedding fails, as the user primarily wants tasks
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            tasks: taskInserts,
            ingested_memories: chunks.length 
        }), { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
        });
    }
});

// Helper: Generate Embeddings
async function generateEmbeddingsGemini(texts: string[], geminiKey: string): Promise<number[][]> {
    if (!geminiKey) return []; // Should throw, but safe fallback
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${geminiKey}`;
    
    // Batching is handled by caller (slice 20), but Gemini accepts up to 100 usually.
    const requests = texts.map(text => ({
        model: "models/text-embedding-004",
        content: { parts: [{ text: text }] }
    }));

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Gemini Embedding API Error:", err);
        throw new Error(`Gemini API Error: ${response.status}`);
    }

    const result = await response.json();
    return result.embeddings?.map((e: any) => e.values) || [];
}
