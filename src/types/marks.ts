// src/types/marks.ts
export interface StudentMarkRecord {
  regNo: string;
  name: string;
  program: string;
  unitCode: string;
  unitName: string;
  cat1?: number;
  cat2?: number;
  cat3?: number;
  assignment?: number;
  practical?: number;
  exam?: number;
  total: number;
  status: "Pass" | "Supplementary" | "Retake" | "Missing"; // outcome
}
