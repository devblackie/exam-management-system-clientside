import api from "@/config/axiosInstance";
import type { User, Role } from "./types"; 

// export type Role = "admin" | "lecturer" | "coordinator";
export type Status = "active" | "suspended";

// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: Role;
//   status: Status;
//   createdAt: string;
// }

// --- Auth ---
export async function login(email: string, password: string) {
  return api.post<User>("/auth/login", { email, password });
}

export async function registerWithInvite(token: string, password: string) {
  return api.post<{ message: string }>(`/auth/register/${token}`, { password });
}

export async function sendInvite(email: string, role: Role, name: string) {
  return api.post<{ message: string }>("/auth/invite", { email, role, name });
}

export async function me() {
  return api.get<User>("/auth/me");
}

export async function logout() {
  return api.post<{ message: string }>("/auth/logout");
}

export async function forgotPassword(email: string) {
  return api.post<{ message: string }>("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string) {
  return api.post<{ message: string }>(`/auth/reset-password/${token}`, {
    password,
  });
}
