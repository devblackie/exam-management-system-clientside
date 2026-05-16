// clientside/src/middleware.ts


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── PUBLIC PATHS ──────────────────────────────────────────────────────────────
//
// RULE: Any route that an unauthenticated user must be able to reach goes here.
//
// SYNC REQUIREMENT: This list MUST match PUBLIC_PREFIXES in AuthContext.tsx.
// If you add a route here, add it there too. If you forget, you get the
// "flash and redirect" bug described above.
//
// Use startsWith() matching — so "/register" covers "/register/abc123token"
// and "/reset-password" covers "/reset-password/abc123token".

const PUBLIC_EXACT: ReadonlySet<string> = new Set([
  "/",
  "/lead-capture",
  "/login",
  "/demo",           // Interactive demo (no auth needed — has its own email gate)
  "/signup",         // Pilot request form
  "/unauthorized",
  "/secret-register", // ← THIS WAS MISSING — the root cause of the bug
]);

const PUBLIC_PREFIX: ReadonlyArray<string> = [
  "/register",        // /register/:token — invite acceptance
  "/reset-password",  // /reset-password/:token
  "/coordinator-secret", // Legacy admin bootstrap path
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIX.some(prefix => pathname.startsWith(prefix));
}

// ── JWT role reader (no signature verification — intentional, see above) ──────
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

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through Next.js internals and static assets
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const isPublic = isPublicPath(pathname);
  const token    = request.cookies.get("token")?.value;

  // ── No token ──────────────────────────────────────────────────────────────
  // Unauthenticated user:
  //   - Public page  → allow through
  //   - Protected page → redirect to /login
  if (!token) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Token present ─────────────────────────────────────────────────────────
  const role = getRoleFromToken(token);

  // Logged-in user hitting a login/landing page → send to their dashboard
  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
  }

  // Logged-in user hitting /secret-register → let them through
  // (they may be registering a second admin, or setting up a new institution)
  // The backend validates the ADMIN_SECRET regardless of auth state.

  // ── Role-based route guards ───────────────────────────────────────────────
  // These only affect navigation UX — the backend enforces real permissions.
  // A forged token still gets rejected by requireAuth() on every API call.
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
  // Match all routes except Next.js internals and common static file extensions.
  // The `pathname.includes(".")` check in the middleware body catches the rest.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|Logo.png|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};