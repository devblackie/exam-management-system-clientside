// // clientside/src/hooks/queries/useInstitutionSettings.ts
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   getInstitutionSettings,
//   saveInstitutionSettings,
//   uploadInstitutionLogo,
//   upsertSchool,
//   upsertDepartment,
//   InstitutionSettingsInput,
// } from "@/api/institutionSettingsApi";

// export const SETTINGS_KEYS = {
//   settings: ["institutionSettings"] as const,
// };

// export const useInstitutionSettings = () =>
//   useQuery({
//     queryKey: SETTINGS_KEYS.settings,
//     queryFn: getInstitutionSettings,
//     staleTime: 5 * 60 * 1000,
//   });

// export const useSaveSettings = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (data: InstitutionSettingsInput) =>
//       saveInstitutionSettings(data),
//     onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// export const useUploadLogo = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (file: File) => uploadInstitutionLogo(file),
//     onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// export const useUpsertSchool = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: upsertSchool,
//     onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// export const useUpsertDepartment = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       schoolCode,
//       department,
//     }: {
//       schoolCode: string;
//       department: any;
//     }) => upsertDepartment(schoolCode, department),
//     onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };


// // clientside/src/hooks/queries/useInstitutionSettings.ts
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   getInstitutionSettings,
//   saveInstitutionSettings,
//   uploadInstitutionLogo,
//   upsertSchool,
//   upsertDepartment,
//   InstitutionSettingsInput,
// } from "@/api/institutionSettingsApi";

// export const SETTINGS_KEYS = {
//   settings: ["institutionSettings"] as const,
// };

// export const useInstitutionSettings = () =>
//   useQuery({
//     queryKey: SETTINGS_KEYS.settings,
//     queryFn: getInstitutionSettings,
//     staleTime: 5 * 60 * 1000,
//   });

// export const useSaveSettings = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data: InstitutionSettingsInput) => saveInstitutionSettings(data),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// export const useUploadLogo = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (file: File) => uploadInstitutionLogo(file),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// export const useUpsertSchool = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: upsertSchool,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// interface UpsertDepartmentParams {
//   schoolCode: string;
//   department: {
//     name: string;
//     shortName: string;
//     code: string;
//     hod?: string;
//     regNoPatterns?: Array<{
//       prefix: string;
//       separator: string;
//       yearDigits: number;
//       example: string;
//       manualRegex?: string;
//     }>;
//   };
// }

// export const useUpsertDepartment = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ schoolCode, department }: UpsertDepartmentParams) =>
//       upsertDepartment(schoolCode, department),
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };








// // clientside/src/hooks/queries/useInstitutionSettings.ts
// //
// // FIX: UpsertDepartmentParams.department was hand-rolled with regNoPatterns?
// // (optional), but upsertDepartment()'s second argument is typed as
// // Omit<Department, "_id">, where Department.regNoPatterns is RegNoPattern[]
// // (required). The mismatch caused:
// //
// //   Type 'undefined' is not assignable to type 'RegNoPattern[]'
// //
// // THE FIX — two layers:
// //
// // 1. Don't re-declare the department shape inline. Derive it directly from
// //    Omit<Department, "_id"> so the two types are always in sync.
// //
// // 2. If a caller genuinely needs regNoPatterns to be optional (because the UI
// //    lets you omit it), the right tool is Omit<Department, "_id" | "regNoPatterns">
// //    & { regNoPatterns?: RegNoPattern[] } — that is, explicitly opt it out of the
// //    required set and re-add it as optional. This is done in UpsertDepartmentParams
// //    below so callers can omit regNoPatterns and the API will receive an empty [].
// //    The mutationFn then normalises the value before passing it to upsertDepartment.

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import type { Department, RegNoPattern } from "@/api/types";
// import {
//   getInstitutionSettings,
//   saveInstitutionSettings,
//   uploadInstitutionLogo,
//   upsertSchool,
//   upsertDepartment,
//   type InstitutionSettingsInput,
// } from "@/api/institutionSettingsApi";

