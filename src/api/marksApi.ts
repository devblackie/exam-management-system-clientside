// // clientside/src/api/marksApi.ts
// import axiosInstance from "@/config/axiosInstance";
// import api from "@/config/axiosInstance";
// import { AcademicYear } from "./types";

// export interface UploadResult {
//   message: string;
//   total: number;
//   success: number;
//   errors: string[];
// }

// // Upload marks via CSV/Excel file 
// export async function uploadMarks(file: File, 
//   templateMode: "detailed" | "direct" = "detailed"): Promise<UploadResult> {
//   const formData = new FormData();
//   formData.append("file", file);

//   const endpoint = templateMode === "direct" ? "/marks/upload-direct" : "/marks/upload";

//   // const res = await api.post<UploadResult>("/marks/upload", formData, {
//   //   headers: { "Content-Type": "multipart/form-data" },
//   // });

//   const res = await api.post<UploadResult>(endpoint, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

//   return res.data;
// }

// export const downloadTemplate = async (
// programId: string, unitId: string, academicYearId: string, yearOfStudy: number, semester: number, examMode: string, unitType: string, templateMode: "detailed" | "direct" = "detailed") => {
//   // --- Defensive Check ADDED HERE ---
//   if (!programId || !unitId || !academicYearId || !yearOfStudy || !semester) {
//     console.error(
//       "Download Failed: Missing required program or year/semester parameters."
//     );
//     // Throw a specific error to be caught by the calling component
//     throw new Error(
//       "Please select the Program, Unit, Academic Year, Year of Study, and Semester before downloading the template."
//     );
//   }
//   try {
//     // 2. Determine the Route based on templateMode
//     // Assuming your backend has:
//     // GET /marks/template (Detailed)
//     // GET /marks/template-direct (New Direct Entry)
//     const endpoint = templateMode === "direct" ? "/marks/direct-template" : "/marks/template";
//     // Construct the query string with the required parameters
//     const params = new URLSearchParams({
//       programId,
//       unitId,
//       academicYearId,
//       yearOfStudy: yearOfStudy.toString(),
//       semester: semester.toString(),
//       examMode, unitType,
//       ...(templateMode === "detailed" && { examMode, unitType }),
//     }).toString();

//     // Make the GET request with the parameters
//     // const response = await axiosInstance.get(`/marks/template?${params}`, {
//     // const response = await axiosInstance.get(`/marks/direct-template?${params}`, {
//     const response = await axiosInstance.get(`${endpoint}?${params}`, {
//       responseType: "blob", // Important for downloading files
//     });

//     // --- EXTRACT FILENAME FROM HEADER ---
//     // let fileName = "scoresheet-template.xlsx";
//     let fileName = templateMode === "direct" ? "Scoresheet.xlsx" : "Scoresheet.xlsx";
//     const contentDisposition = response.headers["content-disposition"];

//     if (contentDisposition) {
//       // This regex looks for filename= and captures everything up to .xlsx
//       // It ignores any trailing quotes or semicolon garbage
//       const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
//       if (fileNameMatch?.[1]) {
//         fileName = fileNameMatch[1];

//         // 2. Safety Net: If it ends in .xlsx_ or just has a trailing _, clean it
//         fileName = fileName
//           .replace(/_+$/, "") // Remove underscores at the very end
//           .replace(/\.xlsx_$/, ".xlsx") // Specifically fix .xlsx_
//           .trim();
//       }
//     }
//     // Create a blob URL and trigger download (Standard pattern for file download)
//     // const url = window.URL.createObjectURL(new Blob([response.data]));
//     const url = window.URL.createObjectURL(response.data as Blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", fileName); // Use extracted filename here');
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error("Failed to download template:", error);
//     throw error;
//   }
// };

