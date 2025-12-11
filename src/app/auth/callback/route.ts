import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/verified'

    // Read intent from cookies
    const cookieStore = await cookies()
    const intent = cookieStore.get('auth_intent')?.value

    console.log(`[Auth Callback] Processing request for ${origin}`);
    console.log(`[Auth Callback] Integrity Check: v2`);
    console.log(`[Auth Callback] Code present: ${!!code}`);

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            const { user } = data;

            // Strict Sign In Check
            if (intent === 'signin') {
                const createdAt = new Date(user.created_at).getTime();
                const now = Date.now();

                // If created in last 15 seconds
                if (now - createdAt < 15000) {
                    console.log("[Auth Callback] New user detected during Sign In intent. Deleting user.");

                    // Initialize Admin Client for Deletion
                    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                    if (serviceRoleKey) {
                        try {
                            const { createClient: createAdminClient } = await import('@supabase/supabase-js');
                            const supabaseAdmin = createAdminClient(
                                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                serviceRoleKey
                            );
                            await supabaseAdmin.auth.admin.deleteUser(user.id);
                            console.log("[Auth Callback] User deleted successfully.");
                        } catch (delError) {
                            console.error("[Auth Callback] Failed to delete user:", delError);
                        }
                    } else {
                        console.warn("SUPABASE_SERVICE_ROLE_KEY missing. Signing out only.");
                        await supabase.auth.signOut();
                    }
                    return NextResponse.redirect(`${origin}/login?error=Account not found. Please Sign Up to continue.&view=signup`)
                }
            }

            // Valid Session
            console.log("[Auth Callback] Session created successfully.");
            const redirectUrl = `${origin}${next}`
            return NextResponse.redirect(redirectUrl)

        } else {
            console.error("[Auth Callback] Exchange Error:", error);
            // Handling PKCE or other errors gracefully
            if (error?.code === 'validation_failed') {
                return NextResponse.redirect(`${origin}/login?verified=true`)
            }
            return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
        }
    }

    console.log("[Auth Callback] No auth code found.");
    return NextResponse.redirect(`${origin}/login?error=no_code`)
}
