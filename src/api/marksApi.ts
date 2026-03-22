// clientside/src/api/marksApi.ts
import axiosInstance from "@/config/axiosInstance";
import api from "@/config/axiosInstance";
import { AcademicYear } from "./types";

export interface UploadResult {
  message: string;
  total: number;
  success: number;
  errors: string[];
}

// Upload marks via CSV/Excel file 
export async function uploadMarks(file: File, 
  templateMode: "detailed" | "direct" = "detailed"): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint = templateMode === "direct" ? "/marks/upload-direct" : "/marks/upload";

  // const res = await api.post<UploadResult>("/marks/upload", formData, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });

  const res = await api.post<UploadResult>(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export const downloadTemplate = async (
programId: string, unitId: string, academicYearId: string, yearOfStudy: number, semester: number, examMode: string, unitType: string, templateMode: "detailed" | "direct" = "detailed") => {
  // --- Defensive Check ADDED HERE ---
  if (!programId || !unitId || !academicYearId || !yearOfStudy || !semester) {
    console.error(
      "Download Failed: Missing required program or year/semester parameters."
    );
    // Throw a specific error to be caught by the calling component
    throw new Error(
      "Please select the Program, Unit, Academic Year, Year of Study, and Semester before downloading the template."
    );
  }
  try {
    // 2. Determine the Route based on templateMode
    // Assuming your backend has:
    // GET /marks/template (Detailed)
    // GET /marks/template-direct (New Direct Entry)
    const endpoint = templateMode === "direct" ? "/marks/direct-template" : "/marks/template";
    // Construct the query string with the required parameters
    const params = new URLSearchParams({
      programId,
      unitId,
      academicYearId,
      yearOfStudy: yearOfStudy.toString(),
      semester: semester.toString(),
      examMode, unitType,
      ...(templateMode === "detailed" && { examMode, unitType }),
    }).toString();

    // Make the GET request with the parameters
    // const response = await axiosInstance.get(`/marks/template?${params}`, {
    // const response = await axiosInstance.get(`/marks/direct-template?${params}`, {
    const response = await axiosInstance.get(`${endpoint}?${params}`, {
      responseType: "blob", // Important for downloading files
    });

    // --- EXTRACT FILENAME FROM HEADER ---
    // let fileName = "scoresheet-template.xlsx";
    let fileName = templateMode === "direct" ? "Scoresheet.xlsx" : "Scoresheet.xlsx";
    const contentDisposition = response.headers["content-disposition"];

    if (contentDisposition) {
      // This regex looks for filename= and captures everything up to .xlsx
      // It ignores any trailing quotes or semicolon garbage
      const fileNameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (fileNameMatch?.[1]) {
        fileName = fileNameMatch[1];

        // 2. Safety Net: If it ends in .xlsx_ or just has a trailing _, clean it
        fileName = fileName
          .replace(/_+$/, "") // Remove underscores at the very end
          .replace(/\.xlsx_$/, ".xlsx") // Specifically fix .xlsx_
          .trim();
      }
    }
    // Create a blob URL and trigger download (Standard pattern for file download)
    // const url = window.URL.createObjectURL(new Blob([response.data]));
    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName); // Use extracted filename here');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download template:", error);
    throw error;
  }
};

export async function approveSpecialExam( markId: string, reason?: string, undo: boolean = false ) {
  try {
    const res = await api.post("/student/approve-special", { markId, reason, undo });
    return res.data;
  } catch (error) {
    // This allows you to see the ACTUAL error in console
    console.error("API Error Details:", error);
    throw error; // Rethrow so the component's catch block can catch it
  }
}

// Get student transcript (JSON data) 
export async function getStudentTranscript(regNo: string) {
  const res = await api.get<{
    student: {
      name: string;
      regNo: string;
      program: string;
    };
    results: Array<{
      unitCode: string;
      unitName: string;
      academicYear: string;
      year: number;
      semester: number;
      totalMark: number;
      grade: string;
      status: "PASS" | "SUPPLEMENTARY" | "RETAKE" | "INCOMPLETE";
      capped?: boolean;
    }>;
  }>(`/coordinator/students/${regNo.toUpperCase()}/results`);

  return res.data;
}

export const generateStudentTranscript = (regNo: string) => {
  window.open(
    `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    }/reports/transcript/${regNo.toUpperCase()}`,
    "_blank"
  );
};

export const getAcademicYears = async () => {
  // Use the AcademicYear type here instead of the inline literal
  const res = await api.get<AcademicYear[]>("/academic-years");
  return res.data;
};

export const getPrograms = async () => {
  const res = await api.get<Array<{ _id: string; name: string; code: string }>>(
    "/programs"
  );
  return res.data;
};

export const getUnits = async (filters?: {
  programId?: string;
  yearOfStudy?: number;
  semester?: number;
}) => {
  const res = await api.get("/units", { params: filters });
  return res.data;
};


