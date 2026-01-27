// clientside/src/api/adminApi.ts
import api from "@/config/axiosInstance";
import type { User, Invite, Role, Status } from "./types";





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

