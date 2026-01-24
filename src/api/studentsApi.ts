// clientside/src/api/studentsApi.ts
import api from "@/config/axiosInstance";
import type { StudentFromAPI, StudentFormRow,  StudentSearchResult, StudentFullRecord, StudentStats, RawMark, SaveMarksPayload } from "./types";

// const API_BASE_URL = api.defaults.baseURL;
const API_BASE_URL = api.defaults.baseURL?.replace(/\/$/, '') || "http://localhost:8000";

export interface BulkRegisterResponse {
  message: string;
  alreadyRegistered?: string[];
  duplicates?: string[];
  registered?: string[];
}

export const getStudents = async (): Promise<StudentFromAPI[]> => {
  const res = await api.get<StudentFromAPI[]>("/students");
  return res.data;
};

// We send only what's needed — backend resolves program name → ID
export const bulkRegisterStudents = async (students: StudentFormRow[]): Promise<BulkRegisterResponse> => {
  const res = await api.post<BulkRegisterResponse>("/students/bulk", { students });
  return res.data;
};

export const getStudentStats = async (): Promise<StudentStats> => {
  // Use your existing axios instance
  const res = await api.get<StudentStats>("/students/stats");
  return res.data;
};

// Search students by regNo (partial match)
export const searchStudents = async (query: string): Promise<StudentSearchResult[]> => {
  const res = await api.get<StudentSearchResult[]>("/student/search", { params: { q: query } });
  return res.data;
};

export const getStudentRecord = async (regNo: string, yearOfStudy: string | number): Promise<StudentFullRecord> => {
  // Update the param key from 'academicYear' to 'yearOfStudy'
  const res = await api.get<StudentFullRecord>("/student/record", { 
    params: { regNo, yearOfStudy } 
  });
  return res.data;
};

// // Get full academic record + status
// export const getStudentRecord = async (regNo: string, academicYear: string): Promise<StudentFullRecord> => {
//   const res = await api.get<StudentFullRecord>("/student/record", { params: { regNo, academicYear } });
//   return res.data;
// };

export const getRawMarks = async (regNo: string): Promise<RawMark[]> => {
  const res = await api.get<RawMark[]>("/student/raw-marks", {
    params: { regNo },
  });
  return res.data;
};

export const saveRawMarks = async (data: SaveMarksPayload): Promise<RawMark> => {
  const res = await api.post<RawMark>("/student/raw-marks", data);
  return res.data;
};

export const downloadStudentRegistrationTemplate = async (
  programId?: string,     // optional — can pre-filter
  academicYearId?: string // optional
) => {
  try {
    const params = new URLSearchParams();
    if (programId)     params.set("programId", programId);
    if (academicYearId) params.set("academicYearId", academicYearId);

    const query = params.toString() ? `?${params.toString()}` : "";

    const response = await api.get<Blob>(`/students/template${query}`, {
      responseType: "blob",
    });

    // ── Better filename extraction ──────────────────────────────────────
    let filename = "student-registration-template.xlsx";

    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename")) {
      // Handle both simple and RFC 5987 styles
      const filenameRegex = /filename\*?=(?:UTF-8'')?([^;]+)/i;
      const matches = disposition.match(filenameRegex);
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, "").trim());
      }
    }

    // Fallback / safety cleanup
    filename = filename
      .replace(/\.xlsx[x_]*$/i, ".xlsx")   // fix corrupted extensions
      .replace(/[^a-z0-9._-]/gi, "_")      // very safe characters
      .replace(/_+/g, "_")
      .trim();

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true; // success indicator
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Template download failed:", err);
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Failed to download registration template"
    );
  }
};



