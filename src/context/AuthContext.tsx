// clientside/src/context/AuthContext.tsx
// "use client";

// import { createContext, useCallback, useContext, useEffect, useState } from "react";
// import { me, login, logout, User as ApiUser, verifyOtp } from "@/lib/api";
// import { useRouter } from "next/navigation";

// export interface OTPChallenge {
//   requiresOTP: true;
//   maskedEmail: string;
// }

// interface AuthContextType {
//   user: ApiUser | null;
//   loading: boolean;
//   // loginUser: (email: string, password: string) => Promise<void>;
//   loginUser: (email: string, password: string) => Promise<OTPChallenge>;
//   verifyOTP: (otp: string) => Promise<void>;
//   logoutUser: () => Promise<void>;
// }

// interface ApiErrorResponse {
//   response?: {
//     data?: {
//       message?: string;
//     };
//   };
//   message: string;
// }
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<ApiUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     async function initAuth() {

//       if (window.location.pathname === "/login") {
//       setLoading(false);
//       return;
//     }
    
//       try {
//         const res = await me();
//         setUser(res.data);
//       } catch {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     }
//     initAuth();
//   }, []);

//   const redirectByRole = useCallback((role: string) => {
//     const r = role?.toLowerCase();
//     if      (r === "admin")       router.push("/admin/invite");
//     else if (r === "lecturer")    router.push("/lecturer/upload");
//     else if (r === "coordinator") router.push("/coordinator/students");
//     else                          router.push("/");
//   }, [router]);

//   const loginUser = useCallback(
//     async (email: string, password: string): Promise<OTPChallenge> => {
//       // In your api.ts, login is typed to return User, 
//       // but for 2FA flows, we override the expected data shape here.
//       const res = await login(email, password);
//       return res.data as unknown as OTPChallenge;
//     },
//     []
//   );

//   // const loginUser = useCallback(
//   //   async (email: string, password: string): Promise<OTPChallenge> => {
//   //     // This call will throw if credentials are wrong — let the page catch it
//   //     const res = await api.post<OTPChallenge>("/auth/login", { email, password });
//   //     // Server always returns requiresOTP: true now (2FA is mandatory)
//   //     return res.data;
//   //   },
//   //   []
//   // );

//   // async function loginUser(email: string, password: string) {
//   //   try {
//   //     await login(email, password);
//   //     const res = await me();
//   //     setUser(res.data);

//   //     // Middleware handles the "guards", but we still redirect
//   //     // the user into the app upon successful login.
//   //     const role = res.data.role?.toLowerCase();
//   //     if (role === "admin") router.push("/admin/invite");
//   //     else if (role === "lecturer") router.push("/lecturer/upload");
//   //     else if (role === "coordinator") router.push("/coordinator/students");
//   //     else router.push("/");
//   //   } catch (err: unknown) {
//   //     setUser(null);
//   //     // Re-throw the error so the component can read the status code/message
//   //     throw err;
//   //   }
//   // }

//   // async function logoutUser() {
//   //   try {
//   //     await logout();
//   //     setUser(null);
//   //     router.refresh(); // Refresh to trigger middleware redirect to /login
//   //     router.push("/login");
//   //   } catch (err) {
//   //     console.error("Logout failed", err);
//   //   }
//   // }

  

//   const verifyOTP = useCallback(async (otp: string): Promise<void> => {
//     // POST only the code — the cookie travels automatically
//     await verifyOtp(otp);
 
//     // Fetch the now-authenticated user
//     const meRes = await me();
//     setUser(meRes.data);
 
//     // Redirect
//     redirectByRole(meRes.data.role);
//   }, [redirectByRole]);

//   const logoutUser = useCallback(async () => {
//     try {
//       await logout();
//     } catch {
//       // Even if the request fails, clear local state
//     } finally {
//       setUser(null);
//       router.push("/login");
//     }
//   }, [router]);

//   return (
//     <AuthContext.Provider value={{ user, loading, loginUser, verifyOTP, logoutUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };

// // clientside/src/context/AuthContext.tsx
// // 3-step auth context — all API calls contained here
// //
// // The page only calls:
// //   checkEmail(email)    → { maskedName? } or throws
// //   verifyPassword(pw)   → { maskedEmail } or throws
// //   verifyOTP(otp)       → sets user + redirects, or throws
// //   logoutUser()
// //
// // No API calls, no tokens, no cookies visible to the page.
// // Cookies travel automatically via withCredentials: true.

// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
// } from "react";
// import api from "@/config/axiosInstance";
// import { useRouter } from "next/navigation";

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface AuthUser {
//   name:        string;
//   email:       string;
//   role:        "admin" | "lecturer" | "coordinator";
//   status?:     string;
//   institution?: string;
// }

// export interface EmailCheckResult {
//   nextStep:    "password";
//   maskedName?: string;    // first name — only present for known accounts
// }

// export interface PasswordResult {
//   requiresOTP: true;
//   maskedEmail: string;
// }

// interface AuthContextType {
//   user:           AuthUser | null;
//   loading:        boolean;
//   // Step 1: check email exists
//   checkEmail:     (email: string) => Promise<EmailCheckResult>;
//   // Step 2: verify password → triggers OTP send
//   verifyPassword: (password: string) => Promise<PasswordResult>;
//   // Step 3: verify OTP → sets user + redirects
//   verifyOTP:      (otp: string) => Promise<void>;
//   // Logout
//   logoutUser:     () => Promise<void>;
// }

// // ─── Context ─────────────────────────────────────────────────────────────────

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // ─── Provider ────────────────────────────────────────────────────────────────

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user,    setUser]    = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // ── Session restore on mount ──────────────────────────────────────────────
//   useEffect(() => {
//     const initAuth = async () => {
//       if (window.location.pathname === "/login") {
//         setLoading(false);
//         return;
//       }
//       try {
//         const res = await api.get<AuthUser>("/auth/me");
//         setUser(res.data);
//       } catch {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     initAuth();
//   }, []);

//   // ── Redirect by role ──────────────────────────────────────────────────────
//   const redirectByRole = useCallback((role: string) => {
//     const r = role?.toLowerCase();
//     if      (r === "admin")       router.push("/admin/invite");
//     else if (r === "lecturer")    router.push("/lecturer/upload");
//     else if (r === "coordinator") router.push("/coordinator/students");
//     else                          router.push("/");
//   }, [router]);

//   // ── Step 1: checkEmail ────────────────────────────────────────────────────
//   // POSTs email to /auth/check-email.
//   // Server sets auth_step1 httpOnly cookie (fingerprint-bound).
//   // Returns { nextStep: "password", maskedName? }
//   // Throws on network/validation error.
//   const checkEmail = useCallback(async (email: string): Promise<EmailCheckResult> => {
//     const res = await api.post<EmailCheckResult>("/auth/check-email", { email });
//     return res.data;
//   }, []);

//   // ── Step 2: verifyPassword ────────────────────────────────────────────────
//   // POSTs password to /auth/verify-password.
//   // Browser sends auth_step1 cookie automatically.
//   // Server verifies, sends OTP, sets auth_step2 cookie, clears auth_step1.
//   // Returns { requiresOTP: true, maskedEmail }
//   // Throws on wrong password / lockout / expired session.
//   const verifyPassword = useCallback(async (password: string): Promise<PasswordResult> => {
//     const res = await api.post<PasswordResult>("/auth/verify-password", { password });
//     return res.data;
//   }, []);

//   // ── Step 3: verifyOTP ─────────────────────────────────────────────────────
//   // POSTs OTP code to /auth/verify-otp.
//   // Browser sends auth_step2 cookie automatically.
//   // Server validates OTP, clears pending cookies, issues real session cookie.
//   // We then call /auth/me to populate user state and redirect.
//   const verifyOTP = useCallback(async (otp: string): Promise<void> => {
//     await api.post("/auth/verify-otp", { otp });
//     const meRes = await api.get<AuthUser>("/auth/me");
//     setUser(meRes.data);
//     redirectByRole(meRes.data.role);
//   }, [redirectByRole]);

//   // ── Logout ────────────────────────────────────────────────────────────────
//   const logoutUser = useCallback(async () => {
//     try {
//       await api.post("/auth/logout");
//     } catch {
//       // Clear local state even if request fails
//     } finally {
//       setUser(null);
//       router.push("/login");
//     }
//   }, [router]);

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, checkEmail, verifyPassword, verifyOTP, logoutUser }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // ─── Hook ─────────────────────────────────────────────────────────────────────

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };



