// src/api/promoteApi.ts

import api from "@/config/axiosInstance";
import { startStreamingDownload } from "@/config/streamingUtils";

export interface PromotionParams {
  programId: string;
  yearToPromote: number;
  academicYearName: string;
  programCode?: string;
}

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
 * UTILITY: Formats names for file systems
 */
const getSafeFileName = (name: string | undefined): string => {
  const base =
    typeof name === "string" && name.trim().length > 0 ? name : "Program";
  return base.replace(/[^a-z0-9]/gi, "_").toUpperCase();
};

export async function previewPromotion(data: PromotionParams) {
  const res = await api.post<{
    success: boolean;
    data: PromotionPreviewResponse;
  }>("/promote/preview-promotion", data);
  return res.data.data;
}

export async function bulkPromoteClass(data: PromotionParams) {
  const res = await api.post<BulkPromoteResponse>(
    "/promote/bulk-promote",
    data,
  );
  return res.data;
}

export async function downloadPromotionReportWithProgress(
  data: PromotionParams,
  programName: string | undefined,
  onProgress: (percent: number, message: string) => void,
) {
  const safeName = getSafeFileName(programName);

  return startStreamingDownload(
    "/promote/download-report-progress",
    data,
    onProgress,
    `Promotion_Package_${safeName}_Y${data.yearToPromote}.zip`,
  );
}

export async function downloadIneligibilityNoticesWithProgress(
  data: PromotionParams,
  programName: string | undefined,
  onProgress: (percent: number, message: string) => void,
) {
  const safeName = getSafeFileName(programName);

  return startStreamingDownload(
    "/promote/download-notices-progress",
    data,
    onProgress,
    `Supplementary_Notices_${safeName}_Y${data.yearToPromote}.zip`,
  );
}

/**
 * LEGACY / DIRECT DOWNLOADS (Fallback)
 */
export async function downloadPromotionReport(
  data: PromotionParams,
  programName: string,
) {
  const res = await api.post("/promote/download-report", data, {
    responseType: "arraybuffer",
    timeout: 600000,
  });

  const safeName = getSafeFileName(programName);
  const blob = new Blob([res.data], { type: "application/zip" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `Promotion_Report_${safeName}_Y${data.yearToPromote}.zip`,
  );
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    link.remove();
  }, 100);
}

export async function downloadIneligibilityNotices(data: {
  programId: string;

  yearToPromote: number;

  academicYearName: string;
}) {
  const res = await api.post("/promote/download-notices", data, {
    responseType: "blob",

    timeout: 600000,
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));

  const link = document.createElement("a");

  link.href = url;

  link.setAttribute(
    "download",
    `Ineligibility_Notices_Year_${data.yearToPromote}.zip`,
  );

  document.body.appendChild(link);

  link.click();

  link.remove();
}
