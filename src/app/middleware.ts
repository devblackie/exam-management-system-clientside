// app/middleware.ts

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';


// const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// export function middleware(request: NextRequest) {
//   const publicRoutes = ['/', '/auth/login', '/auth/register'];
//   const { pathname } = request.nextUrl;

//   // Allow public routes
//   if (publicRoutes.includes(pathname)) {
//     return NextResponse.next();
//   }

//   // Check for token in cookies or Authorization header
//   const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return NextResponse.redirect(new URL('/auth/login', request.url));
//   }

//   try {
//     // Verify JWT token
//     verify(token, JWT_SECRET);
//     return NextResponse.next();
//   } catch (error) {
//     console.error('JWT verification failed:', error);
//     return NextResponse.redirect(new URL('/auth/login', request.url));
//   }
// }

// export const config = {
//   matcher: [
//     '/((?!_next|api|_next/static|_next/image|favicon.ico|icons|public).*)',
//   ],
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Convert your secret to a Uint8Array for 'jose'
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-secret-for-dev-only'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Define Route Access
  const isPublicRoute = pathname === '/login' || pathname === '/';
  
  // 2. Handle Public Access
  if (isPublicRoute) {
    // If user is already logged in and tries to access login page, 
    // redirect them to their dashboard instead of showing login
    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET);
        return NextResponse.redirect(new URL(getDashboardRoute(payload.role as string), request.url));
      } catch (e) {
       const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
      }
    }
    return NextResponse.next();
  }

  // 3. Handle Protected Access
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    // 4. Role-Based Authorization
    // Prevent a lecturer from accessing /admin, etc.
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    if (pathname.startsWith('/coordinator') && payload.role !== 'coordinator') {
       return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch  {
    // Token expired or tampered with
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token'); // Clear the bad cookie
    return response;
  }
}

// Helper to match your existing redirect logic
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
     * - Logo.png (your assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|Logo.png|.*\\.png$).*)',
    
  ],
};