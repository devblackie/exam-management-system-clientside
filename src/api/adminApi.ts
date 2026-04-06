// clientside/src/api/adminApi.ts
import api from "@/config/axiosInstance";
import type { User, Invite, Role, Status } from "./types";

 
// ─── User management ─────────────────────────────────────────────────────────
 
export async function getUsers(): Promise<User[]> {
  const res = await api.get<User[]>("/admin/users");
  return res.data;
}
 
export async function updateUserRole(id: string, role: Role): Promise<User> {
  const res = await api.put<User>(`/admin/users/${id}/role`, { role });
  return res.data;
}
 
export async function updateUserStatus(id: string, status: Status): Promise<User> {
  const res = await api.put<User>(`/admin/users/${id}/status`, { status });
  return res.data;
}
 
export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

// ─── Invites ──────────────────────────────────────────────────────────────────
 
export async function sendInvite(
  email: string,
  role: Role,
  name: string,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>("/admin/invite", {
    email: email.toLowerCase().trim(),
    role,
    name: name.trim(),
  });
  return res.data;
}
 
export async function getInvites(): Promise<Invite[]> {
  const res = await api.get<Invite[]>("/admin/invites");
  return res.data;
}
 
// export async function revokeInvite(id: string): Promise<void> {
//   await api.delete(`/admin/invites/${id}`);
// }

export async function revokeInvite(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/admin/invites/${id}`);
  return res.data;
}
 
export function getInviteLink(token: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/register/${token}`;
}


// ─── Lecturers ────────────────────────────────────────────────────────────────
 
export async function getLecturers(): Promise<User[]> {
  const res = await api.get<User[]>("/admin/lecturers");
  return res.data;
}

