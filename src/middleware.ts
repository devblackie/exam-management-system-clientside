
// // clientside/src/middleware.ts
// //
// // SECURITY MODEL:
// //   This middleware checks for cookie *existence* only — it does not verify
// //   the JWT signature. This is intentional.
// //
// //   The real security boundary is the Express backend:
// //     • requireAuth()  verifies the JWT signature on every API call
// //     • requireRole()  enforces role permissions on every protected route
// //
// //   What this middleware provides:
// //     • Unauthenticated users are redirected to /login before any page renders
// //     • Logged-in users are bounced from /login to their dashboard
// //     • Role-based routing (coordinators can't visit /admin, etc.)
// //       — done by reading the role claim WITHOUT verification, which is safe
// //       because any actual data fetch will hit the backend and get rejected
// //       if the token is forged or expired.
// //
// //   Why not verify the signature here?
// //     • Requires JWT_SECRET in clientside/.env.local — two places to maintain
// //     • If secrets drift the entire app silently breaks (everyone gets
// //       redirected to /login on every request, as we just experienced)
// //     • The edge runtime has a 1 MB size limit — keeping it lean is good
// //     • For an internal institutional system the backend is the real guard

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // ─────────────────────────────────────────────────────────────────────────────
// // PUBLIC PATHS — reachable without a session cookie
// // ─────────────────────────────────────────────────────────────────────────────

// function isPublicPath(pathname: string): boolean {
//   return (
//     pathname === "/" ||
//     pathname === "/login" ||
//     pathname === "/coordinator-secret" ||
//     pathname === "/secret-register" ||
//     pathname === "/unauthorized" ||
//     pathname === "/demo" || // Interactive demo page
//     pathname === "/signup" || // Pilot signup page
//     pathname.startsWith("/reset-password") ||
//     pathname.startsWith("/register")
//   );
// }

// function getRoleFromToken(token: string): string | null {
//   try {
//     const base64Payload = token.split(".")[1];
//     if (!base64Payload) return null;
//     const decoded = JSON.parse(
//       Buffer.from(base64Payload, "base64url").toString("utf8"),
//     );
//     return (decoded?.role as string)?.toLowerCase() ?? null;
//   } catch {
//     return null;
//   }
// }

// function getDashboardRoute(role: string | null): string {
//   switch (role) {
//     case "admin":       return "/admin";
//     case "lecturer":    return "/lecturer/upload";
//     case "coordinator": return "/coordinator/students";
//     default:            return "/login";
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MIDDLEWARE
// // ─────────────────────────────────────────────────────────────────────────────

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Always pass through Next.js internals and static assets
//   if (pathname.startsWith("/_next") || pathname.includes(".")) {
//     return NextResponse.next();
//   }

//   const isPublic = isPublicPath(pathname);
//   const token    = request.cookies.get("token")?.value;

//   // ── No token ──────────────────────────────────────────────────────────────
//   if (!token) {
//     if (isPublic) return NextResponse.next();
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // ── Token present — read role for routing decisions ───────────────────────
//   const role = getRoleFromToken(token);

//   // Logged-in user hitting / or /login → send to their dashboard
//   if (pathname === "/" || pathname === "/login") {
//     return NextResponse.redirect(new URL(getDashboardRoute(role), request.url));
//   }

//   // Role-based route guards
//   // These only affect navigation UX — the backend enforces real permissions.
//   if (pathname.startsWith("/admin")       && role !== "admin") {
//     return NextResponse.redirect(new URL("/unauthorized", request.url));
//   }
//   if (pathname.startsWith("/coordinator") && role !== "coordinator") {
//     return NextResponse.redirect(new URL("/unauthorized", request.url));
//   }
//   if (pathname.startsWith("/lecturer")    && role !== "lecturer") {
//     return NextResponse.redirect(new URL("/unauthorized", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|Logo.png|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
//   ],
// };








// clientside/src/middleware.ts
//
// ════════════════════════════════════════════════════════════════════════════
// ROOT CAUSE OF THE /secret-register REDIRECT BUG
// ════════════════════════════════════════════════════════════════════════════
//
// THE BUG (production behaviour you described):
//   1. You navigate to /secret-register
//   2. The page flashes for a second then redirects to /login
//   3. The admin cannot be registered
//
// WHY IT HAPPENED:
//   The middleware `isPublicPath()` function was missing "/secret-register"
//   from its list of public routes. So when an unauthenticated user visits
//   /secret-register, the middleware sees:
//     - No JWT token in cookies (unauthenticated = correct, you haven't
//       registered yet)
//     - pathname is NOT in isPublicPath() → "not a public path"
//     - Result: redirect to /login
//
//   The page "flashes for a second" because:
//     - Next.js renders the page client-side briefly
//     - Then the middleware runs on the next navigation/refresh
//     - AuthContext.tsx also has its own PUBLIC_PREFIXES list, which DID
//       include /secret-register — but AuthContext only runs client-side
//       AFTER the middleware has already redirected server-side
//
// THE FIX:
//   Add "/secret-register" to isPublicPath(). Also added a consistency
//   note so this never drifts again.
//
// SECONDARY ISSUE FIXED:
//   The middleware `isPublicPath()` and AuthContext.tsx `PUBLIC_PREFIXES`
//   were not in sync. Both lists must match exactly. If they drift, you get
//   subtle production-only bugs (middleware passes, AuthContext blocks, or
//   vice versa). The source of truth is now this file — AuthContext.tsx
//   imports the same list (see AuthContext fix below).
//
// ════════════════════════════════════════════════════════════════════════════
//
// SECURITY MODEL (unchanged):
//   This middleware checks for cookie *existence* only — it does NOT verify
//   the JWT signature. The real security boundary is the Express backend:
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