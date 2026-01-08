import api from "@/config/axiosInstance";
import axios from "axios";

export type Role = "admin" | "lecturer" | "coordinator";
export type Status = "active" | "suspended";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: string;
}

export interface Invite {
  _id: string;
  email: string;
  role: "lecturer" | "coordinator";
  used: boolean;
  expiresAt: string;
  createdAt: string;
  name: string;
}



// --- Error handler ---
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return "Unknown error occurred";
}

// --- User management ---
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

// --- Invites ---
export async function getInvites() {
  return api.get<Invite[]>("/admin/invites");
}

export async function revokeInvite(id: string) {
  return api.delete<{ message: string }>(`/admin/invites/${id}`);
}

export function getInviteLink(token: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register/${token}`;
}