// export async function approveSpecialExam( markId: string, reason?: string, undo: boolean = false ) {
//   try {
//     const res = await api.post("/student/approve-special", { markId, reason, undo });
//     return res.data;
//   } catch (error) {
//     // This allows you to see the ACTUAL error in console
//     console.error("API Error Details:", error);
//     throw error; // Rethrow so the component's catch block can catch it
//   }
// }

// // Get student transcript (JSON data) 
// export async function getStudentTranscript(regNo: string) {
//   const res = await api.get<{
//     student: {
//       name: string;
//       regNo: string;
//       program: string;
//     };
//     results: Array<{
//       unitCode: string;
//       unitName: string;
//       academicYear: string;
//       year: number;
//       semester: number;
//       totalMark: number;
//       grade: string;
//       status: "PASS" | "SUPPLEMENTARY" | "RETAKE" | "INCOMPLETE";
//       capped?: boolean;
//     }>;
//   }>(`/coordinator/students/${regNo.toUpperCase()}/results`);

//   return res.data;
// }

// export const generateStudentTranscript = (regNo: string) => {
//   window.open(
//     `${
//       process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
//     }/reports/transcript/${regNo.toUpperCase()}`,
//     "_blank"
//   );
// };

// export const getAcademicYears = async () => {
//   // Use the AcademicYear type here instead of the inline literal
//   const res = await api.get<AcademicYear[]>("/academic-years");
//   return res.data;
// };

// export const getPrograms = async () => {
//   const res = await api.get<Array<{ _id: string; name: string; code: string }>>(
//     "/programs"
//   );
//   return res.data;
// };

// export const getUnits = async (filters?: {
//   programId?: string;
//   yearOfStudy?: number;
//   semester?: number;
// }) => {
//   const res = await api.get("/units", { params: filters });
//   return res.data;
// };

















// // clientside/src/api/marksApi.ts  — PATCHED
// // Fix: uploadMarks() was calling "/marks/upload-direct" which didn't exist on the server.
// //      Now both modes use "/marks/upload" (auto-detects template) OR the explicit
// //      "/marks/upload-direct" that has now been added to the route file.
// import axiosInstance from "@/config/axiosInstance";
// import api from "@/config/axiosInstance";
// import { AcademicYear } from "./types";

// export interface UploadResult {
//   message: string;
//   total: number;
//   success: number;
//   errors: string[];
// }

// /**
//  * Upload marks file. Both template modes POST to /marks/upload — the server
//  * auto-detects the template type by inspecting cell E15.
//  * The explicit /marks/upload-direct route is also registered on the server
//  * as a convenience alias used here when templateMode === "direct".
//  */
// export async function uploadMarks(
//   file: File,
//   templateMode: "detailed" | "direct" = "detailed",
// ): Promise<UploadResult> {
//   const formData = new FormData();
//   formData.append("file", file);

//   // Both endpoints now exist on the server. Using the unified /marks/upload
//   // (which auto-detects) keeps things simple; the explicit route is available
//   // for clients that want to be explicit.
//   const endpoint = "/marks/upload";

//   const res = await api.post<UploadResult>(endpoint, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

//   return res.data;
// }

// export const downloadTemplate = async (
//   programId: string,
//   unitId: string,
//   academicYearId: string,
//   yearOfStudy: number,
//   semester: number,
//   examMode: string,
//   unitType: string,
//   templateMode: "detailed" | "direct" = "detailed",
// ) => {
//   if (!programId || !unitId || !academicYearId || !yearOfStudy || !semester) {
//     throw new Error(
//       "Please select the Program, Unit, Academic Year, Year of Study, and Semester before downloading the template.",
//     );
//   }

//   try {
//     const endpoint = templateMode === "direct" ? "/marks/direct-template" : "/marks/template";

//     const params = new URLSearchParams({
//       programId,
//       unitId,
//       academicYearId,
//       yearOfStudy: yearOfStudy.toString(),
//       semester: semester.toString(),
//       examMode,
//       unitType,
//     }).toString();

