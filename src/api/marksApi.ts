// src/api/marksApi.ts
import axiosInstance from "@/config/axiosInstance";
import api from "@/config/axiosInstance";

export interface UploadResult {
  message: string;
  total: number;
  success: number;
  errors: string[];
}

/**
 * Upload marks via CSV/Excel file
 */
export async function uploadMarks(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<UploadResult>("/marks/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

/**
 * Download the official marks upload template
 */
// export async function downloadTemplate() {
//   const res = await api.get("/marks/template", {
//     responseType: "blob", // This tells Axios to return Blob
//   });

//   // Fixed: res.data is Blob now
//   const url = window.URL.createObjectURL(res.data as Blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.setAttribute("download", "marks-upload-template.csv");
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
//   window.URL.revokeObjectURL(url); // Clean up
// }

export const downloadTemplate = async (
    programId: string,
    unitId: string,
    academicYearId: string,
    yearOfStudy: number,
    semester: number
) => {
  // --- Defensive Check ADDED HERE ---
    if (!programId || !unitId || !academicYearId || !yearOfStudy || !semester) {
        console.error("Download Failed: Missing required program or year/semester parameters.");
        // Throw a specific error to be caught by the calling component
        throw new Error("Please select the Program, Unit, Academic Year, Year of Study, and Semester before downloading the template.");
    }
    // ----------------------------------
    try {
        // Construct the query string with the required parameters
        const params = new URLSearchParams({
            programId,
            unitId,
            academicYearId,
            yearOfStudy: yearOfStudy.toString(),
            semester: semester.toString(),
        }).toString();
        
        // Make the GET request with the parameters
        const response = await axiosInstance.get(`/marks/template?${params}`, {
            responseType: 'blob', // Important for downloading files
        });

        // Create a blob URL and trigger download (Standard pattern for file download)
        // const url = window.URL.createObjectURL(new Blob([response.data]));
        const url = window.URL.createObjectURL(response.data as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'marks-scoresheet-template.csv'); 
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Failed to download template:", error);
        throw error;
    }
};

/**
 * Get student transcript (JSON data)
 */
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

/**
 * Generate Senate Reports (PDF) – Opens in new tab
 */
export const generatePassList = (academicYearId: string) => {
  window.open(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/reports/pass-list/${academicYearId}`,
    "_blank"
  );
};

export const generateConsolidatedMarksheet = (academicYearId: string) => {
  window.open(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/reports/consolidated/${academicYearId}`,
    "_blank"
  );
};

export const generateStudentTranscript = (regNo: string) => {
  window.open(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/reports/transcript/${regNo.toUpperCase()}`,
    "_blank"
  );
};

/**
 * Get academic years, programs, units, etc.
 */
export const getAcademicYears = async () => {
  const res = await api.get<Array<{ _id: string; year: string }>>("/academic-years");
  return res.data;
};

export const getPrograms = async () => {
  const res = await api.get<Array<{ _id: string; name: string; code: string }>>("/programs");
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