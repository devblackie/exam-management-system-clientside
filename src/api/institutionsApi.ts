// clientside/src/api/institutionsApi.ts
import api from "@/config/axiosInstance";
import type { Institution } from "./types";

export const getPublicInstitutions = async (): Promise<Institution[]> => {
  const res = await api.get<Institution[]>("/institutions/public");
  return res.data;
};