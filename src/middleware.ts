import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that should NOT be redirected to /tickets on main domain
const ALLOWED_ROUTES = [
  '/tickets',
  '/scanner',
  '/admin',
  '/dev',
  '/api',
  '/auth',
  '/_next',
  '/favicon',
]

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/dev',
]

// API routes that require authentication
const protectedApiRoutes = [
  '/api/admin/create-user',
  '/api/cloudinary/delete',
  '/api/cloudinary/upload',
  '/api/cloudinary/upload-brand',
  '/api/cloudinary/folders',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // ── TICKET SUBDOMAIN ──────────────────────────────────────────
  // If on tickets.astrowavegh.com, serve ticket/scanner pages
  const isTicketSubdomain = hostname.includes('tickets.astrowavegh.com')

  if (isTicketSubdomain) {
    // On ticket subdomain, redirect non-ticket/scanner routes to /tickets
    const isTicketRoute = pathname.startsWith('/tickets') || 
                          pathname.startsWith('/scanner') ||
                          pathname.startsWith('/_next') ||
                          pathname.startsWith('/api/tickets') ||
                          pathname.includes('.')

    if (!isTicketRoute) {
      return NextResponse.redirect(new URL('/tickets', request.url))
    }

    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    return response
  }

  // ── MAIN DOMAIN LOCKDOWN ──────────────────────────────────────
  // Redirect all public pages to /tickets on main domain
  const isAllowedRoute = ALLOWED_ROUTES.some(route => pathname.startsWith(route))
  
  if (!isAllowedRoute) {
    return NextResponse.redirect(new URL('/tickets', request.url))
  }

  // ── API AUTH CHECK ────────────────────────────────────────────
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))

  if (isProtectedApi) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      )
    }
  }

  // ── SECURITY HEADERS ──────────────────────────────────────────
  const response = NextResponse.next()

  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://res.cloudinary.com https://images.unsplash.com https://picsum.photos https://placehold.co data: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.cloudinary.com; frame-src 'self' https://*.firebaseapp.com;"
  )

  // ── CORS FOR API ROUTES ───────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://astrowavegh.com',
      'https://www.astrowavegh.com',
      'https://tickets.astrowavegh.com',
      'https://staging.astrowavegh.com',
      'http://localhost:3000',
      'http://localhost:9003',
    ]

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    } else {
      response.headers.set('Access-Control-Allow-Origin', 'https://astrowavegh.com')
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
