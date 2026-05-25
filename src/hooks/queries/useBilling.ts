// // clientside/src/hooks/useBilling.ts
// import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
// import {
//   getBillingSummary, listInvoices, generateInvoice, recordPayment,
//   voidInvoice, changePlan, updateBillingContact, switchBillingCycle,
//   type BillingSummary,
//   type InvoiceListResponse,
//   type InvoiceStatus, type ChangePlanPayload, type BillingContactPayload,
// } from "@/api/billingApi";

// // ── Queries ────────────────────────────────────────────────────────────

// export const useBillingSummary = () =>
//   useQuery<BillingSummary, Error>({
//     queryKey: ["billingSummary"],
//     queryFn: getBillingSummary,
//     staleTime: 2 * 60 * 1000,
//     retry: 1,
//   });

// export const useInvoiceList = (params: {
//   status?: InvoiceStatus | "";
//   page?: number;
//   limit?: number;
// }) =>
//   useQuery<InvoiceListResponse, Error>({
//     queryKey: ["invoices", params],
//     queryFn: () => listInvoices(params),
//     placeholderData: keepPreviousData,
//     staleTime: 60 * 1000,
//   });

// // ── Mutations ──────────────────────────────────────────────────────────

// export const useGenerateInvoice = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: generateInvoice,
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["billingSummary"] });
//       qc.invalidateQueries({ queryKey: ["invoices"] });
//     },
//   });
// };

// export const useRecordPayment = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       invoiceId,
//       payload,
//     }: {
//       invoiceId: string;
//       payload: {
//         paidAmount: number;
//         paymentRef: string;
//         paymentMethod: string;
//         notes?: string;
//       };
//     }) => recordPayment(invoiceId, payload),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["billingSummary"] });
//       qc.invalidateQueries({ queryKey: ["invoices"] });
//     },
//   });
// };

// export const useVoidInvoice = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       invoiceId,
//       reason,
//     }: {
//       invoiceId: string;
//       reason: string;
//     }) => voidInvoice(invoiceId, reason),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["billingSummary"] });
//       qc.invalidateQueries({ queryKey: ["invoices"] });
//     },
//   });
// };

// export const useChangePlan = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (payload: ChangePlanPayload) => changePlan(payload),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["billingSummary"] });
//     },
//   });
// };

// export const useUpdateBillingContact = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (payload: BillingContactPayload) =>
//       updateBillingContact(payload),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["billingSummary"] });
//     },
//   });
// };

// export const useSwitchBillingCycle = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (cycle: "monthly" | "annual") => switchBillingCycle(cycle),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ["billingSummary"] });
//     },
//   });
// };





// clientside/src/hooks/queries/useBilling.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import api from "@/config/axiosInstance";
import {
  getBillingSummary,
  listInvoices,
  generateInvoice,
  recordPayment,
  voidInvoice,
  changePlan,
  updateBillingContact,
  switchBillingCycle,
  type BillingSummary,
  type InvoiceListResponse,
  type InvoiceStatus,
  type ChangePlanPayload,
  type BillingContactPayload,
  type RecordPaymentPayload,
} from "@/api/billingApi";

// ── Additional response types ───────────────────────────────────────────

export interface HierarchyResponse {
  schools: {
    schoolName: string;
    schoolCode: string;
    totalStudents: number;
    departments: {
      deptName: string;
      deptCode: string;
      totalStudents: number;
      seatLimit: number | null;
      overage: number;
      programs: {
        programName: string;
        programId: string;
        activeStudents: number;
      }[];
    }[];
  }[];
  institutionCurrency: string;
  institutionOverageRate: number;
}

export interface DepartmentSeatPayload {
  departmentCode: string;
  seatLimit: number;
}

export interface BulkPaymentPayload {
  invoiceIds: string[];
  paidAmount: number;
  paymentRef: string;
  paymentMethod: string;
  notes?: string;
}

export interface EmailLogEntry {
  _id: string;
  institution: string;
  invoiceNumber?: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed";
  errorMessage?: string;
  timestamp: string;
}

// ── Query keys (centralised) ────────────────────────────────────────────

export const BILLING_KEYS = {
  summary:   ["billingSummary"] as const,
  invoices:  (p: object) => ["invoices", p] as const,
  hierarchy: ["billingHierarchy"] as const,
  emailLogs: ["billingEmailLogs"] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────

export const useBillingSummary = () =>
  useQuery<BillingSummary, Error>({
    queryKey: BILLING_KEYS.summary,
    queryFn:  getBillingSummary,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useInvoiceList = (params: {
  status?: InvoiceStatus | "";
  page?:   number;
  limit?:  number;
}) =>
  useQuery<InvoiceListResponse, Error>({
    queryKey:        BILLING_KEYS.invoices(params),
    queryFn:         () => listInvoices(params),
    placeholderData: keepPreviousData,
    staleTime:       60 * 1000,
  });

export const useBillingHierarchy = () =>
  useQuery<HierarchyResponse, Error>({
    queryKey: BILLING_KEYS.hierarchy,
    queryFn:  async () => {
      const res = await api.get<HierarchyResponse>("/billing/hierarchy");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,   // matches the server cache TTL
  });

export const useEmailLogs = () =>
  useQuery<EmailLogEntry[], Error>({
    queryKey: BILLING_KEYS.emailLogs,
    queryFn:  async () => {
      const res = await api.get<EmailLogEntry[]>("/billing/email-logs");
      return res.data;
    },
    staleTime: 60 * 1000,
  });

// ── Mutations ───────────────────────────────────────────────────────────

export const useGenerateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generateInvoice,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.summary });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      payload,
    }: {
      invoiceId: string;
      payload:   RecordPaymentPayload;
    }) => recordPayment(invoiceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.summary });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useVoidInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      reason,
    }: {
      invoiceId: string;
      reason:    string;
    }) => voidInvoice(invoiceId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.summary });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useChangePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangePlanPayload) => changePlan(payload),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.summary });
    },
  });
};

export const useUpdateBillingContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BillingContactPayload) =>
      updateBillingContact(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.summary });
    },
  });
};

export const useSwitchBillingCycle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cycle: "monthly" | "annual") =>
      switchBillingCycle(cycle),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.summary });
    },
  });
};

export const useUpdateDepartmentSeats = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentSeatPayload) =>
      api.patch("/billing/department-seats", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.hierarchy });
      qc.invalidateQueries({ queryKey: BILLING_KEYS.summary });
    },
  });
};

export const useBulkRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkPaymentPayload) =>
      api.patch("/billing/invoices/bulk-pay", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.summary });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useResendInvoiceEmail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) =>
      api.post(`/billing/invoices/${invoiceId}/resend-email`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BILLING_KEYS.emailLogs });
    },
  });
};