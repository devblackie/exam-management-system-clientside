// src/api/promoteApi.ts
import api from "@/config/axiosInstance";

export interface PromotionPreviewRecord {
  id: string;
  regNo: string;
  name: string;
  status: string;
  summary: {
    totalExpected: number;
    passed: number;
    failed: number;
    missing: number;
  };
  reasons: string[];
}

export interface PromotionPreviewResponse {
  totalProcessed: number;
  eligibleCount: number;
  blockedCount: number;
  eligible: PromotionPreviewRecord[];
  blocked: PromotionPreviewRecord[];
}

export interface BulkPromoteResponse {
  success: boolean;
  message: string;
  data: {
    promoted: number;
    failed: number;
    errors: string[];
  };
}

/**
 * 🔍 Preview Promotion
 * Runs a dry-run of the promotion logic without modifying the database.
 */
export async function previewPromotion(data: {
  programId: string;
  yearToPromote: number;
  academicYearName: string;
}) {
  const res = await api.post<{ success: boolean; data: PromotionPreviewResponse }>(
    "/promote/preview-promotion", 
    data
  );
  return res.data.data;
}

/**
 * 🚀 Bulk Promote Class
 * Commits the promotion for all eligible students in a specific program and year.
 */
export async function bulkPromoteClass(data: {
  programId: string;
  yearToPromote: number;
  academicYearName: string;
}) {
  const res = await api.post<BulkPromoteResponse>("/promote/bulk-promote", data);
  return res.data;
}

export async function downloadPromotionReport(data: {
  programId: string;
  yearToPromote: number;
  academicYearName: string;
}) {
  const res = await api.post("/promote/download-report", data, {
    responseType: "blob", // Critical for binary files
  });
  
  // Create a download link in the browser
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Promotion_Report_Year_${data.yearToPromote}.docx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}