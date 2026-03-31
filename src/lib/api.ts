// import api from "@/config/axiosInstance";
// import axios from "axios";

// export type Role = "admin" | "lecturer" | "coordinator";
// export type Status = "active" | "suspended";

// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: Role;
//   status: Status;
//   createdAt: string;
// }

// export interface Invite {
//   _id: string;
//   email: string;
//   role: "lecturer" | "coordinator";
//   used: boolean;
//   expiresAt: string;
//   createdAt: string;
//   name: string;
// }



// // --- Error handler ---
// export function getErrorMessage(error: unknown): string {
//   if (axios.isAxiosError(error)) {
//     return error.response?.data?.message || error.message;
//   }
//   return "Unknown error occurred";
// }

// // --- User management ---
// export async function getUsers() {
//   return api.get<User[]>("/admin/users");
// }

// export async function updateUserRole(id: string, role: Role) {
//   return api.put<User>(`/admin/users/${id}/role`, { role });
// }

// export async function updateUserStatus(id: string, status: Status) {
//   return api.put<User>(`/admin/users/${id}/status`, { status });
// }

// export async function deleteUser(id: string) {
//   return api.delete<{ message: string }>(`/admin/users/${id}`);
// }

// // --- Auth ---
// export async function login(email: string, password: string) {
//   return api.post<User>("/auth/login", { email, password });
// }

// export async function verifyOtp(otp: string) {
//   return api.post<User>("/auth/verify-otp", { otp });
// }

// export async function checkEmail(email: string){
//   return api.post<User>("/auth/check-email",{ email });
// }

// export async function verifyPassword(password: string){
//   return api.post<User>("/auth/verify-password",{ password })
// }

// export async function registerWithInvite(token: string, password: string) {
//   return api.post<{ message: string }>(`/auth/register/${token}`, { password });
// }

// export async function sendInvite(email: string, role: Role, name: string) {
//   return api.post<{ message: string }>("/auth/invite", { email, role, name });
// }

// export async function me() {
//   return api.get<User>("/auth/me");
// }

// export async function logout() {
//   return api.post<{ message: string }>("/auth/logout");
// }

// // --- Invites ---
// export async function getInvites() {
//   return api.get<Invite[]>("/admin/invites");
// }

// export async function revokeInvite(id: string) {
//   return api.delete<{ message: string }>(`/admin/invites/${id}`);
// }

// export function getInviteLink(token: string) {
//   return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register/${token}`;
// }



// clientside/src/lib/api.ts
//
// All API calls to the backend go through this file.
// The AuthContext and all pages import from here.
//
// ── ARCHITECTURE NOTE ──────────────────────────────────────────────────────
// The backend uses httpOnly cookie-based sessions.
// The client NEVER handles tokens — they live in cookies sent automatically
// by the browser on every request (via axiosInstance's withCredentials: true).
//
// The 3-step login flow:
//   1. checkEmail    → server sets auth_step1 httpOnly cookie
//   2. verifyPassword → server verifies + sends OTP, sets auth_step2 cookie
//   3. verifyOtp     → server validates OTP, issues real session cookie
//
// After step 3, every call to any authenticated endpoint sends the session
// cookie automatically. No token management needed in this file.
//
// ── WHY verifyToken / User ARE NOT IMPORTED HERE ──────────────────────────
// verifyToken and the User mongoose model are SERVER-SIDE concerns.
// They are used in the requireAuth middleware (serverside/src/middleware/auth.ts)
// which runs BEFORE any route handler. By the time a route handler executes,
// req.user is already populated. This client-side file only needs to know
// what HTTP endpoints exist and what shapes they return.
// ─────────────────────────────────────────────────────────────────────────────

import api from "@/config/axiosInstance";
import axios from "axios";

// ─── Role / Status types ──────────────────────────────────────────────────────

export type Role   = "admin" | "lecturer" | "coordinator";
export type Status = "active" | "suspended";

// ─── User shape (returned by /auth/me and /admin/users) ───────────────────────

export interface User {
  _id:         string;
  name:        string;
  email:       string;
  role:        Role;
  status:      Status;
  institution?: string;
  createdAt:   string;
}

// ─── Invite shape ─────────────────────────────────────────────────────────────

export interface Invite {
  _id:       string;
  email:     string;
  role:      "lecturer" | "coordinator";
  used:      boolean;
  expiresAt: string;
  createdAt: string;
  name:      string;
}

// ─── Auth step response shapes ────────────────────────────────────────────────
// These must match exactly what the backend sends.

export interface EmailCheckResult {
  nextStep:    "password";
  maskedName?: string;    // e.g. "Joh***" — present for known accounts
}

export interface PasswordVerifyResult {
  requiresOTP: true;
  maskedEmail: string;    // e.g. "j***@gmail.com"
}

// ─── Error helper ─────────────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return "Unknown error occurred";
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

/**
 * Step 1 of login. Checks if the email exists and sets auth_step1 cookie.
 * Returns { nextStep: "password", maskedName? }
 */
export async function checkEmail(email: string) {
  return api.post<EmailCheckResult>("/auth/check-email", { email });
}

/**
 * Step 2 of login. Verifies password, sends OTP, sets auth_step2 cookie.
 * Returns { requiresOTP: true, maskedEmail }
 */
export async function verifyPassword(password: string) {
  return api.post<PasswordVerifyResult>("/auth/verify-password", { password });
}

/**
 * Step 3 of login. Validates OTP code, issues real session cookie.
 * Returns the authenticated User object.
 */
export async function verifyOtp(otp: string) {
  return api.post<User>("/auth/verify-otp", { otp });
}

/**
 * Returns the currently authenticated user from the session cookie.
 * Used on mount to restore session state.
 */
export async function me() {
  return api.get<User>("/auth/me");
}

/**
 * Clears the session cookie on the server.
 */
export async function logout() {
  return api.post<{ message: string }>("/auth/logout");
}

/**
 * Legacy single-step login — kept for compatibility.
 * Prefer the 3-step flow above for new pages.
 */
export async function login(email: string, password: string) {
  return api.post<User>("/auth/login", { email, password });
}

/**
 * Register a new user from an invite link.
 */
export async function registerWithInvite(token: string, password: string) {
  return api.post<{ message: string }>(`/auth/register/${token}`, { password });
}

/**
 * Send an invite email to a new user.
 */
export async function sendInvite(email: string, role: Role, name: string) {
  return api.post<{ message: string }>("/auth/invite", { email, role, name });
}

// ─── User management (admin only) ────────────────────────────────────────────

export async function getUsers() {
  return api.get<User[]>("/admin/users");
}

export async function updateUserRole(id: string, role: Role) {
  return api.put<User>(`/admin/users/${id}/role`, { role });
}

export async function updateUserStatus(id: string, status: Status) {
  return api.put<User>(`/admin/users/${id}/status`, { status });
}

export async function deleteUser(id: string) {
  return api.delete<{ message: string }>(`/admin/users/${id}`);
}

// ─── Invites (admin only) ─────────────────────────────────────────────────────

export async function getInvites() {
  return api.get<Invite[]>("/admin/invites");
}

export async function revokeInvite(id: string) {
  return api.delete<{ message: string }>(`/admin/invites/${id}`);
}

export function getInviteLink(token: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register/${token}`;
}


