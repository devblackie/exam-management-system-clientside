// src/api/types.ts
export type Role = "admin" | "lecturer" | "coordinator";
export type Status = "active" | "suspended";
export type Lecturer = User & { role: "lecturer" };

export interface BackendErrorResponse {
  message?: string;
}

// Define the shape of the full error object returned by Axios
export interface AxiosExpectedError {
  response?: {
    data?: BackendErrorResponse;
    status: number;
    statusText: string;
  };
  message: string; // The standard JS/Axios error message
  isAxiosError: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: string;
}

export interface Invite {
  _id: string;
  email: string;
  role: "lecturer" | "coordinator";
  used: boolean;
  expiresAt: string;
  createdAt: string;
  name: string;
}


export interface UnitAssignment {
  _id: string;
  lecturer: string | Lecturer;
  programUnit: string | ProgramUnit;
  assignedBy: string; // adminId
  createdAt: string;
}

export interface Program {
  _id: string;
  name: string;
  code: string;
  description?: string;
  durationYears?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramUnit {
  _id: string;
  programId: string;
  requiredYear: number;
  requiredSemester: 1 | 2;
  isElective: boolean;
  
  unit: {
    _id: string;
    code: string;
    name: string;
  };
  program: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  _id: string;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurriculumFormState {
  programId: string;
  unitId: string;
  requiredYear: string;
  requiredSemester: string;
  isElective?: boolean;
}

export interface StudentFromAPI {
  _id?: string;
  regNo: string;
  name: string;
  program: string;           // Populated name
  programId: string;
  currentYearOfStudy: number; // Corrected field name
  currentSemester: number;    // Added field
  admissionAcademicYear: string;
  status: "active" | "inactive" | "graduated" | "suspended" | "deferred";
}

export interface AcademicYear {
  _id: string;
  year: string;           // e.g. "2024/2025"
  startDate?: string;      // ISO string "2024-08-01"
  endDate?: string;        // ISO string "2025-07-31"
 isActive: boolean;
  isCurrent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GradingScale {
  min: number;
  grade: string;
  points?: number;
}

export interface Institution {
  _id: string;
  name: string;
  code: string;
}

export interface InstitutionSettings {
  _id?: string;
  institution?: string;

  // MAX MARKS — Real-world values
  cat1Max: number;
  cat2Max: number;
  cat3Max: number;        // 0 = not used
  assignmentMax: number;  // 0 = not used
  practicalMax: number;   // 0 = not used

  examMax: 70; // Always fixed

  passMark: number;
  supplementaryThreshold: number;
  retakeThreshold: number;

  gradingScale?: GradingScale[];

  createdAt?: string;
  updatedAt?: string;
}

// For saving/updating
export interface InstitutionSettingsInput {
  cat1Max?: number;
  cat2Max?: number;
  cat3Max?: number;
  assignmentMax?: number;
  practicalMax?: number;
  passMark?: number;
  supplementaryThreshold?: number;
  retakeThreshold?: number;
  gradingScale?: GradingScale[];
}

export interface StudentFormRow {
  regNo: string;
  name: string;
  program: string;
  currentYearOfStudy: number; 
  academicYearId?: string; // Add this
  admissionAcademicYear?: string; // The "2024/2025" string
}

export interface StudentStats {
  active: number;
  inactive: number;
  total: number;
}

export interface StudentSearchResult {
  _id: string;
  regNo: string;
  name: string;
  program?: {
    name: string;
  };
}

export interface AcademicSummary {
  totalExpected: number;
  passed: number;
  failed: number;
  missing: number;
}

export interface AcademicStatus {
  // failedList: any;
  status: string;
  variant: "success" | "warning" | "error" | "info";
  details: string;
  summary: AcademicSummary;
  missingList: string[];
  failedList: string[];
  retakeList: string[];
  reRetakeList: string[];
  specialList: string[];
  incompleteList: string[];
  academicYearName: string;
}

export interface GradeRecord {
  _id: string;
  unit: { code: string; name: string };
  semester: string | number;
  status: string;
  totalMark: number;
  grade: string;
  academicYear: { year: string };
}

export interface StudentFullRecord {
  student: {
    _id: string;
    name: string;
    regNo: string;
    program: string;
    currentYear: number; 
    currentSemester: number;
  };
  grades: GradeRecord[];
  currentStatus: string;
  academicStatus: AcademicStatus; // Add this line
  summary: {                       // Update summary to match the backend
    totalUnits: number;
    passed: number;
    supplementary: number;
    retake: number;
  };
}

export interface RawMark {
  _id: string;
  academicYear: {
    _id: string;
    year: string;
  };
  // Matches the backend population logic: mark.programUnit.unit
  programUnit: {
    _id: string;
    unit: {
      _id: string;
      code: string;
      name: string;
    };
  };
  // Coursework Raw Scores
  cat1Raw: number;
  cat2Raw: number;
  cat3Raw?: number;
  assgnt1Raw: number;
  assgnt2Raw?: number;
  assgnt3Raw?: number;
  practicalRaw?: number;

  // Exam Question Raw Scores
  examQ1Raw: number; // Max 10
  examQ2Raw: number; // Max 20
  examQ3Raw: number; // Max 20
  examQ4Raw: number; // Max 20
  examQ5Raw?: number; // Max 20

  // Computed Totals (Audit)
  caTotal30: number;
  examTotal70: number;
  agreedMark: number;
  
  // Metadata
  attempt: "1st" | "re-take" | "supplementary" | "special";
  isSupplementary: boolean;
  isRetake: boolean;
  isSpecial: boolean;
  isMissingCA: boolean;
  remarks?: string;
}

export interface SaveMarksPayload {
  regNo: string;
  unitCode: string;
  academicYear: string;
  // Coursework
  cat1?: number;
  cat2?: number;
  cat3?: number;
  assignment1?: number;
  assignment2?: number;
  // Exam Questions
  examQ1?: number;
  examQ2?: number;
  examQ3?: number;
  examQ4?: number;
  examQ5?: number;
  isSpecial: boolean;
  attempt: "1st" | "re-take" | "supplementary" | "special";
}
