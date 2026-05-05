
// clientside/src/middleware.ts
//
// SECURITY MODEL:
//   This middleware checks for cookie *existence* only — it does not verify
//   the JWT signature. This is intentional.
//
//   The real security boundary is the Express backend:
//     • requireAuth()  verifies the JWT signature on every API call
//     • requireRole()  enforces role permissions on every protected route
//
//   What this middleware provides:
//     • Unauthenticated users are redirected to /login before any page renders
//     • Logged-in users are bounced from /login to their dashboard
//     • Role-based routing (coordinators can't visit /admin, etc.)
//       — done by reading the role claim WITHOUT verification, which is safe
//       because any actual data fetch will hit the backend and get rejected
//       if the token is forged or expired.
//
//   Why not verify the signature here?
//     • Requires JWT_SECRET in clientside/.env.local — two places to maintain
//     • If secrets drift the entire app silently breaks (everyone gets
//       redirected to /login on every request, as we just experienced)
//     • The edge runtime has a 1 MB size limit — keeping it lean is good
//     • For an internal institutional system the backend is the real guard

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC PATHS — reachable without a session cookie
// ─────────────────────────────────────────────────────────────────────────────

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/coordinator-secret" ||
    pathname === "/secret-register" ||
    pathname === "/unauthorized" ||
    pathname === "/demo" || // Interactive demo page
    pathname === "/signup" || // Pilot signup page
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/register")
  );
}

function getRoleFromToken(token: string): string | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const decoded = JSON.parse(
      Buffer.from(base64Payload, "base64url").toString("utf8"),
    );
    return (decoded?.role as string)?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function getDashboardRoute(role: string | null): string {
  switch (role) {
    case "admin":       return "/admin";
    case "lecturer":    return "/lecturer/upload";
    case "coordinator": return "/coordinator/students";
    default:            return "/login";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and static assets
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const isPublic = isPublicPath(pathname);
  const token    = request.cookies.get("token")?.value;

  // ── No token ──────────────────────────────────────────────────────────────
  if (!token) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Token present — read role for routing decisions ───────────────────────
  const role = getRoleFromToken(token);

  // Logged-in user hitting / or /login → send to their dashboard
  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
  }

  // Role-based route guards
  // These only affect navigation UX — the backend enforces real permissions.
  if (pathname.startsWith("/admin")       && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  if (pathname.startsWith("/coordinator") && role !== "coordinator") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  if (pathname.startsWith("/lecturer")    && role !== "lecturer") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|Logo.png|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};