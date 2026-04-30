// clientside/src/app/admin/billing/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHeader     from "@/components/ui/PageHeader";
import { useToast }   from "@/context/ToastContext";
import { getBillingSummary, generateInvoice, type BillingSummary } from "@/api/billingApi";
import BillingStatCards  from "@/components/billing/BillingStatCards";
import SeatUsageBar      from "@/components/billing/SeatUsageBar";
import InvoiceTable      from "@/components/billing/InvoiceTable";
import { AlertBanners, PlanSettings, BillingContactCard } from "@/components/billing/BillingSettings";
import { Receipt, FileText, Settings, Loader2, Plus, RefreshCcw } from "lucide-react";

type Tab = "overview" | "invoices" | "settings";

export default function BillingPage() {
  const { addToast } = useToast();

  const [summary, setSummary]       = useState<BillingSummary | null>(null);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<Tab>("overview");
  const [generating, setGenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // bumping forces InvoiceTable refetch

  // ── Fetch summary ──────────────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBillingSummary();
      setSummary(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        // Billing record doesn't exist yet.
        // This means ensureBillingRecord() hasn't run for this institution.
        // The fix is in defaultData.ts — once deployed, this branch won't hit.
        setSummary(null);
      } else {
        addToast("Failed to load billing data. Check your connection.", "error");
        setSummary(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const handleRefresh = () => {
    fetchSummary();
    setRefreshKey(k => k + 1);
  };

  // ── Generate invoice ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateInvoice();
      addToast(res.message, "success");
      handleRefresh();
      setTab("invoices");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Could not generate invoice. Check account status.";
      addToast(msg, "error");
    } finally {
      setGenerating(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ProtectedRoute allowed={["admin"]}>
        <div className="max-w-8xl ml-40 my-10">
          <div className="bg-[#F8F9FA] min-h-[100vh] rounded-xl shadow-2xl p-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-5 mb-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl h-28 animate-pulse border border-green-darkest/5" />
              ))}
            </div>
            <div className="bg-white rounded-xl h-20 animate-pulse border border-green-darkest/5 mb-6" />
            <div className="bg-white rounded-xl h-64 animate-pulse border border-green-darkest/5" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── No billing record — setup state ───────────────────────────────────────
  // This shows only if ensureBillingRecord() hasn't been called yet.
  // Deploy the defaultData.ts fix and this disappears permanently.
  if (!summary) {
    return (
      <ProtectedRoute allowed={["admin"]}>
        <div className="max-w-8xl ml-40 my-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-[#F8F9FA] min-h-[100vh] rounded-xl shadow-2xl p-10 relative overflow-hidden">
            <Receipt size={400} className="absolute -right-16 -bottom-16 opacity-[0.02] text-green-darkest pointer-events-none" />
            <PageHeader title="Billing &amp;" highlightedTitle="Subscriptions" systemLabel="Account Management" />

            <div className="mt-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="h-20 w-20 rounded-2xl bg-green-darkest/5 border border-green-darkest/10 flex items-center justify-center mb-6">
                <Receipt size={32} className="text-green-darkest/30" />
              </div>
              <h2 className="text-xl font-light text-green-darkest mb-3">Billing not configured</h2>
              <p className="text-sm text-slate-400 font-light leading-relaxed mb-8">
                No billing record found for this institution. This is usually resolved automatically on the next server restart after the <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">defaultData.ts</span> fix is deployed.
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left w-full mb-8">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">Quick fix — run once in production:</p>
                <pre className="text-[10px] font-mono text-amber-800 whitespace-pre-wrap leading-relaxed">
{`node -e "
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      const { ensureBillingForAllInstitutions } =
        require('./dist/config/defaultData');
      await ensureBillingForAllInstitutions();
      process.exit(0);
    });
"`}
                </pre>
              </div>
              <button
                onClick={fetchSummary}
                className="flex items-center gap-2 bg-green-darkest hover:bg-green-800 text-white px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <RefreshCcw size={13} className="text-yellow-gold" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Full billing dashboard ─────────────────────────────────────────────────
  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="max-w-8xl ml-40 my-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#F8F9FA] min-h-[100vh] rounded-xl shadow-2xl p-10 relative overflow-hidden">

          {/* Watermark */}
          <Receipt size={400} className="absolute -right-16 -bottom-16 opacity-[0.02] text-green-darkest pointer-events-none" />

          {/* ── Header row ──────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-8">
            <PageHeader
              title="Billing &amp;"
              highlightedTitle="Subscriptions"
              systemLabel="Account Management"
            />
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={handleRefresh}
                className="p-2.5 bg-white border border-green-darkest/10 rounded-lg text-slate-400 hover:text-green-darkest transition-colors shadow-sm"
                title="Refresh"
              >
                <RefreshCcw size={14} />
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 bg-green-darkest hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
              >
                {generating
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Plus size={13} className="text-yellow-gold" />
                }
                {generating ? "Generating…" : "Generate Invoice"}
              </button>
            </div>
          </div>

          {/* ── Alert banners ─────────────────────────────────────────── */}
          <div className="mb-6">
            <AlertBanners summary={summary} />
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-green-darkest/5 p-1 mb-8 w-fit shadow-sm">
            {([
              { id: "overview", label: "Overview", icon: <Receipt size={11} /> },
              { id: "invoices", label: "Invoices",  icon: <FileText size={11} /> },
              { id: "settings", label: "Settings",  icon: <Settings size={11} /> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  tab === t.id
                    ? "bg-green-darkest text-white shadow-sm"
                    : "text-slate-400 hover:text-green-darkest"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/* OVERVIEW TAB                                                */}
          {/* ════════════════════════════════════════════════════════════ */}
          {tab === "overview" && (
            <div className="space-y-6">
              <BillingStatCards summary={summary} />
              <SeatUsageBar summary={summary} />

              {/* Recent invoices preview */}
              <div className="bg-white rounded-xl border border-green-darkest/5 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-black text-green-darkest uppercase tracking-wider">Recent Invoices</p>
                  <button
                    onClick={() => setTab("invoices")}
                    className="text-[10px] font-bold text-yellow-gold hover:text-yellow-500 transition-colors flex items-center gap-1"
                  >
                    View all <span aria-hidden>→</span>
                  </button>
                </div>

                {summary.recentInvoices.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-[11px] font-mono text-slate-300 uppercase tracking-widest mb-2">No invoices yet</p>
                    <p className="text-[10px] text-slate-300">
                      Click <span className="font-bold">Generate Invoice</span> to create the first one.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {summary.recentInvoices.map(inv => {
                      const { STATUS_COLORS } = require("@/api/billingApi");
                      const s = STATUS_COLORS[inv.status];
                      const { formatCurrency: fc, formatDate: fd } = require("@/api/billingApi");
                      return (
                        <div key={inv.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-[11px] font-bold text-green-darkest font-mono">{inv.invoiceNumber}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{inv.label}</p>
                          </div>
                          <div className="flex items-center gap-5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                              {inv.status}
                            </span>
                            <p className="text-[12px] font-bold text-green-darkest font-mono w-32 text-right">
                              {fc(inv.total, inv.currency)}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 w-24 text-right">
                              {fd(inv.dueAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* INVOICES TAB                                                */}
          {/* ════════════════════════════════════════════════════════════ */}
          {tab === "invoices" && (
            // key={refreshKey} forces the component to remount and refetch
            // whenever we generate a new invoice from the header button
            <InvoiceTable key={refreshKey} currency={summary.plan.currency} />
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* SETTINGS TAB                                                */}
          {/* ════════════════════════════════════════════════════════════ */}
          {tab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlanSettings     summary={summary} onRefresh={handleRefresh} />
              <BillingContactCard summary={summary} onRefresh={handleRefresh} />

              {/* Account status card */}
              <div className="bg-white rounded-xl border border-green-darkest/5 shadow-sm p-6 lg:col-span-2">
                <p className="text-[11px] font-black text-green-darkest uppercase tracking-wider mb-4">Account Status</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Status",          value: summary.billing.accountStatus.toUpperCase() },
                    { label: "Next Invoice",    value: new Date(summary.billing.nextInvoiceDate).toLocaleDateString("en-KE",{ day:"2-digit", month:"long", year:"numeric" }) },
                    { label: "Trial Ends",      value: summary.billing.trialEndsAt ? new Date(summary.billing.trialEndsAt).toLocaleDateString("en-KE",{ day:"2-digit", month:"short", year:"numeric" }) : "N/A" },
                    { label: "Currency",        value: summary.plan.currency },
                  ].map(r => (
                    <div key={r.label} className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{r.label}</p>
                      <p className="text-[12px] font-bold text-green-darkest font-mono">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}