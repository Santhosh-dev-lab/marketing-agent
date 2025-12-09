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
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error("[Auth Callback] Exchange Error:", error)
            return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
        }

        console.log("[Auth Callback] Exchange success. Session created.");
    } else {
        console.warn("[Auth Callback] No code found in URL.");
    }

    // Force redirect to the verified page
    const redirectUrl = `${origin}${next}`
    console.log(`[Auth Callback] Redirecting to: ${redirectUrl}`);

    return NextResponse.redirect(redirectUrl)
}
