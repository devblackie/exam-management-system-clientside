// clientside/src/context/AuthContext.tsx

"use client";

import {
  createContext, useContext, useEffect, useState, useCallback,
} from "react";
import {
  me, logout,
  checkEmail      as apiCheckEmail,
  verifyPassword  as apiVerifyPassword,
  verifyOtp       as apiVerifyOtp,
} from "@/api/authApi";
import type { User as ApiUser, EmailCheckResult, PasswordVerifyResult } from "@/api/types";
import { usePathname } from "next/navigation";

// ── Public route list ─────────────────────────────────────────────────────────
//
// SYNC REQUIREMENT: Keep this in sync with isPublicPath() in middleware.ts.
// If middleware.ts gets a new public route, add it here too.
// If this list has a route that middleware doesn't, you get client-side
// jank but not a hard redirect. Missing from middleware is the fatal case.
//
const PUBLIC_PREFIXES = [
  "/login",
  "/coordinator-secret",
  "/secret-register",     // ← admin bootstrap — must be here AND in middleware
  "/reset-password",
  "/register",            // /register/:token — invite acceptance
  "/unauthorized",
  "/demo",                // Interactive demo
  "/signup",              // Pilot request form
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

function getDashboardRoute(role: string): string {
  switch (role?.toLowerCase()) {
    case "admin":       return "/admin";
    case "lecturer":    return "/lecturer/upload";
    case "coordinator": return "/coordinator";
    default:            return "/";
  }
}

// ── Context type ──────────────────────────────────────────────────────────────

interface AuthContextType {
  user:           ApiUser | null;
  loading:        boolean;
  checkEmail:     (email: string)    => Promise<EmailCheckResult>;
  verifyPassword: (password: string) => Promise<PasswordVerifyResult>;
  verifyOTP:      (otp: string)      => Promise<string>;
  logoutUser:     ()                 => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname              = usePathname();

  // ── Session restore on mount ──────────────────────────────────────────────
  // Skip me() on public routes — no point calling the backend when we know
  // the user is not expected to have a session (and it avoids a 401 on
  // /secret-register, /demo, etc.)
  useEffect(() => {
    if (isPublicRoute(pathname)) {
      setLoading(false);
      return;
    }
    me()
      .then(user  => setUser(user))
      .catch(()   => setUser(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 1: check email ───────────────────────────────────────────────────
  const checkEmail = useCallback(
    (email: string): Promise<EmailCheckResult> => apiCheckEmail(email),
    [],
  );

  // ── Step 2: verify password ───────────────────────────────────────────────
  const verifyPassword = useCallback(
    (password: string): Promise<PasswordVerifyResult> => apiVerifyPassword(password),
    [],
  );

  // ── Step 3: verify OTP → set user → navigate ─────────────────────────────
  const verifyOTP = useCallback(async (otp: string): Promise<string> => {
    await apiVerifyOtp(otp);

    // Canary call — confirms the session cookie was accepted by the backend
    const user = await me();
    setUser(user);

    const destination = getDashboardRoute(user.role);

    // Hard navigation sends the new cookie fresh on the next request.
    // router.push() is soft navigation and may not pick up the new cookie.
    window.location.href = destination;
    return destination;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } catch {
      // Clear state even if the server call fails (e.g. network error)
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, checkEmail, verifyPassword, verifyOTP, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};