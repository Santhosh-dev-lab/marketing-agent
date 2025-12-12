# Manual Deployment Guide

# Manual Deployment Guide

## 1. Database Migration
Run the contents of:
1. [migration.sql](file:///d:/marketing-agent/migration.sql)
2. [supabase/migrations/20251212_brand_strategy.sql](file:///d:/marketing-agent/supabase/migrations/20251212_brand_strategy.sql)
3. [supabase/migrations/20251212_voice_settings.sql](file:///d:/marketing-agent/supabase/migrations/20251212_voice_settings.sql)
in your Supabase SQL Editor.

## 2. Deploy Functions
Copy the code below into your Supabase Edge Functions. These versions include **auto-retry** mechanisms to handle `503 Service Unavailable` and `429 Rate Limit` errors.

### A. extract-tone (Result: Robust with Retries)
```typescript
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
                await new Promise(r => setTimeout(r, backoff * (i + 1))); 
                continue;
            }
            return res; 
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
```

### B. brand-twin-ingest
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PageScanResult {
    url: string;
    status: 'success' | 'failed' | 'empty';
    chunks_found: number;
    title?: string;
    details?: string;
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

// Gemini Embeddings Logic w/ Retry
async function generateEmbeddingsGemini(texts: string[], geminiKey: string): Promise<number[][]> {
    if (!geminiKey) throw new Error("Missing GEMINI_API_KEY");

    // Google Gemini API: batchEmbedContents
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${geminiKey}`;

    const allEmbeddings: number[][] = [];
    const batchSize = 10;

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        // Clean text: escape quotes/newlines
        const requests = batch.map(text => ({
            model: "models/text-embedding-004",
            content: { parts: [{ text: text }] }
        }));

        const response = await fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests })
        });

        const result = await response.json();
        // Result: { embeddings: [ { values: [...] }, ... ] }
        if (result.embeddings) {
            allEmbeddings.push(...result.embeddings.map((e: any) => e.values));
        }
    }
    return allEmbeddings;
}

async function scrapePage(url: string, baseUrl: string): Promise<{ chunks: string[], report: PageScanResult }> {
    const report: PageScanResult = { url, status: 'failed', chunks_found: 0 };
    try {
        console.log(`[Crawler] Visiting: ${url}`);
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarketingAgentBot/1.0; +http://example.com/bot)' } });

        if (!response.ok) {
            report.details = `HTTP ${response.status}`;
            return { chunks: [], report };
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        report.title = $('title').text().trim() || 'No Title';

        $('script, style, nav, footer, iframe, noscript, svg, [role="alert"], header, .nav, .menu, .sidebar').remove();

        const chunks: string[] = [];
        const semanticSelectors = 'article, main, .content, .post, #content, #main';
        $(semanticSelectors).find('h1, h2, h3, h4, p, li').each((_, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.length > 25) chunks.push(text);
        });

        if (chunks.length < 3) {
            $('div, td, table, section').each((_, el) => {
                const clone = $(el).clone();
                clone.find('div, table').remove();
                const text = clone.text().replace(/\s+/g, ' ').trim();
                if (text.length > 40 && text.split(' ').length > 5) chunks.push(text);
            });
        }

        if (chunks.length === 0) {
            const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
            if (bodyText.length > 50) {
                chunks.push(...(bodyText.match(/.{1,600}/g) || []));
                report.details = "Used fallback body scraping";
            }
        }

        const unique = [...new Set(chunks)];
        report.chunks_found = unique.length;
        report.status = unique.length > 0 ? 'success' : 'empty';
        return { chunks: unique, report };
    } catch (e) {
        console.error(`[Crawler] Error scraping ${url}:`, e);
        report.details = e.message;
        return { chunks: [], report };
    }
}

async function getInternalLinks(url: string): Promise<string[]> {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const baseUrlObj = new URL(url);
        const links: string[] = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;
            try {
                const absoluteUrl = new URL(href, url);
                if (absoluteUrl.hostname === baseUrlObj.hostname && !absoluteUrl.pathname.match(/\.(jpg|png|pdf|zip|css|js)$/i)) {
                    links.push(absoluteUrl.href);
                }
            } catch { }
        });
        return [...new Set(links)];
    } catch { return []; }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { url, brand_id } = await req.json()
        if (!url || !brand_id) throw new Error("URL and brand_id are required");

        const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? '';

        // 1. Check Credits
        const { data: credits, error: creditErr } = await supabase
            .from('user_credits')
            .select('*')
            .eq('brand_id', brand_id)
            .eq('agent_type', 'brand_twin')
            .single();

        let currentCredits = 3;
        if (!credits && !creditErr) {
            await supabase.from('user_credits').insert({ brand_id, agent_type: 'brand_twin', credits_remaining: 3 });
        } else if (credits) {
            currentCredits = credits.credits_remaining;
        }

        if (currentCredits <= 0) {
            return new Response(JSON.stringify({ success: false, error: "Insufficient credits. Please upgrade." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 });
        }

        console.log(`[Brand Twin] Credits: ${currentCredits}. Starting Deep Ingest for: ${url}`);

        // 2. Crawl
        const scanReports: PageScanResult[] = [];
        const allChunks: { content: string, url: string }[] = [];
        const homeLinks = await getInternalLinks(url);
        
        // DEEP SCRAPE UPDATE
        const pagesToScrape = [url, ...homeLinks.slice(0, 14)]; 
        const visited = new Set<string>();

        for (const pageUrl of pagesToScrape) {
            if (visited.has(pageUrl)) continue;
            visited.add(pageUrl);
            const result = await scrapePage(pageUrl, url);
            scanReports.push(result.report);
            result.chunks.forEach(chunk => allChunks.push({ content: chunk, url: pageUrl }));
        }

        if (allChunks.length === 0) {
            return new Response(JSON.stringify({ success: false, message: "No content found.", scan_report: scanReports }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
        }

        // Limit chunks
        const uniqueContent = new Set();
        const safeChunks: { content: string, url: string }[] = [];
        for (const item of allChunks) {
            if (!uniqueContent.has(item.content) && safeChunks.length < 200) { 
                uniqueContent.add(item.content);
                safeChunks.push(item);
            }
        }

        // 3. Embed with Gemini
        console.log(`[Brand Twin] Embedding ${safeChunks.length} chunks via Gemini...`);
        let embeddings: number[][] = [];
        try {
            embeddings = await generateEmbeddingsGemini(safeChunks.map(c => c.content), GEMINI_API_KEY);
        } catch (apiError) {
            return new Response(JSON.stringify({ error: "Gemini Embedding failed: " + apiError.message, scan_report: scanReports }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
        }

        if (embeddings.length !== safeChunks.length) {
            const minLen = Math.min(embeddings.length, safeChunks.length);
            safeChunks.length = minLen;
            embeddings.length = minLen;
        }

        // 4. Store
        const records = safeChunks.map((item, i) => ({
            brand_id, content: item.content, embedding: embeddings[i], source_type: 'website', metadata: { url: item.url }
        }));

        await supabase.from('memories').insert(records);

        // 5. Deduct Credit
        await supabase.from('user_credits').update({ credits_remaining: currentCredits - 1 }).eq('brand_id', brand_id).eq('agent_type', 'brand_twin');

        return new Response(JSON.stringify({ success: true, pages_crawled: visited.size, chunks_ingested: records.length, scan_report: scanReports, credits_remaining: currentCredits - 1 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } })

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 })
    }
})
```

### C. generate-campaign (Result: Robust with Retries)
```typescript
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
```
