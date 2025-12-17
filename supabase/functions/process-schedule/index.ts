import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Service Role Key is required to bypass RLS for background processing
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Note: In production, use SUPABASE_SERVICE_ROLE_KEY. 
        // For now, ensuring we have it or fall back to Anon (which won't work for cron jobs usually if no user session).
        // Actually, for cron, we MUST use Service Role.

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Find posts that are scheduled and due
        const now = new Date().toISOString();
        const { data: duePosts, error: fetchError } = await supabase
            .from('posts')
            .select('*, brands(*), auth.users(email)') // Fetch brand and user email
            .eq('status', 'scheduled')
            .lte('scheduled_at', now);

        if (fetchError) throw fetchError;

        const results = [];

        // 2. Process each post
        if (duePosts && duePosts.length > 0) {
            for (const post of duePosts) {
                console.log(`Processing Post ${post.id} for ${post.platform}`);

                // SIMULATION: Sending Email
                // In a real app, use Resend or equivalent.
                const userEmail = post.users?.email || "unknown";

                console.log(`[MOCK EMAIL] To: ${userEmail}`);
                console.log(`[MOCK EMAIL] Subject: Your ${post.platform} post is live!`);
                console.log(`[MOCK EMAIL] Body: \n"${post.content}"\n\n(Auto-uploaded to ${post.platform})`);

                // 3. Mark as Published
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({
                        status: 'published',
                        published_at: now,
                        updated_at: now
                    })
                    .eq('id', post.id);

                if (!updateError) {
                    results.push({ id: post.id, status: 'published', email_sent_to: userEmail });
                } else {
                    console.error(`Failed to update post ${post.id}`, updateError);
                    results.push({ id: post.id, status: 'failed', error: updateError.message });
                }
            }
        }

        return new Response(JSON.stringify({ processed: results.length, details: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Worker Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
