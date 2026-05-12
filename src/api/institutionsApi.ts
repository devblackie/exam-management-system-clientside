
// clientside/src/api/institutionsApi.ts — EXTEND
import api from "@/config/axiosInstance";
import type { Institution } from "./types";

export const getPublicInstitutions = async (): Promise<Institution[]> => {
  const res = await api.get<Institution[]>("/institutions/public");
  return res.data;
};

export const getMyInstitution = async (): Promise<Institution> => {
  const res = await api.get<Institution>("/institutions/mine");
  return res.data;
};

export interface UpdateInstitutionInput {
  name?:         string;
  code?:         string;
  abbreviation?: string;
  address?:      string;
  website?:      string;
  email?:        string;
  phone?:        string;
  city?:         string;
  country?:      string;
}

export const updateMyInstitution = async (
  data: UpdateInstitutionInput,
): Promise<{ message: string; institution: Institution }> => {
  const res = await api.patch<{ message: string; institution: Institution }>(
    "/institutions/mine",
    data,
  );
  return res.data;
};