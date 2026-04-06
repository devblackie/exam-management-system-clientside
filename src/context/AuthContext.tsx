// clientside/src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  me, logout, checkEmail as apiCheckEmail, verifyPassword as apiVerifyPassword, verifyOtp as apiVerifyOtp,
} from "@/api/authApi";
import type { User as ApiUser, EmailCheckResult, PasswordVerifyResult } from "@/api/types";
import { usePathname } from "next/navigation";

// ─── Public paths — must match middleware.ts ──────────────────────────────────

const PUBLIC_PREFIXES = ["/login", "/coordinator-secret", "/secret-register", "/reset-password", "/register", "/unauthorized"];

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

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user:           ApiUser | null;
  loading:        boolean;
  checkEmail:     (email: string)    => Promise<EmailCheckResult>;
  verifyPassword: (password: string) => Promise<PasswordVerifyResult>;
  verifyOTP:      (otp: string)      => Promise<string>;
  logoutUser:     ()                 => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // ── Session restore on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (isPublicRoute(pathname)) {
      setLoading(false);
      return;
    }
    // me() now returns User directly, not AxiosResponse<User>
    me()
      .then(user => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 1 ────────────────────────────────────────────────────────────────
  // checkEmail returns EmailCheckResult directly
  const checkEmail = useCallback(
    (email: string): Promise<EmailCheckResult> => apiCheckEmail(email),
    [],
  );

  // ── Step 2 ────────────────────────────────────────────────────────────────
  // verifyPassword returns PasswordVerifyResult directly
  const verifyPassword = useCallback(
    (password: string): Promise<PasswordVerifyResult> => apiVerifyPassword(password),
    [],
  );

  // ── Step 3 ────────────────────────────────────────────────────────────────
  // verifyOtp returns User directly; me() returns User directly.
  const verifyOTP = useCallback(async (otp: string): Promise<string> => {
    await apiVerifyOtp(otp);

    // Canary call — confirms the session cookie was accepted
    const user = await me();
    setUser(user);

    const destination = getDashboardRoute(user.role);

    // Hard navigation — sends the new cookie fresh on the next request
    window.location.href = destination;
    return destination;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } catch {
      // Clear state even if server call fails
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