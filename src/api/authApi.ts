// clientside/src/api/authApi.ts
import api from "@/config/axiosInstance";

import type { User, Role, EmailCheckResult, PasswordVerifyResult } from "./types";


// ─── 3-Step login flow ────────────────────────────────────────────────────────

/** Step 1 — check email exists, sets auth_step1 cookie */
export async function checkEmail(email: string): Promise<EmailCheckResult> {
  const res = await api.post<EmailCheckResult>("/auth/check-email", { email });
  return res.data;
}

/** Step 2 — verify password, send OTP, sets auth_step2 cookie */
export async function verifyPassword(
  password: string,
): Promise<PasswordVerifyResult> {
  const res = await api.post<PasswordVerifyResult>("/auth/verify-password", {
    password,
  });
  return res.data;
}

/** Step 3 — verify OTP, issues real session cookie */
export async function verifyOtp(otp: string): Promise<User> {
  const res = await api.post<User>("/auth/verify-otp", { otp });
  return res.data;
}

export async function login(email: string, password: string) {
  return api.post<User>("/auth/login", { email, password });
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function me(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

// ─── Password recovery ────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/auth/forgot-password", {
    email: email.toLowerCase().trim(),
  });
  return res.data;
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(
    `/auth/reset-password/${token}`,
    { password },
  );
  return res.data;
}




// ─── Registration ─────────────────────────────────────────────────────────────

export async function registerWithInvite(
  token: string,
  password: string,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(
    `/admin/register/${token}`,
    { password },
  );
  return res.data;
}

// ─── Legacy (kept for any remaining imports) ──────────────────────────────────

export async function sendInvite(
  email: string,
  role: Role,
  name: string,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/admin/invite", {
    email,
    role,
    name,
  });
  return res.data;
}
