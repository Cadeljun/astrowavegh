import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/events',
  '/admin/users',
  '/admin/cms',
  '/admin/gallery',
  '/admin/talent',
  '/admin/contacts',
  '/admin/inquiries',
  '/admin/uploads',
  '/admin/platform',
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

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))

  // For API routes, check for authorization header
  if (isProtectedApi) {
    const authHeader = request.headers.get('authorization')
    
    // In production, you should verify the Firebase ID token here
    // For now, we'll block requests without auth header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow GET requests to some endpoints
      if (request.method === 'GET' && pathname.includes('/folders')) {
        // Still need auth for folders
        return NextResponse.json(
          { error: 'Unauthorized. Authentication required.' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      )
    }
  }

  // For admin pages, we can't verify auth server-side without Firebase Admin
  // But we can add security headers
  const response = NextResponse.next()

  // Add security headers to all responses
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://res.cloudinary.com https://images.unsplash.com https://picsum.photos https://placehold.co data: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.cloudinary.com; frame-src 'self' https://*.firebaseapp.com;"
  )

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'https://astrowavegh.com',
      'https://www.astrowavegh.com',
      'https://astrowaveegh.netlify.app',
      'http://localhost:3000',
      'http://localhost:9003',
    ]

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    } else {
      // For same-origin requests (no origin header)
      response.headers.set('Access-Control-Allow-Origin', 'https://astrowavegh.com')
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
