
// clientside/src/api/marksApi.ts

import axiosInstance from "@/config/axiosInstance";
import api from "@/config/axiosInstance";
import axios from "axios";

export interface UploadResult {
  message: string;
  total:   number;
  success: number;
  errors:  string[];
}

export interface BatchInfo {
  batchId: string;
  unitCode: string;
  unitName: string;
  programCode: string;
  programName: string;
  academicYear: string;
  session: string;
  totalRecords: number;
  uploadedAt: string;
}

export interface BatchMarkEntry {
  _id: string;
  regNo: string;
  studentName: string;
  caTotal30: number;
  examTotal70: number;
  agreedMark: number;
  attempt: string;
  isSpecial: boolean;
}

export interface BatchDetailResponse {
  batch: BatchInfo;
  entries: BatchMarkEntry[];
}

export interface DeleteBatchResponse {
  message: string;
  deletedCount: number;
}

export interface DeleteBatchesResponse {
  message: string;
  deletedCount: number;
  batchCount: number;
}

// View marks in a single batch
export const getBatchMarks = async (batchId: string): Promise<BatchDetailResponse> => {
  const res = await api.get<BatchDetailResponse>(`/marks/batch/${batchId}`);
  return res.data;
};

// Delete a single batch
export const deleteBatch = async (batchId: string): Promise<DeleteBatchResponse> => {
  const res = await api.delete<DeleteBatchResponse>(`/marks/batch/${batchId}`);
  return res.data;
};

// Delete multiple batches
export const deleteBatches = async (batchIds: string[]): Promise<DeleteBatchesResponse> => {
  const res = await api.delete<DeleteBatchesResponse>("/marks/batches", {
    data: { batchIds },
  });
  return res.data;
};

// ─── Blob error extractor ─────────────────────────────────────────────────────
async function extractBlobErrorMessage(error: unknown): Promise<string> {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred.";
  }

  const status = error.response?.status;
  const data   = error.response?.data;

  if (data instanceof Blob) {
    try {
      const text   = await data.text();
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (typeof parsed.message === "string" && parsed.message) return parsed.message;
      if (typeof parsed.error   === "string" && parsed.error)   return parsed.error;
      return text.slice(0, 200) || `Server error (${status})`;
    } catch {
      try {
        const raw = await data.text();
        const stripped = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
        return stripped || `Server error (${status})`;
      } catch {
        return `Server error (${status ?? "unknown"})`;
      }
    }
  }

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.message === "string") return d.message;
    if (typeof d.error   === "string") return d.error;
  }

  if (status === 400) return "Bad request — check your selection and try again.";
  if (status === 401) return "Session expired. Please log in again.";
  if (status === 403) return "You do not have permission for this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 500) return "A server error occurred. Please try again.";

  if (error.request) return "Unable to reach the server. Check your connection.";
  return error.message || "An unexpected error occurred.";
}

// ─── uploadMarks ──────────────────────────────────────────────────────────────
export async function uploadMarks(file: File): Promise<UploadResult> {
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

export const getUnits = async (filters?: {
  programId?: string; yearOfStudy?: number; semester?: number;
}) => {
  const res = await api.get("/units", { params: filters });
  return res.data;
};
