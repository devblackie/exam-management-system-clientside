// src/api/lecturersApi.ts
import api from "@/config/axiosInstance";
import type { User } from "./types";

// Get lecturers
export async function getLecturers() {
  const res = await api.get<User[]>("/admin/lecturers");
  return res.data;
}

