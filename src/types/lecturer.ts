// src/types/lecturer.ts
export interface IUnit {
  _id: string;
  code: string;
  title: string;
  academicYear?: string;
  program?: {
    _id: string;
    code: string;
    title: string;
  };
}

export interface IResultPreviewRow {
  registrationNo: string;
  studentName?: string;
  cat1?: number;
  cat2?: number;
  cat3?: number;
  assignment?: number;
  practical?: number;
  exam?: number;
  computedTotal?: number;
  status?: string;
}
