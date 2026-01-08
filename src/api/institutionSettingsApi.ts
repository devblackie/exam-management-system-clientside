// clientside/src/api/institutionSettingsApi.ts
import api from "@/config/axiosInstance";
import type { InstitutionSettings, InstitutionSettingsInput } from "./types";

export const getInstitutionSettings = async (): Promise<InstitutionSettings | null> => {
  try {
    const res = await api.get<InstitutionSettings>("/institution-settings");
    return res.data;
  } catch (error: unknown) {
    // Properly typed error handling — no more "any"
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) return null;
    }
    throw error;
  }
};

export const saveInstitutionSettings = async (
  data: InstitutionSettingsInput
): Promise<InstitutionSettings> => {
  const res = await api.post<InstitutionSettings>("/institution-settings", data);
  return res.data;
};