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

// Gemini Embeddings Logic
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

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${err}`);
        }

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

        // DEEP SCRAPE UPDATE: Increased limit from 4 to 14 (Total 15 pages)
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
            // DEEP SCRAPE UPDATE: Increased limit from 50 to 200 chunks
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
