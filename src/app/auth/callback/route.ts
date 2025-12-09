import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/verified'

    console.log(`[Auth Callback] Processing request for ${origin}`);
    console.log(`[Auth Callback] Code present: ${!!code}`);

    if (code) {
        const supabase = await createClient()

        // PKCE Flow: Exchange code for session
        // Note: This often fails on cross-device (mobile) because the 'code_verifier' cookie is missing.
        // However, the link click itself verified the email at Supabase level.
        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) throw error
            console.log("[Auth Callback] Exchange success. Session created.");
        } catch (error: any) {
            const isPkceError = error?.code === 'validation_failed' || error?.name === 'AuthApiError';
            if (isPkceError) {
                console.warn("[Auth Callback] PKCE verification failed (likely cross-device). Email is verified, but auto-login skipped.");
                // We perform a "soft" redirect to login with verified param as a fallback
                // But typically we still want to show the /verified page first
            } else {
                console.error("[Auth Callback] Exchange Error:", error)
                return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
            }
        }
    } else {
        // This log is noisy for double-clicks or pre-fetches
        console.log("[Auth Callback] No auth code found in URL (possibly handled or direct access).");
    }

    // Force redirect to the verified page
    const redirectUrl = `${origin}${next}`
    console.log(`[Auth Callback] Redirecting to: ${redirectUrl}`);

    return NextResponse.redirect(redirectUrl)
}
