import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (!user.email_confirmed_at) {
            return NextResponse.redirect(new URL('/login?error=Please%20verify%20your%20email%20first', request.url))
        }
    }

    // Redirect to homepage if logged in and trying to access login
    if (request.nextUrl.pathname === '/login') {
        if (user) {
            // Optional: Block access to homepage if unverified?
            // User requested "without confirming ... user should not be given access".
            // Assuming this means access to the *app* (dashboard). Homepage usually remains public.
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/auth/callback'],
}