// clientside/src/context/AuthContext.tsx
// 3-step auth context — all API calls contained here
//
// The page only calls:
//   checkEmail(email)    → { maskedName? } or throws
//   verifyPassword(pw)   → { maskedEmail } or throws
//   verifyOTP(otp)       → sets user + redirects, or throws
//   logoutUser()
//
// No API calls, no tokens, no cookies visible to the page.
// Cookies travel automatically via withCredentials: true.

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  me,
  logout,
  checkEmail    as apiCheckEmail,
  verifyPassword as apiVerifyPassword,
  verifyOtp      as apiVerifyOtp,
  User           as ApiUser,
  EmailCheckResult,
  PasswordVerifyResult,
} from "@/lib/api";
import { useRouter } from "next/navigation";


interface AuthContextType {
  user:    ApiUser | null;
  loading: boolean;
 
  /** Step 1: Check the email exists. Returns { nextStep, maskedName? }. */
  checkEmail:     (email: string)    => Promise<EmailCheckResult>;
 
  /** Step 2: Verify password, trigger OTP send. Returns { requiresOTP, maskedEmail }. */
  verifyPassword: (password: string) => Promise<PasswordVerifyResult>;
 
  /** Step 3: Submit OTP code. Sets user state and redirects on success. */
  verifyOTP:      (otp: string)      => Promise<void>;
 
