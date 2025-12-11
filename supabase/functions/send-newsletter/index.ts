import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Fetch News
        const news = await fetchMarketingNews();
        if (news.length === 0) {
            return new Response(JSON.stringify({ message: "No news found" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Fetch Subscribers
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: subscribers, error: dbError } = await supabase
            .from("subscribers")
            .select("email")
            .eq("status", "active");

        if (dbError) throw dbError;

        if (!subscribers || subscribers.length === 0) {
            return new Response(JSON.stringify({ message: "No subscribers found" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Prepare Email Content
        const emailHtml = generateEmailHtml(news);

        // 4. Send Emails (Batching recommended for prod, simple loop for MVP)
        const emailPromises = subscribers.map((sub: any) =>
            sendEmail(sub.email, emailHtml)
        );

        await Promise.allSettled(emailPromises);

        return new Response(JSON.stringify({ success: true, count: subscribers.length }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});

async function fetchMarketingNews() {
    const articles = [];

    // Strategy A: Reddit
    try {
        const subreddits = ['marketing', 'socialmedia', 'seo'];
        for (const sub of subreddits) {
            // Use a more standard User-Agent to avoid blocks
            const resp = await fetch(`https://www.reddit.com/r/${sub}/top.json?t=week&limit=5`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; MarketingAgent/1.0; +http://localhost)"
                }
            });

            if (resp.ok) {
                const data = await resp.json();
                data.data.children.forEach((post: any) => {
                    // Lower score threshold slightly to ensure we get meaningful data
                    if (!post.data.stickied && !post.data.is_self && post.data.score > 20) {
                        articles.push({
                            title: post.data.title,
                            url: post.data.url,
                            source: `r/${sub}`,
                            score: post.data.score
                        });
                    } else if (!post.data.stickied && post.data.is_self && post.data.score > 50) {
                        articles.push({
                            title: post.data.title,
                            url: `https://reddit.com${post.data.permalink}`,
                            source: `r/${sub} (Discussion)`,
                            score: post.data.score
                        });
                    }
                });
            } else {
                console.error(`Reddit fetch failed for ${sub}: ${resp.status}`);
            }
        }
    } catch (e) {
        console.error("Reddit fetch error", e);
    }

    // Strategy B: NewsAPI (if key exists)
    if (NEWS_API_KEY) {
        try {
            const resp = await fetch(`https://newsapi.org/v2/everything?q=marketing+AI&language=en&sortBy=popularity&apiKey=${NEWS_API_KEY}`);
            if (resp.ok) {
                const data = await resp.json();
                const topArticles = data.articles.slice(0, 3).map((a: any) => ({
                    title: a.title,
                    url: a.url,
                    source: a.source.name,
                    score: 999 // Boost news API results
                }));
                articles.push(...topArticles);
            }
        } catch (e) {
            console.error("NewsAPI error", e);
        }
    }

    // FALLBACK: If we don't have enough articles (e.g. APIs failed or blocked), fill with curated evergreen content
    if (articles.length < 5) {
        console.log("Not enough news found, adding fallback articles.");
        const fallbackArticles = [
            {
                title: "AI Will Shape the Future of Marketing",
                url: "https://professional.dce.harvard.edu/blog/ai-will-shape-the-future-of-marketing/",
                source: "Harvard Division of Continuing Education",
                score: 100
            },
            {
                title: "The Ultimate Guide to Digital Marketing Trends 2025",
                url: "https://blog.hubspot.com/marketing/marketing-trends",
                source: "HubSpot",
                score: 95
            },
            {
                title: "How to Build a Social Media Strategy in 2025",
                url: "https://sproutsocial.com/insights/social-media-marketing-strategy/",
                source: "Sprout Social",
                score: 90
            },
            {
                title: "SEO in the Age of AI: What You Need to Know",
                url: "https://moz.com/blog/seo-ai-era",
                source: "Moz",
                score: 85
            },
            {
                title: "Generative AI: The New Frontier for Content",
                url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai",
                source: "McKinsey",
                score: 80
            }
        ];

        // Append fallbacks until we have at least 5
        const needed = 5 - articles.length;
        articles.push(...fallbackArticles.slice(0, needed));
    }

    // Sort by score/relevance and take top 5
    return articles.sort((a, b) => b.score - a.score).slice(0, 5);
}

function generateEmailHtml(news: any[]) {
    const newsItems = news.map(item => `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
        <h3 style="margin: 0 0 5px 0;"><a href="${item.url}" style="color: #6d28d9; text-decoration: none;">${item.title}</a></h3>
        <p style="margin: 0; color: #666; font-size: 14px;">Source: ${item.source}</p>
    </div>
  `).join('');

    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #111; border-bottom: 2px solid #6d28d9; padding-bottom: 10px;">The Marketing Curve</h1>
        <p style="font-size: 16px; line-height: 1.5;">Here are this week's top marketing trends and discussions.</p>
        
        <div style="margin-top: 30px;">
            ${newsItems}
        </div>

        <div style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
            <p>You are receiving this because you subscribed to our weekly newsletter.</p>
            <p><a href="#" style="color: #999;">Unsubscribe</a></p>
        </div>
    </div>
  `;
}

async function sendEmail(to: string, html: string) {
    console.log(`Attempting to send email to ${to}`);

    if (!RESEND_API_KEY) {
        console.log(`[Simulation] No RESEND_API_KEY found. Simulated send to ${to}`);
        return;
    }

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Marketing Agent <onboarding@resend.dev>", // Default Resend test sender
                to: [to],
                subject: "Weekly Marketing Trends: " + new Date().toLocaleDateString(),
                html: html,
            }),
        });

        if (!res.ok) {
            const error = await res.text();
            console.error(`Resend API Error (${res.status}):`, error);
        } else {
            const data = await res.json();
            console.log(`Email sent successfully to ${to}. ID: ${data.id}`);
        }
    } catch (e) {
        console.error("Fetch error during email send:", e);
    }
}
