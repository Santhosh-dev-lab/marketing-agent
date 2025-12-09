import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
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

    let user = null
    try {
        const { data } = await supabase.auth.getUser()
        user = data.user
    } catch (e) {
        // Suppress "Invalid Refresh Token" error mostly seen in dev
        console.error("Auth Middleware Error:", e)
    }

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
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/auth/callback'],
}
