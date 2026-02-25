import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Protect Dashboard Routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. Protect Admin Routes
    if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
        // Optimization: Check for 'role' in app_metadata or user_metadata first (JWT Custom Claim)
        const jwtRole = user.app_metadata?.role || user.user_metadata?.role;

        if (jwtRole !== 'admin') {
            // Fallback for users where the custom claim hasn't been set yet
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            
            if (!profile || profile.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}
