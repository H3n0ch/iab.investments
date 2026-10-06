import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Refreshes the Supabase session (admin, auth pages, offer detail pages) and guards /admin. Fine-grained admin check
// (ADMIN_EMAILS allowlist) happens in app/admin/layout.tsx.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // '/:slug/:id' also matches /_next/image etc. – skip those cheaply
  if (request.nextUrl.pathname.startsWith('/_next/') || request.nextUrl.pathname.startsWith('/ratgeber/')) return supabaseResponse

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/admin') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/login' || pathname === '/registrieren')) {
    const next = request.nextUrl.searchParams.get('redirectTo')
    const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
    return NextResponse.redirect(new URL(target, request.url))
  }

  return supabaseResponse
}

export const config = {
  // Public marketing pages stay static – only run on auth-relevant routes.
  // '/:slug/:id' = offer detail pages, which show gated content to signed-in users.
  matcher: ['/admin/:path*', '/login', '/registrieren', '/passwort-neu', '/:slug/:id'],
}