//     const response = await axiosInstance.get(`${endpoint}?${params}`, {
//       responseType: "blob",
//     });

//     let fileName = "Scoresheet.xlsx";
//     const contentDisposition = response.headers["content-disposition"];
//     if (contentDisposition) {
//       const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
//       if (fileNameMatch?.[1]) {
//         fileName = fileNameMatch[1]
//           .replace(/_+$/, "")
//           .replace(/\.xlsx_$/, ".xlsx")
//           .trim();
//       }
//     }

//     const url  = window.URL.createObjectURL(response.data as Blob);
//     const link = document.createElement("a");
//     link.href  = url;
//     link.setAttribute("download", fileName);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error("Failed to download template:", error);
//     throw error;
//   }
// };

// export async function approveSpecialExam(markId: string, reason?: string, undo: boolean = false) {
//   try {
//     const res = await api.post("/student/approve-special", { markId, reason, undo });
//     return res.data;
//   } catch (error) {
//     console.error("API Error Details:", error);
//     throw error;
//   }
// }

// export async function getStudentTranscript(regNo: string) {
//   const res = await api.get<{
//     student: { name: string; regNo: string; program: string };
//     results: Array<{
//       unitCode: string; unitName: string; academicYear: string; year: number;
//       semester: number; totalMark: number; grade: string;
//       status: "PASS" | "SUPPLEMENTARY" | "RETAKE" | "INCOMPLETE"; capped?: boolean;
//     }>;
//   }>(`/coordinator/students/${regNo.toUpperCase()}/results`);
//   return res.data;
// }

// export const generateStudentTranscript = (regNo: string) => {
//   window.open(
//     `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/reports/transcript/${regNo.toUpperCase()}`,
//     "_blank",
//   );
// };

// export const getAcademicYears = async () => {
//   const res = await api.get<AcademicYear[]>("/academic-years");
//   return res.data;
// };

// export const getPrograms = async () => {
//   const res = await api.get<Array<{ _id: string; name: string; code: string }>>("/programs");
//   return res.data;
// };

// export const getUnits = async (filters?: { programId?: string; yearOfStudy?: number; semester?: number }) => {
//   const res = await api.get("/units", { params: filters });
//   return res.data;
// };










// clientside/src/api/marksApi.ts
//
// KEY FIX: downloadTemplate() was showing "Request failed with status code 500"
// instead of the real server error (e.g. "Institution settings not found.").
//
// WHY: When responseType is "blob", Axios delivers error response bodies as
// Blob objects too — not parsed JSON. So error.response?.data?.message is
// always undefined for blob requests, and getErrorMessage() falls back to the
// generic status-code message.
//
// FIX: In the catch block, read error.response.data (a Blob) as text, parse
// it as JSON, and extract the message field. If that fails (e.g. server sent
// HTML), use the raw text or the status-code fallback.

import axiosInstance from "@/config/axiosInstance";
import api from "@/config/axiosInstance";
import axios from "axios";
import { AcademicYear } from "./types";

export interface UploadResult {
  message: string;
  total:   number;
  success: number;
  errors:  string[];
}

// ─── Blob error extractor ─────────────────────────────────────────────────────
// Reads the Blob body of an Axios error response and returns the server's
// error message string. Falls back to the HTTP status description.

