import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes allowed on main domain (admin, dev, api)
const MAIN_ALLOWED = [
  '/admin',
  '/dev',
  '/api',
  '/auth',
  '/_next',
  '/favicon',
  '/logo',
]

// Routes allowed on tickets subdomain
const TICKET_ROUTES = ['/tickets', '/tickets/verify', '/tickets/preview', '/_next', '/api/paystack', '/api/tickets']

// Routes allowed on scan subdomain
const SCAN_ROUTES = ['/scan', '/scan/login', '/_next', '/api/tickets']

// Protected API routes
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

  const isTicketSubdomain = hostname.includes('tickets.astrowavegh.com')
  const isScanSubdomain = hostname.includes('scan.astrowavegh.com')

  // ── SCAN SUBDOMAIN ────────────────────────────────────────────
  if (isScanSubdomain) {
    const isAllowed = SCAN_ROUTES.some(r => pathname.startsWith(r)) || pathname.includes('.')
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/scan', request.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // ── TICKETS SUBDOMAIN ─────────────────────────────────────────
  if (isTicketSubdomain) {
    const isAllowed = TICKET_ROUTES.some(r => pathname.startsWith(r)) || pathname.includes('.')
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/tickets', request.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // ── MAIN DOMAIN LOCKDOWN ──────────────────────────────────────
  // Only admin, dev, api, auth routes allowed on main domain
  const isAllowed = MAIN_ALLOWED.some(r => pathname.startsWith(r)) || pathname.includes('.')
  
  if (!isAllowed) {
    // Redirect everything else to tickets subdomain
    return NextResponse.redirect(new URL('https://tickets.astrowavegh.com/tickets', request.url))
  }

  // ── API AUTH CHECK ────────────────────────────────────────────
  const isProtectedApi = protectedApiRoutes.some(r => pathname.startsWith(r))
  if (isProtectedApi) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return addSecurityHeaders(NextResponse.next())
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
