// clientside/src/api/studentsApi.ts
import api from "@/config/axiosInstance";
import type { StudentFromAPI, StudentFormRow,  StudentSearchResult, StudentFullRecord, StudentStats, RawMark, SaveMarksPayload, StudentJourneyResponse } from "./types";

export interface BulkRegisterResponse {
  message: string;
  alreadyRegistered?: string[];
  duplicates?: string[];
  registered?: string[];
}

// Update this in src/api/studentsApi.ts
export interface PaginatedStudents {
  students: StudentFromAPI[];
  total: number;
  page: number;
  totalPages: number;
}

export const getStudents = async (search: string = "", page: number = 1): Promise<PaginatedStudents> => {
  // Pass search and page as query parameters
  const res = await api.get<PaginatedStudents>("/students", { 
    params: { search, page } 
  });
  return res.data;
};

export const deleteStudent = async (id: string) => {
  await api.delete(`/students/${id}`);
};

export const updateStudentName = async (id: string, name: string): Promise<StudentFromAPI> => {
  const res = await api.patch<StudentFromAPI>(`/students/${id}`, { name });
  return res.data;
};

export const bulkRegisterStudents = async (data: { students: StudentFormRow[] }): Promise<BulkRegisterResponse> => {
  const res = await api.post<BulkRegisterResponse>("/students/bulk", data);
  return res.data;
};

export const getStudentStats = async (): Promise<StudentStats> => {
  const res = await api.get<StudentStats>("/students/stats");
  return res.data;
};

// Search students by regNo (partial match)
export const searchStudents = async (query: string): Promise<StudentSearchResult[]> => {
  const res = await api.get<StudentSearchResult[]>("/student/search", { params: { q: query } });
  return res.data;
};

export const getStudentRecord = async (regNo: string, yearOfStudy: string | number): Promise<StudentFullRecord> => {
  const res = await api.get<StudentFullRecord>("/student/record", { 
    params: { regNo, yearOfStudy } 
  });
  return res.data;
};

export const grantAcademicLeave = async (studentId: string, startDate: Date, endDate: Date, reason: string, leaveType: string) => {
  // return api.post("/student/leave", { studentId, startDate, endDate, reason, leaveType });
  const res = await api.post("/student/leave", {studentId, startDate, endDate, reason, leaveType});
  return res.data;
};

export const deferAdmission = async (studentId: string, years: number) => {
  return api.post("/student/defer", { studentId, years });
};

export const revertStatusToActive = async (id: string) =>
  api.post("/student/revert-active", { studentId: id });

export const getStudentJourney = async (regNo: string): Promise<StudentJourneyResponse> => {
  const res = await api.get<StudentJourneyResponse>("/student/journey", {
    params: { regNo }
  });
  return res.data;
};

export const readmitStudent = async (studentId: string, remarks: string) => {
  const res = await api.post("/student/readmit", { studentId, remarks });
  return res.data;
};

export const getRawMarks = async (regNo: string, yearOfStudy: number): Promise<RawMark[]> => {
  const res = await api.get<RawMark[]>("/student/raw-marks", { params: { regNo, yearOfStudy } });
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