async function extractBlobErrorMessage(error: unknown): Promise<string> {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred.";
  }

  const status = error.response?.status;
  const data   = error.response?.data;

  // data is a Blob when responseType:"blob" is set
  if (data instanceof Blob) {
    try {
      const text   = await data.text();
      const parsed = JSON.parse(text) as Record<string, unknown>;
      // Server sends { message: "..." } or { error: "..." }
      if (typeof parsed.message === "string" && parsed.message) return parsed.message;
      if (typeof parsed.error   === "string" && parsed.error)   return parsed.error;
      // Fallback: return raw text (truncated)
      return text.slice(0, 200) || `Server error (${status})`;
    } catch {
      // Blob wasn't valid JSON (e.g. HTML error page)
      try {
        const raw = await data.text();
        // Strip HTML tags and return first meaningful line
        const stripped = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
        return stripped || `Server error (${status})`;
      } catch {
        return `Server error (${status ?? "unknown"})`;
      }
    }
  }

  // data was already parsed as JSON (non-blob requests)
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.message === "string") return d.message;
    if (typeof d.error   === "string") return d.error;
  }

  // HTTP status fallbacks
  if (status === 400) return "Bad request — check your selection and try again.";
  if (status === 401) return "Session expired. Please log in again.";
  if (status === 403) return "You do not have permission for this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 500) return "A server error occurred. Please try again.";

  if (error.request) return "Unable to reach the server. Check your connection.";
  return error.message || "An unexpected error occurred.";
}

// ─── uploadMarks ──────────────────────────────────────────────────────────────
// Both template modes post to /marks/upload — server auto-detects by cell E15.

export async function uploadMarks(
  file:         File,
  templateMode: "detailed" | "direct" = "detailed",
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<UploadResult>("/marks/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

// ─── downloadTemplate ─────────────────────────────────────────────────────────

export const downloadTemplate = async (
  programId:      string,
  unitId:         string,
  academicYearId: string,
  yearOfStudy:    number,
  semester:       number,
  examMode:       string,
  unitType:       string,
  templateMode:   "detailed" | "direct" = "detailed",
) => {
  if (!programId || !unitId || !academicYearId || !yearOfStudy || !semester) {
    throw new Error(
      "Please select the Program, Unit, Academic Year, Year of Study, and Semester before downloading.",
    );
  }

  const endpoint = templateMode === "direct" ? "/marks/direct-template" : "/marks/template";

  const params = new URLSearchParams({
    programId,
    unitId,
    academicYearId,
    yearOfStudy: yearOfStudy.toString(),
    semester:    semester.toString(),
    examMode,
    unitType,
  }).toString();

  try {
    const response = await axiosInstance.get(`${endpoint}?${params}`, {
      responseType: "blob",
    });

    let fileName = "Scoresheet.xlsx";
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match?.[1]) {
        fileName = match[1]
          .replace(/_+$/, "")
          .replace(/\.xlsx_$/, ".xlsx")
          .trim();
      }
    }

    const url  = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href  = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    // Await the blob body extraction so we can surface the real error message
    const message = await extractBlobErrorMessage(error);
    throw new Error(message);
  }
};

// ─── Misc API functions ───────────────────────────────────────────────────────

export async function approveSpecialExam(
  markId: string, reason?: string, undo: boolean = false,
) {
  const res = await api.post("/student/approve-special", { markId, reason, undo });
  return res.data;
}

export async function getStudentTranscript(regNo: string) {
  const res = await api.get<{
    student: { name: string; regNo: string; program: string };
    results: Array<{
      unitCode: string; unitName: string; academicYear: string; year: number;
      semester: number; totalMark: number; grade: string;
      status: "PASS" | "SUPPLEMENTARY" | "RETAKE" | "INCOMPLETE"; capped?: boolean;
    }>;
  }>(`/coordinator/students/${regNo.toUpperCase()}/results`);
  return res.data;
}

export const generateStudentTranscript = (regNo: string) => {
  window.open(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/reports/transcript/${regNo.toUpperCase()}`,
    "_blank",
  );
};

export const getAcademicYears = async () => {
  const res = await api.get<AcademicYear[]>("/academic-years");
  return res.data;
};

export const getPrograms = async () => {
  const res = await api.get<Array<{ _id: string; name: string; code: string }>>("/programs");
  return res.data;
};

export const getUnits = async (filters?: {
  programId?: string; yearOfStudy?: number; semester?: number;
}) => {
  const res = await api.get("/units", { params: filters });
  return res.data;
};

