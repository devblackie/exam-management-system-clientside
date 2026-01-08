// app/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export function middleware(request: NextRequest) {
  const publicRoutes = ['/', '/auth/login', '/auth/register'];
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for token in cookies or Authorization header
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify JWT token
    verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|api|_next/static|_next/image|favicon.ico|icons|public).*)',
  ],
};