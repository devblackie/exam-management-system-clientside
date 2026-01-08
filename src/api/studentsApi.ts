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

// Get full academic record + status
export const getStudentRecord = async (regNo: string): Promise<StudentFullRecord> => {
  const res = await api.get<StudentFullRecord>("/student/record", { params: { regNo } });
  return res.data;
};

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


// export const downloadTranscript = (regNo: string, year?: string): void => {
//   const params = new URLSearchParams({ regNo });
//   if (year) params.append("year", year);

//   const endpoint = year ? "/transcript/year" : "/transcript";
//  const url = `${API_BASE_URL}/student${endpoint}?${params.toString()}`;

//   // Most reliable method — works everywhere
//    const link = document.createElement("a");
//   link.href = url;
//   link.target = "_blank";
//   link.rel = "noopener noreferrer";
  
//   // THIS LINE FORCES DOWNLOAD + CORRECT FILENAME
//   link.download = year 
//     ? `Transcript_${regNo.replace(/\//g, "_")}_${year.replace("/", "-")}.pdf`
//     : `Transcript_${regNo.replace(/\//g, "_")}_Full.pdf`;

//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };


export const downloadTranscript = async (regNo: string, year?: string) => {
  const params = new URLSearchParams({ regNo });
  if (year) params.append("year", year);

  const endpoint = year ? "/transcript/year" : "/transcript";
  const url = `${API_BASE_URL}/student${endpoint}?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // ⬅ IMPORTANT (sends session cookie)
  });

  if (!res.ok) {
    alert("Transcript not found on the server");
    throw new Error("Transcript generation failed");
  }

  const blob = await res.blob();
  const downloadUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = year
    ? `Transcript_${regNo.replace(/\//g, "_")}_${year.replace("/", "-")}.pdf`
    : `Transcript_${regNo.replace(/\//g, "_")}_Full.pdf`;

  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(downloadUrl);
};
