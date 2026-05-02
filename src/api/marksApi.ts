
// clientside/src/api/marksApi.ts

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

// export async function uploadMarks(
//   file: File, _templateMode: "detailed" | "direct" = "detailed",
// ): Promise<UploadResult> {
  export async function uploadMarks(
    file: File,
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

