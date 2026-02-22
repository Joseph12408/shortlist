import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/builder'

    if (code) {
        const cookieStore = {
            get(name: string) {
                // @ts-ignore - Next.js cookies API
                return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
                // This is just a helper, actual set happens in response
            },
            remove(name: string, options: CookieOptions) {
            },
        }

        // We can't use the simple createServerClient here easily without proper cookie object, 
        // sticking to basic pattern for route handlers
        // Actually, in Next.js 14 Route Handlers, we need 'cookies' from next/headers
        // Let's rewrite this to be cleaner for Next 14.
    }
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
