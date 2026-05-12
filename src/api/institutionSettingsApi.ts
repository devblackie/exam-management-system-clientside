
// clientside/src/api/institutionSettingsApi.ts
import api from "@/config/axiosInstance";
import type {
  InstitutionSettings,
  InstitutionRuleSet,
  DocumentMeta,
  GradeEntry,
  WAAClassification,
  School,
  Department,
  } from "./types";

export type { InstitutionSettings, InstitutionRuleSet, DocumentMeta, GradeEntry };

export interface InstitutionSettingsInput {
  docMeta?:             Partial<DocumentMeta>;
  ruleSet?:             Partial<InstitutionRuleSet>;
  gradingScale?:        GradeEntry[];
  waaClassification?:   WAAClassification[];
  semesterWeights?:     Array<{ year: number; weight: number }>;
  enforceRegNoPattern?: boolean;
  supportedIntakes?:    ("JAN" | "MAY" | "SEPT")[];
}

export const getInstitutionSettings = async (): Promise<InstitutionSettings | null> => {
  try {
    const res = await api.get<InstitutionSettings>("/institution-settings");
    return res.data;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) return null;
    }
    throw error;
  }
};

export const saveInstitutionSettings = async (
  data: InstitutionSettingsInput,
): Promise<InstitutionSettings> => {
  const res = await api.post<InstitutionSettings>("/institution-settings", data);
  return res.data;
};

export const uploadInstitutionLogo = async (
  file: File,
): Promise<{ path: string }> => {
  const formData = new FormData();
  formData.append("logo", file);
  const res = await api.post<{ message: string; path: string }>(
    "/institution-settings/logo",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return { path: res.data.path };
};

export const getLogoPreviewUrl = (): string =>
  `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/institution-settings/logo`;

export const upsertSchool = async (school: Omit<School, "_id" | "departments"> & {
  departments?: Department[];
}): Promise<{ message: string }> => {
  const res = await api.patch<{ message: string }>(
    "/institution-settings/schools",
    { school },
  );
  return res.data;
};

export const upsertDepartment = async (
  schoolCode:  string,
  department:  Omit<Department, "_id">,
): Promise<{ message: string }> => {
  const res = await api.patch<{ message: string }>(
    `/institution-settings/schools/${schoolCode}/departments`,
    { department },
  );
  return res.data;
};

// clientside/src/api/institutionSettingsApi.ts — ADD this export

export const updateDepartmentRegPatterns = async (
  schoolCode:   string,
  deptCode:     string,
  regNoPatterns: Array<{
    prefix:       string;
    separator:    string;
    yearDigits:   number;
    example:      string;
    manualRegex?: string;
  }>,
): Promise<{ message: string }> => {
  const res = await api.patch<{ message: string }>(
    `/institution-settings/schools/${schoolCode}/departments/${deptCode}/reg-patterns`,
    { regNoPatterns },
  );
  return res.data;
};