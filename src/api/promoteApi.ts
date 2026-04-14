// src/api/promoteApi.ts

import api from "@/config/axiosInstance";
import { startStreamingDownload } from "@/config/streamingUtils";

export interface PromotionParams { programId?: string; yearToPromote: number;  academicYearName: string; programName?:string, programCode?: string; studentId?: string; }

export interface PromotionPreviewRecord {
  id: string; regNo: string; name: string; status: string; reasons: string[];
  summary: { totalExpected: number; passed: number; failed: number; missing: number; };  
}

export interface PromotionPreviewResponse {
  totalProcessed: number; eligibleCount: number; blockedCount: number;
  eligible: PromotionPreviewRecord[]; blocked: PromotionPreviewRecord[];
}

export interface BulkPromoteResponse {
  success: boolean; message: string;
  data: { promoted: number; failed: number; errors: string[] };
}

export interface UndoPromotionResponse {
  success: boolean; message: string; previousYear?: number; restoredYear?: number;
}

// ── Filename helper ───────────────────────────────────────────────────────────
const getSafeFileName = (name: string | undefined): string => {
  if (!name) return "PROGRAM";
  // Remove special characters and replace spaces with underscores
  return name.trim().replace(/[^a-z0-9]/gi, "_").toUpperCase();
};

// ── Preview ───────────────────────────────────────────────────────────────────
export async function previewPromotion(data: PromotionParams) {
  const res = await api.post<{ success: boolean; data: PromotionPreviewResponse;}>("/promote/preview-promotion", data);
  return res.data.data;
}

// ── Bulk promote ──────────────────────────────────────────────────────────────
export async function bulkPromoteClass(data: PromotionParams) {
  const res = await api.post<BulkPromoteResponse>("/promote/bulk-promote", data);
  return res.data;
}

// ── Individual promote ────────────────────────────────────────────────────────
export const promoteStudentApi = async (studentId: string) => {
  const response = await api.post(`/promote/${studentId}`);
  return response.data;
};

// ── Undo promotion ────────────────────────────────────────────────────────────
export const undoPromotionApi = async (studentId: string): Promise<UndoPromotionResponse> => {
  const res = await api.post<UndoPromotionResponse>(`/promote/undo/${studentId}`);
  return res.data;
};

// ── Senate report ZIP (all Word docs) with progress ──────────────────────────
export async function downloadPromotionReportWithProgress( data: PromotionParams, programName: string | undefined, onProgress: (percent: number, message: string) => void) {
    const safeYearName = getSafeFileName(data.academicYearName);
    const zipFileName = `SENATE_REPORT_Y${data.yearToPromote}_${safeYearName}.zip`;
    return startStreamingDownload( "/promote/download-report-progress", data, onProgress, zipFileName);
  }

// ── CMS (Consolidated Mark Sheet) — standalone download ──────────────────────
export async function downloadCmsWithProgress(data: PromotionParams, programName: string | undefined, onProgress: (percent: number, message: string) => void) {
  const safeName = getSafeFileName(programName);
  const safeYear = getSafeFileName(data.academicYearName);
  const xlsxName = `CMS_${safeName}_Y${data.yearToPromote}_${safeYear}.xlsx`;
  return startStreamingDownload("/promote/download-cms", data, onProgress, xlsxName);
}

// ── Ineligibility notices ZIP ─────────────────────────────────────────────────
export async function downloadIneligibilityNoticesWithProgress( data: PromotionParams, programName: string | undefined, onProgress: (percent: number, message: string) => void) {
  const safeName = getSafeFileName(programName);
  return startStreamingDownload( "/promote/download-notices-progress", data, onProgress, `Supplementary_Notices_${safeName}_Y${data.yearToPromote}.zip`);
}

// ── Legacy non-streaming downloads (kept for compatibility) ──────────────────
export async function downloadPromotionReport(data: PromotionParams, programName: string) {
  const res = await api.post("/promote/download-report", data, {responseType: "arraybuffer", timeout: 600000});

  const safeName = getSafeFileName(programName);
  const blob = new Blob([res.data], { type: "application/zip" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Promotion_Report_${safeName}_Y${data.yearToPromote}.zip`);
  document.body.appendChild(link);
  link.click();

  setTimeout(() => { window.URL.revokeObjectURL(url); link.remove();}, 100);
}

// ── Transcripts ZIP ───────────────────────────────────────────────────────────
export async function downloadTranscriptsWithProgress(
  data: PromotionParams, programName: string | undefined, onProgress: (percent: number, message: string) => void,
) {
  const safeName = getSafeFileName(programName);

  return startStreamingDownload("/promote/download-transcripts-progress", data, onProgress, `Transcripts_${safeName}_Y${data.yearToPromote}.zip`);
}

export async function downloadIneligibilityNotices(data: {programId: string; yearToPromote: number; academicYearName: string; }) {
    const res = await api.post("/promote/download-notices", data, { responseType: "blob", timeout: 600000 });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Ineligibility_Notices_Year_${data.yearToPromote}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }







