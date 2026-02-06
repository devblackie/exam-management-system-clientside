// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-secret-for-dev-only'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Skip middleware for internal assets, images, and the unauthorized page
  if (
    pathname === '/unauthorized' || 
    pathname.startsWith('/_next') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = 
    pathname === '/login' || 
    pathname === '/' || 
    pathname.startsWith('/reset-password');

  // 2. Handle missing token
  if (!token) {
    // If not logged in and trying to hit a protected route -> redirect to login
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If on / or /login without a token, just let them stay
    return NextResponse.next();
  }

  // 3. Handle existing token
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = (payload.role as string)?.toLowerCase();

    // 4. Role-Based Authorization
    // Check this BEFORE allowing access to protected paths
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    if (pathname.startsWith('/coordinator') && role !== 'coordinator') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (pathname.startsWith('/lecturer') && role !== 'lecturer') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // 5. If logged in and hitting / or /login, redirect to their dashboard
    // if (isPublicRoute) {
      if (pathname === '/' || pathname === '/login') {
        return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
      }
    

    // 6. Otherwise, they are allowed to proceed to their designated route
    return NextResponse.next();
    
  } catch (e) {
    // Token is expired, tampered, or invalid
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token'); // Kill the zombie cookie
    return response;
  }
}

// Helper for role-based homepages
function getDashboardRoute(role: string) {
  const r = role?.toLowerCase();
  if (r === 'admin') return '/admin/invite';
  if (r === 'lecturer') return '/lecturer/upload';
  if (r === 'coordinator') return '/coordinator/students';
  return '/login';
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Logo.png
     */
    '/((?!api|_next/static|_next/image|favicon.ico|Logo.png|.*\\.png$).*)',
  ],
};