// src/api/types.ts
export type Role = "admin" | "lecturer" | "coordinator";
export type Status = "active" | "suspended";

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
  _id:         string;
  name:        string;
  email:       string;
  role:        Role;
  status:      Status;
  institution: string;
  createdAt:   string;
}
 
export type Lecturer    = User & { role: "lecturer" };
export type Coordinator = User & { role: "coordinator" };
export type Admin       = User & { role: "admin" };

export interface EmailCheckResult {
  nextStep:    "password";
  maskedName?: string;
}
 
export interface PasswordVerifyResult {
  requiresOTP: true;
  maskedEmail: string;
}

export interface UnitStats {
  totalUnits: number; 
}

export interface Invite {
  _id:         string;
  name:        string;
  email:       string;
  role:        "lecturer" | "coordinator";
  used:        boolean;
  expiresAt:   string;
  createdAt:   string;
  institution: string;
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
  program: { _id: string; name: string; code: string; } | string;       
  programId: string;
  currentYearOfStudy: number; // Corrected field name
  currentSemester: number;    // Added field
  admissionAcademicYear: string;
  status: "active" | "inactive" | "graduated" | "suspended" | "deferred";
}

export interface AcademicYear {
  _id: string;
  year: string;    
  intakes: string[];
  startDate?: string;      // ISO string "2024-08-01"
  endDate?: string;        // ISO string "2025-07-31"
  isActive: boolean;
  isCurrent?: boolean;
  session: "ORDINARY" | "SUPPLEMENTARY" | "CLOSED"; // Added for ENG 13/18
  isRegistrationOpen: boolean; // Added for Unit Registration period
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

export type IntakeType = "JAN" | "MAY" | "SEPT";
export interface StudentFormRow {
  regNo: string;
  name: string;
  program: string; // The ID from selectedProgramId or the Name from Paste
  currentYearOfStudy: number;
  academicYearId?: string;
  intake: IntakeType;
  admissionAcademicYearString?: string;
}

export interface BulkRegisterResponse {
  message: string;
  alreadyRegistered?: string[];
  duplicates?: string[];
  registered?: string[];
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
  status: string;
  variant: "success" | "warning" | "error" | "info";
  details: string;
  weightedMean: string; 
  sessionState?: "ORDINARY" | "SUPPLEMENTARY" | "CLOSED";
  summary: AcademicSummary;
  missingList: string[];
  failedList: { displayName: string; attempt: number }[];
  // Fix: SpecialList needs to match backend: { displayName: string; grounds: string }[]
  specialList: { displayName: string; grounds: string }[];
  incompleteList: string[];
  academicYearName: string;
}

export interface GradeRecord {
  _id: string;
  unit: { code: string; name: string };
  semester: string | number;
  status: string;
  totalMark: number;
  agreedMark: number;
  grade: string;
  academicYear: { year: string };
  deletedAt?: Date;
}

export interface StudentFullRecord {
  student: {
    _id: string;
    name: string;
    regNo: string;
    programName: string;
    programId?: string;
    currentYear: number;
    currentSemester: number;
    status: string;
  };
  grades: GradeRecord[];
  currentStatus: string;
  academicStatus: AcademicStatus; 
  summary: {    
    totalUnits: number;
    passed: number;
    supplementary: number;
    retake: number;
  };
}

export interface RawMark {
  _id: string;
  student: {
    _id: string;
    // name: string;
    // regNumber: string;
  };
  academicYear: {
    _id: string;
    year: string;
  };
  examMode?: "standard" | "mandatory_q1";
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
  examMode?: "standard" | "mandatory_q1";
  // Coursework
  cat1?: number;
  cat2?: number;
  cat3?: number;
  assignment1?: number;
  assignment2?: number;
  practicalRaw?: number;
  // Exam Questions
  examQ1?: number;
  examQ2?: number;
  examQ3?: number;
  examQ4?: number;
  examQ5?: number;
  caDirect?: number; 
  examDirect?: number;
  caTotal30?: number;    // Added for backend compatibility
  examTotal70?: number;  // Added for backend compatibility
  agreedMark?: number;
  isSpecial: boolean;
  attempt: "1st" | "re-take" | "supplementary" | "special";
}

export interface TrashedMark {
  _id: string;
  deletedAt: string;
  student: {
    _id: string;
    regNo: string;
    name: string;
  };
  programUnit: {
    unit: {
      code: string;
      name: string;
    };
  };
  academicYear: {
    year: string;
  };
}

export interface StudentJourneyTimeline { 
  type: "ACADEMIC" | "STATUS_CHANGE";
  academicYear: string;
  yearOfStudy?: number;
  status?: string;
  weight?: number;
  totalUnits?: number;
  challenges?: {
    supplementary: string[];
    retakes: string[];
    specials: string[];
    incomplete: string[]; // Added this
  };
  isRepeat?: boolean;
  isCurrent?: boolean;
  leaveInfo?: { type: "ACADEMIC LEAVE" | "DEFERMENT"; reason: string; duration: string; };
  fromStatus?: string;
  toStatus?: string;
  reason?: string;
  date?: string;
}

export interface StudentJourneyResponse {
  admissionYear: string;
  intake: string;
  currentStatus: string;
  cumulativeMean: string;
  timeline: StudentJourneyTimeline[];
}

  export interface AwardListEntry {
    studentId: string;
    regNo: string;
    name: string;
    waa: number;
    classification: string;
    graduationYear: number;
  }

  export interface AwardListParams {
    programId: string;
    academicYear?: string;
  }

  export interface AwardDocParams extends AwardListParams {
    variant: "simple" | "classified";
  }