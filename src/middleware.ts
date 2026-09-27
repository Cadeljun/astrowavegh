import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
  const isAdminSubdomain = hostname.includes('admin.astrowavegh.com')
  const isDevSubdomain = hostname.includes('dev.astrowavegh.com')

  // ── SCAN SUBDOMAIN ────────────────────────────────────────────
  if (isScanSubdomain) {
    const isAllowed = ['/scan', '/scan/login', '/_next', '/api/tickets', '/api/paystack'].some(r => pathname.startsWith(r)) || pathname.includes('.')
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/scan', request.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // ── TICKETS SUBDOMAIN ─────────────────────────────────────────
  if (isTicketSubdomain) {
    const isAllowed = ['/tickets', '/tickets/verify', '/tickets/preview', '/_next', '/api/paystack', '/api/tickets'].some(r => pathname.startsWith(r)) || pathname.includes('.')
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/tickets', request.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // ── ADMIN SUBDOMAIN ───────────────────────────────────────────
  if (isAdminSubdomain) {
    const isAllowed = ['/admin', '/auth', '/_next', '/api'].some(r => pathname.startsWith(r)) || pathname.includes('.')
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // ── DEV SUBDOMAIN ─────────────────────────────────────────────
  if (isDevSubdomain) {
    const isAllowed = ['/dev', '/_next', '/api'].some(r => pathname.startsWith(r)) || pathname.includes('.')
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/dev', request.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  // ── MAIN DOMAIN ───────────────────────────────────────────────
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
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=*, microphone=(), geolocation=()')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
