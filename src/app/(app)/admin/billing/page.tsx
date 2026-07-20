// // clientside/src/app/admin/billing/page.tsx
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/api/billingApi";
import SeatUsageBar from "@/components/billing/SeatUsageBar";
import InvoiceTable from "@/components/billing/InvoiceTable";
import BillingHierarchy from "@/components/billing/BillingHierarchy";
import { AlertBanners, PlanSettings, BillingContactCard } from "@/components/billing/BillingSettings";
import { useBillingSummary, useGenerateInvoice } from "@/hooks/queries/useBilling";
import StatRibbon from "@/components/ui/StatRibbon";
import {
  Receipt, FileText, Settings, Loader2, Plus, RefreshCcw,
  Building2, Users, CreditCard, Wallet, AlertTriangle,
} from "lucide-react";

type Tab = "overview" | "invoices" | "departments" | "settings";

// ─── Animation variants (properly typed) ───────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function BillingPage() {
  const { addToast } = useToast();
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useBillingSummary();

  const [tab, setTab] = useState<Tab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  const generateMutation = useGenerateInvoice();

  const handleRefresh = useCallback(() => {
    refetchSummary();
    setRefreshKey((k) => k + 1);
  }, [refetchSummary]);

  const handleGenerate = useCallback(async () => {
    try {
      await generateMutation.mutateAsync();
      addToast("Invoice generated successfully.", "success");
      handleRefresh();
      setTab("invoices");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not generate invoice.";
      addToast(message, "error");
    }
  }, [generateMutation, addToast, handleRefresh]);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (summaryLoading) {
    return (
      <ProtectedRoute allowed={["admin"]}>
        <div className="max-w-7xl lg:ml-48 mt-10">
          <div className="bg-[#F8F9FA] min-h-screen rounded shadow-2xl p-10">
            <PageHeader
              title="Billing &amp;"
              highlightedTitle="Subscriptions"
              systemLabel="Financial Command Centre"
            />
            {/* Ribbon skeleton */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6 px-2">
                <div className="h-4 w-40 bg-slate-200 animate-pulse rounded" />
              </div>
              <div className="bg-white border-y border-green-darkest/5 py-10">
                <div className="max-w-[1600px] mx-auto flex flex-wrap lg:flex-nowrap">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-1 px-8 lg:px-10">
                      <div className="h-6 w-12 bg-slate-200 animate-pulse rounded mb-4" />
                      <div className="h-3 w-20 bg-slate-200 animate-pulse rounded mb-2" />
                      <div className="h-8 w-24 bg-slate-200 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="bg-white rounded-xl h-20 animate-pulse border border-green-darkest/5" />
              <div className="bg-white rounded-xl h-20 animate-pulse border border-green-darkest/5" />
            </div>
            <div className="bg-white rounded-xl h-64 animate-pulse border border-green-darkest/5" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Error / not configured ──────────────────────────────────────────────
  if (summaryError || !summary) {
    return (
      <ProtectedRoute allowed={["admin"]}>
        <div className="max-w-7xl lg:ml-48 mt-10">
          <div className="bg-[#F8F9FA] min-h-screen rounded shadow-2xl p-10 relative">
            <Receipt
              size={400}
              className="absolute -right-16 -bottom-16 opacity-[0.02] text-green-darkest pointer-events-none"
            />
            <PageHeader
              title="Billing &amp;"
              highlightedTitle="Subscriptions"
              systemLabel="Account Management"
            />
            <div className="mt-20 max-w-lg mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-darkest/5 border border-green-darkest/10 mb-6">
                <Receipt size={36} className="text-green-darkest/30" />
              </div>
              <h2 className="text-2xl font-light text-green-darkest mb-3">
                Billing not configured
              </h2>
              <p className="text-sm text-slate-400 font-light leading-relaxed mb-8">
                No billing record found. This is usually resolved automatically
                on the next server restart.
              </p>
              <button
                onClick={() => refetchSummary()}
                className="inline-flex items-center gap-2 bg-green-darkest hover:bg-green-800 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-95"
              >
                <RefreshCcw size={16} className="text-yellow-gold" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Build ribbon items ──────────────────────────────────────────────────


    const ribbonItems = [
        {
          label: "Active Seats",
          value: summary.usage.activeStudents.toLocaleString(),
          sub: `${summary.usage.extraSeats > 0 ? `${summary.usage.extraSeats} over` : "Within"} ${summary.usage.includedSeats.toLocaleString()} included`,
          icon: <Users size={24} />,
          accent: summary.usage.extraSeats > 0 ? "text-red-600" : "text-green-darkest",
        },
        {
          label: "Monthly Base",
          value: formatCurrency(summary.plan.basePrice, summary.plan.currency),
          sub: summary.plan.cycle === "annual" ? "Annual contract" : "Billed monthly",
          icon: <Wallet size={24} />,
          accent: "text-green-darkest",
        },
        {
          label: "Extra Seat Cost",
          value: summary.usage.extraSeats > 0
            ? formatCurrency(summary.usage.extraSeats * summary.plan.perSeatRate, summary.plan.currency) + "/mo"
            : "KES 0",
          sub: `${summary.plan.perSeatRate} KES/seat above ${summary.usage.includedSeats}`,
          icon: <CreditCard size={24} />,
          accent: summary.usage.extraSeats > 0 ? "text-red-600" : "text-slate-400",
        },
        {
          label: "Overdue",
          value: summary.alerts.overdueCount.toString(),
          sub: summary.alerts.overdueCount > 0
            ? `${formatCurrency(summary.alerts.unpaidTotal, summary.plan.currency)} unpaid`
            : "All invoices up to date",
          icon: <AlertTriangle size={24} />,
          accent: summary.alerts.overdueCount > 0 ? "text-red-600" : "text-emerald-600",
        },
        {
          label: "Next Invoice",
          value: new Date(summary.billing.nextInvoiceDate).toLocaleDateString("en-KE", {
            month: "short",
            year: "numeric",
          }),
          sub: "Upcoming billing period",
          icon: <Receipt size={24} />,
          accent: "text-green-darkest",
        },
      ];

  return (
    <ProtectedRoute allowed={["admin"]}>
      <motion.div
        className="max-w-7xl lg:ml-48 mt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="bg-[#F8F9FA] min-h-screen rounded shadow-2xl p-6 md:p-10 relative overflow-hidden">
          <Receipt
            size={400}
            className="absolute -right-16 -bottom-16 opacity-[0.02] text-green-darkest pointer-events-none"
          />

          {/* Header + actions (Generate Invoice NOT in header) */}
          <motion.div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
            variants={itemVariants}
          >
            <PageHeader
              title="Billing &amp;"
              highlightedTitle="Subscriptions"
              systemLabel="Financial Command Centre"
              actions={
                <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-green-darkest transition-colors shadow-sm"
                  title="Refresh"
                >
                  <RefreshCcw size={16} />
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="flex items-center gap-2 bg-green-darkest hover:bg-green-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 active:scale-95"
                >
                  {generateMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} className="text-yellow-gold" />
                  )}
                  {generateMutation.isPending ? "Generating…" : "Generate Invoice"}
                </button>
              </div>
                        }
            />
        
          </motion.div>

          {/* Ribbon with stagger animation */}
          <motion.div
            className="mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex items-center gap-4 mb-6 px-2"
              variants={itemVariants}
            >
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                Financial Health Summary
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </motion.div>
            <StatRibbon
              items={ribbonItems}
              watermark={<Receipt size={200} />}
            />
          </motion.div>

          {/* Alert banners */}
          <motion.div className="mb-6" variants={itemVariants}>
            <AlertBanners summary={summary} />
          </motion.div>

          {/* Tabs + Controls (Generate Invoice placed here, not in page header) */}
          <motion.div
            className="flex flex-wrap items-center justify-between gap-4 mb-6"
            variants={itemVariants}
          >
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/60 p-1 shadow-sm">
              {[
                { id: "overview", label: "Overview", icon: <Receipt size={13} /> },
                { id: "invoices", label: "Invoices", icon: <FileText size={13} /> },
                { id: "departments", label: "Departments", icon: <Building2 size={13} /> },
                { id: "settings", label: "Settings", icon: <Settings size={13} /> },
              ].map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setTab(t.id as Tab)}
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                    tab === t.id
                      ? "bg-green-darkest text-white shadow-md"
                      : "text-slate-500 hover:text-green-darkest hover:bg-slate-50"
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t.icon} {t.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Tab content with AnimatePresence */}
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <SeatUsageBar summary={summary} />

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-green-darkest uppercase tracking-wide">
                      Recent Invoices
                    </h3>
                    <button
                      onClick={() => setTab("invoices")}
                      className="text-xs font-bold text-yellow-gold hover:text-amber-600 transition-colors flex items-center gap-1"
                    >
                      View all <span aria-hidden>→</span>
                    </button>
                  </div>
                  {summary.recentInvoices.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      No invoices yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {summary.recentInvoices.map((inv) => {
                        const s = STATUS_COLORS[inv.status];
                        return (
                          <motion.div
                            key={inv.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 hover:bg-slate-50/50 px-2 -mx-2 rounded-lg transition-colors"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div>
                              <p className="text-sm font-bold text-green-darkest font-mono">
                                {inv.invoiceNumber}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {inv.label}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                                />
                                {STATUS_LABELS[inv.status]}
                              </span>
                              <p className="text-sm font-bold text-green-darkest font-mono w-28 text-right">
                                {formatCurrency(inv.total, inv.currency)}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400 w-24 text-right hidden sm:block">
                                {formatDate(inv.dueAt)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "invoices" && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InvoiceTable
                  key={refreshKey}
                  currency={summary.plan.currency}
                />
              </motion.div>
            )}

            {tab === "departments" && (
              <motion.div
                key="departments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BillingHierarchy />
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PlanSettings summary={summary} onRefresh={handleRefresh} />
                  <BillingContactCard
                    summary={summary}
                    onRefresh={handleRefresh}
                  />
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 lg:col-span-2">
                    <h3 className="text-sm font-black text-green-darkest uppercase tracking-wide mb-4">
                      Account Status
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        {
                          label: "Status",
                          value: summary.billing.accountStatus.toUpperCase(),
                        },
                        {
                          label: "Next Invoice",
                          value: new Date(
                            summary.billing.nextInvoiceDate,
                          ).toLocaleDateString("en-KE", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }),
                        },
                        {
                          label: "Trial Ends",
                          value: summary.billing.trialEndsAt
                            ? new Date(
                                summary.billing.trialEndsAt,
                              ).toLocaleDateString("en-KE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A",
                        },
                        { label: "Currency", value: summary.plan.currency },
                      ].map((r) => (
                        <div
                          key={r.label}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                            {r.label}
                          </p>
                          <p className="text-sm font-bold text-green-darkest font-mono">
                            {r.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}