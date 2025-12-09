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

        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) throw error
            console.log("[Auth Callback] Exchange success. Session created.");
        } catch (error: any) {
            const isPkceError = error?.code === 'validation_failed' || error?.name === 'AuthApiError';
            if (isPkceError) {
                console.log("[Auth Callback] Cross-Device Verification suspected. Email verified by Supabase, but session exchange failed (no cookie). Redirecting to Login.");
                // Since verification happened at Supabase level before redirect, we can treat this as "Verified".
                // We redirect to Login with a success message because we can't create a session on this device.
                return NextResponse.redirect(`${origin}/login?verified=true`)
            } else {
                console.error("[Auth Callback] Exchange Error:", error)
                return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
            }
        }
    } else {
        console.log("[Auth Callback] No auth code found in URL.");
    }

    // Force redirect to the verified page
    const redirectUrl = `${origin}${next}`
    console.log(`[Auth Callback] Redirecting to: ${redirectUrl}`);

    return NextResponse.redirect(redirectUrl)
}
