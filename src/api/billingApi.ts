// ═══════════════════════════════════════════════════════════════════════════
// FILE 1: clientside/src/api/billingApi.ts
// ═══════════════════════════════════════════════════════════════════════════

import api from "@/config/axiosInstance";

export interface Invoice {
  id: string;
  label: string; // e.g. "Jul 2025 invoice"
  amount: number; // in KES
  paid: boolean;
  paidAt?: string; // ISO date string, present when paid
  dueAt: string; // ISO date string
}

export interface BillingSummary {
  planName: string; // e.g. "Institution Pro"
  billingCycle: "monthly" | "annual";
  seatLimit: number; // max students
  seatsUsed: number; // current student count
  nextInvoiceAmount: number; // KES
  nextInvoiceDate: string; // ISO date
  invoices: Invoice[]; // last 3–6 invoices
}

export async function getBillingSummary(): Promise<BillingSummary> {
  const res = await api.get<BillingSummary>("/billing/summary");
  return res.data;
}

export async function downloadInvoice(invoiceId: string): Promise<Blob> {
  const res = await api.get<Blob>(`/billing/invoices/${invoiceId}/download`, {
    responseType: "blob",
  });
  return res.data;
}