// export const SETTINGS_KEYS = {
//   settings: ["institutionSettings"] as const,
// };

// // ── useInstitutionSettings ────────────────────────────────────────────────────
// export const useInstitutionSettings = () =>
//   useQuery({
//     queryKey: SETTINGS_KEYS.settings,
//     queryFn:  getInstitutionSettings,
//     staleTime: 5 * 60 * 1000,
//   });

// // ── useSaveSettings ───────────────────────────────────────────────────────────
// export const useSaveSettings = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data: InstitutionSettingsInput) => saveInstitutionSettings(data),
//     onSuccess:  () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// // ── useUploadLogo ─────────────────────────────────────────────────────────────
// export const useUploadLogo = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (file: File) => uploadInstitutionLogo(file),
//     onSuccess:  () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// // ── useUpsertSchool ───────────────────────────────────────────────────────────
// export const useUpsertSchool = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: upsertSchool,
//     onSuccess:  () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };

// // ── UpsertDepartmentParams ────────────────────────────────────────────────────
// // We make regNoPatterns optional at the call-site (UI may not always supply it)
// // by splitting it out of Omit<Department, "_id"> and re-adding it as optional.
// // The mutationFn normalises the missing value to [] before calling upsertDepartment,
// // which still receives the required Omit<Department, "_id"> shape.
// type DepartmentInput =
//   // Everything in Department except _id and regNoPatterns …
//   Omit<Department, "_id" | "regNoPatterns"> &
//   // … then re-add regNoPatterns as optional
//   { regNoPatterns?: RegNoPattern[] };

// export interface UpsertDepartmentParams {
//   schoolCode: string;
//   department: DepartmentInput;
// }

// export const useUpsertDepartment = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ schoolCode, department }: UpsertDepartmentParams) => {
//       // Normalise: guarantee regNoPatterns is always RegNoPattern[] (never undefined)
//       // before passing to upsertDepartment, which expects Omit<Department, "_id">
//       const normalised: Omit<Department, "_id"> = {
//         ...department,
//         regNoPatterns: department.regNoPatterns ?? [],
//       };
//       return upsertDepartment(schoolCode, normalised);
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
//   });
// };


















import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Department, RegNoPattern } from "@/api/types";
import {
  getInstitutionSettings,
  saveInstitutionSettings,
  uploadInstitutionLogo,
  upsertSchool,
  upsertDepartment,
  updateDepartmentRegPatterns,
  type InstitutionSettingsInput,
} from "@/api/institutionSettingsApi";

export const SETTINGS_KEYS = {
  settings: ["institutionSettings"] as const,
};

// ── useInstitutionSettings ────────────────────────────────────────────────────
export const useInstitutionSettings = () =>
  useQuery({
    queryKey: SETTINGS_KEYS.settings,
    queryFn: getInstitutionSettings,
    staleTime: 5 * 60 * 1000,
  });

// ── useSaveSettings ───────────────────────────────────────────────────────────
export const useSaveSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InstitutionSettingsInput) => saveInstitutionSettings(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
  });
};

// ── useUploadLogo ─────────────────────────────────────────────────────────────
export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadInstitutionLogo(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
  });
};

// ── useUpsertSchool ───────────────────────────────────────────────────────────
export const useUpsertSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertSchool,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
  });
};

type DepartmentInput = Omit<Department, "_id">;

export interface UpsertDepartmentParams {
  schoolCode: string;
  department: DepartmentInput;
}

export const useUpsertDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolCode, department }: UpsertDepartmentParams) =>
      upsertDepartment(schoolCode, department),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
  });
};

// ── useUpdateDepartmentRegPatterns ────────────────────────────────────────────
export interface UpdateRegPatternsParams {
  schoolCode: string;
  deptCode: string;
  regNoPatterns: RegNoPattern[];
}

export const useUpdateDepartmentRegPatterns = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolCode, deptCode, regNoPatterns }: UpdateRegPatternsParams) =>
      updateDepartmentRegPatterns(schoolCode, deptCode, regNoPatterns),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.settings }),
  });
};