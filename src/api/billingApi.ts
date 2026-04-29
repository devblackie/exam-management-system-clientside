// clientside/src/api/billingApi.ts
import api from "@/config/axiosInstance";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  lines: InvoiceLine[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueAt: string;
  paidAt?: string;
  paidAmount?: number;
  paymentRef?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface UsageSnapshot {
  snapshotDate: string;
  activeStudents: number;
  totalStudents: number;
  seatLimit: number;
  overage: number;
}

export interface PlanCatalogueEntry {
  name: string;
  seatLimit: number;
  monthlyKES: number;
  overageRate: number;
}

export interface BillingSummary {
  plan: {
    name: string;
    cycle: "monthly" | "annual";
    seatLimit: number;
    basePrice: number;
    overageRate: number;
    currency: string;
    taxRate: number;
    isCustomPlan: boolean;
  };
  usage: {
    activeStudents: number;
    totalStudents: number;
    seatLimit: number;
    overage: number;
    usagePercent: number;
  };
  billing: {
    accountStatus: string;
    nextInvoiceDate: string;
    trialEndsAt?: string;
    suspendedAt?: string;
    suspensionReason?: string;
  };
  alerts: {
    overdueCount: number;
    unpaidTotal: number;
    overageWarning: boolean;
    nearLimit: boolean;
  };
  recentInvoices: Invoice[];
  billingContact?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  planCatalogue: PlanCatalogueEntry[];
}

export interface InvoiceListResponse {
  total: number;
  page: number;
  invoices: Invoice[];
  currency: string;
}

export interface RecordPaymentPayload {
  paidAmount: number;
  paymentRef: string;
  paymentMethod: string;
  notes?: string;
}

export interface ChangePlanPayload {
  newPlanName: string;
  reason?: string;
  customSeatLimit?: number;
  customBasePrice?: number;
  customOverageRate?: number;
}

export interface BillingContactPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// ── API calls ──────────────────────────────────────────────────────────────────

export async function getBillingSummary(): Promise<BillingSummary> {
  const res = await api.get<BillingSummary>("/billing/summary");
  return res.data;
}

export async function listInvoices(
  params: {
    status?: InvoiceStatus | "";
    page?: number;
    limit?: number;
  } = {},
): Promise<InvoiceListResponse> {
  const query: Record<string, string> = {
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
  };
  if (params.status) query.status = params.status;
  const res = await api.get<InvoiceListResponse>("/billing/invoices", {
    params: query,
  });
  return res.data;
}

export async function generateInvoice(): Promise<{
  message: string;
  invoice: Invoice;
}> {
  const res = await api.post<{ message: string; invoice: Invoice }>(
    "/billing/invoices/generate",
  );
  return res.data;
}

export async function recordPayment(
  invoiceId: string,
  payload: RecordPaymentPayload,
): Promise<{ message: string }> {
  const res = await api.patch<{ message: string }>(
    `/billing/invoices/${invoiceId}/pay`,
    payload,
  );
  return res.data;
}

export async function voidInvoice(
  invoiceId: string,
  reason: string,
): Promise<{ message: string }> {
  const res = await api.patch<{ message: string }>(
    `/billing/invoices/${invoiceId}/void`,
    { reason },
  );
  return res.data;
}

export async function changePlan(
  payload: ChangePlanPayload,
): Promise<{ message: string }> {
  const res = await api.patch<{ message: string }>("/billing/plan", payload);
  return res.data;
}

export async function updateBillingContact(
  payload: BillingContactPayload,
): Promise<{ message: string }> {
  const res = await api.patch<{ message: string }>("/billing/contact", payload);
  return res.data;
}

export async function switchBillingCycle(
  cycle: "monthly" | "annual",
): Promise<{ message: string }> {
  const res = await api.patch<{ message: string }>("/billing/cycle", { cycle });
  return res.data;
}

// ── Helpers (UI use only, no API calls) ───────────────────────────────────────

export function formatCurrency(amount: number, currency = "KES"): string {
  return `${currency} ${amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPeriod(start: string, end: string): string {
  const s = new Date(start).toLocaleDateString("en-KE", {
    month: "short",
    year: "numeric",
  });
  const e = new Date(end).toLocaleDateString("en-KE", {
    month: "short",
    year: "numeric",
  });
  return s === e ? s : `${s} – ${e}`;
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

export const STATUS_COLORS: Record<
  InvoiceStatus,
  { bg: string; text: string; dot: string }
> = {
  draft: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  sent: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  paid: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  overdue: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  void: { bg: "bg-slate-100", text: "text-slate-400", dot: "bg-slate-300" },
};