  /** Sign out and clear local state. */
  logoutUser:     ()                 => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── Session restore on mount ──────────────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      if (window.location.pathname === "/login") {
        setLoading(false);
        return;
      }
      try {
        const res = await me();
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // ── Redirect by role ──────────────────────────────────────────────────────
  const redirectByRole = useCallback((role: string) => {
    const r = role?.toLowerCase();
    if      (r === "admin")       router.push("/admin/invite");
    else if (r === "lecturer")    router.push("/lecturer/upload");
    else if (r === "coordinator") router.push("/coordinator/students");
    else                          router.push("/");
  }, [router]);

  // ── Step 1: checkEmail ────────────────────────────────────────────────────
  // POSTs email to /auth/check-email.
  // Server sets auth_step1 httpOnly cookie (fingerprint-bound).
  // Returns { nextStep: "password", maskedName? }
  // Throws on network/validation error.
  const checkEmail = useCallback(async (email: string): Promise<EmailCheckResult> => {
    // apiCheckEmail is the imported function from lib/api — not recursive
    const res = await apiCheckEmail(email);
    return res.data;
  }, []);

  // ── Step 2: verifyPassword ────────────────────────────────────────────────
  // POSTs password to /auth/verify-password.
  // Browser sends auth_step1 cookie automatically.
  // Server verifies, sends OTP, sets auth_step2 cookie, clears auth_step1.
  // Returns { requiresOTP: true, maskedEmail }
  // Throws on wrong password / lockout / expired session.
  const verifyPassword = useCallback(async (password: string): Promise<PasswordVerifyResult> => {
    const res = await apiVerifyPassword(password);
    return res.data;
  }, []);

  // ── Step 3: verifyOTP ─────────────────────────────────────────────────────
  // POSTs OTP code to /auth/verify-otp.
  // Browser sends auth_step2 cookie automatically.
  // Server validates OTP, clears pending cookies, issues real session cookie.
  // We then call /auth/me to populate user state and redirect.
  const verifyOTP = useCallback(async (otp: string): Promise<void> => {
    // After verifyOtp the server issues a real session cookie.
    // We then call me() to populate user state.
    await apiVerifyOtp(otp);
    const meRes = await me();
    setUser(meRes.data);
    redirectByRole(meRes.data.role);
  }, [redirectByRole]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } catch {
      // Clear local state even if request fails
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, loading, checkEmail, verifyPassword, verifyOTP, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};