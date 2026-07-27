// clientside/src/components/billing/InvoiceTable.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import {
  formatCurrency, formatDate, formatPeriod, STATUS_COLORS, STATUS_LABELS,
  type InvoiceStatus, type Invoice,
} from "@/api/billingApi";
import {
  useInvoiceList, useRecordPayment, useVoidInvoice, useBulkRecordPayment,
  useResendInvoiceEmail,
} from "@/hooks/queries/useBilling";
import {
  Loader2, ChevronLeft, ChevronRight, Search,
  CheckCircle2, XCircle, FileText, Banknote, Download, Send, X
} from "lucide-react";

interface Props { currency: string; }

const STATUSES: Array<InvoiceStatus | ""> = ["", "paid", "sent", "overdue", "draft", "void"];
const STATUS_FILTER_LABELS: Record<InvoiceStatus | "", string> = {
  "": "All Statements", paid: "Paid", sent: "Sent", overdue: "Overdue", draft: "Draft", void: "Void",
};

const inp = "w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-green-darkest/5 focus:border-green-darkest/40 focus:bg-white transition-all";
const lbl = "text-[9px] font-black uppercase tracking-[0.2em] text-green-darkest/40 block mb-1.5";

// ── Single Payment Modal ────────────────────────────────────────────────────
function PaymentModal({
  invoiceId, invoiceTotal, currency, onClose, onSuccess,
}: { invoiceId: string; invoiceTotal: number; currency: string; onClose: () => void; onSuccess: () => void }) {
  const { addToast } = useToast();
  const mutation = useRecordPayment();
  const [amount, setAmount] = useState(invoiceTotal.toString());
  const [ref, setRef] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!ref.trim()) { addToast("Payment reference is required.", "error"); return; }
    if (!Number(amount)) { addToast("Enter a valid amount.", "error"); return; }
    try {
      await mutation.mutateAsync({
        invoiceId,
        payload: {
          paidAmount: Number(amount),
          paymentRef: ref,
          paymentMethod: method,
          notes: notes || undefined,
        },
      });
      addToast("Payment entry authorized successfully.", "success");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Execution failed.";
      addToast(msg, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-green-darkest/20 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: "spring", stiffness: 450, damping: 32 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 relative z-10 overflow-hidden">
        <div className="bg-green-darkest px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-yellow-gold text-[9px] font-black uppercase tracking-[0.25em] mb-0.5">Payment Ledger Entry</p>
            <h3 className="text-white text-sm font-black">Record Invoice Settlement</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={lbl}>Settled Amount ({currency})</label>
            <input type="number" className={inp} value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Transaction Reference Token</label>
            <input type="text" className={inp} value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. MPESA-NJK9823 or EFT-REF" />
          </div>
          <div>
            <label className={lbl}>Settlement Route</label>
            <select className={inp} value={method} onChange={e => setMethod(e.target.value)}>
              {["Bank Transfer","M-Pesa","Cheque","Cash","Other"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Audit Memo Notes (optional)</label>
            <input type="text" className={inp} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal execution remarks" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button onClick={onClose} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-colors">Abort</button>
            <button onClick={handleSubmit} disabled={mutation.isPending} className="flex-1 bg-green-darkest hover:bg-green-900 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
              {mutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Banknote size={13} className="text-yellow-gold" />}
              Commit Payment
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Void Modal ──────────────────────────────────────────────────────────────
function VoidModal({
  invoiceId, onClose, onSuccess,
}: { invoiceId: string; onClose: () => void; onSuccess: () => void }) {
  const { addToast } = useToast();
  const mutation = useVoidInvoice();
  const [reason, setReason] = useState("");

  const handleVoid = async () => {
    if (!reason.trim()) { addToast("A validation reason is required to void.", "error"); return; }
    try {
      await mutation.mutateAsync({ invoiceId, reason });
      addToast("Statement successfully decoupled and voided.", "success");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Void path failed.";
      addToast(msg, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-red-900/10 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: "spring", stiffness: 450, damping: 32 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-red-100 relative z-10 overflow-hidden">
        <div className="bg-red-600 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-red-200 text-[9px] font-black uppercase tracking-[0.25em] mb-0.5">Destructive Invalidation</p>
            <h3 className="text-white text-sm font-black">Void Ledger Entry</h3>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600/50 block mb-1.5">Void Justification Log</label>
            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-400 focus:bg-white transition-all" value={reason} onChange={e => setReason(e.target.value)} placeholder="Issued in error, structural upgrade duplicate" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-colors">Cancel</button>
            <button onClick={handleVoid} disabled={mutation.isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
              {mutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              Confirm Invalidation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Bulk Payment Modal ──────────────────────────────────────────────────────
function BulkPaymentModal({
  selectedInvoices, onClose, onSuccess,
}: { selectedInvoices: Invoice[]; onClose: () => void; onSuccess: () => void }) {
  const { addToast } = useToast();
  const mutation = useBulkRecordPayment();
  const [amount, setAmount] = useState("0");
  const [ref, setRef] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");

  const handleBulkPay = async () => {
    if (!ref.trim()) { addToast("Payment reference is required.", "error"); return; }
    if (!Number(amount)) { addToast("Enter a valid amount.", "error"); return; }
    try {
      await mutation.mutateAsync({
        invoiceIds: selectedInvoices.map(i => i.id),
        paidAmount: Number(amount),
        paymentRef: ref,
        paymentMethod: method,
        notes: notes || undefined,
      });
      addToast(`Bulk entry completed for ${selectedInvoices.length} segments.`, "success");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Bulk resolution execution failed.";
      addToast(msg, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-green-darkest/20 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: "spring", stiffness: 450, damping: 32 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 relative z-10 overflow-hidden">
        <div className="bg-green-darkest px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-yellow-gold text-[9px] font-black uppercase tracking-[0.25em] mb-0.5">Bulk Settlement Stack</p>
            <h3 className="text-white text-sm font-black">Reconcile {selectedInvoices.length} Statements</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={lbl}>Aggregated Base Payment (KES)</label>
            <input type="number" className={inp} value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Common Identification Track Token</label>
            <input type="text" className={inp} value={ref} onChange={e => setRef(e.target.value)} placeholder="e.g. BULK-MPESA-TRACK" />
          </div>
          <div>
            <label className={lbl}>Settlement Vector Route</label>
            <select className={inp} value={method} onChange={e => setMethod(e.target.value)}>
              {["Bank Transfer","M-Pesa","Cheque","Cash","Other"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Notes (optional)</label>
            <input type="text" className={inp} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Cluster ledger trace info" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button onClick={onClose} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-colors">Abort Execution</button>
            <button onClick={handleBulkPay} disabled={mutation.isPending} className="flex-1 bg-green-darkest hover:bg-green-900 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
              {mutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Banknote size={13} className="text-yellow-gold" />}
              Execute Cluster Pay
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function exportToCSV(invoices: Invoice[], currency: string) {
  const headers = ["Invoice #", "Period", "Lines", "Amount", "Status", "Due", "Paid At"];
  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    `${formatPeriod(inv.periodStart, inv.periodEnd)}`,
    (inv.lines ?? []).map(l => l.description).join("; "),
    formatCurrency(inv.total, currency),
    inv.status,
    formatDate(inv.dueAt),
    inv.paidAt ? formatDate(inv.paidAt) : "",
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(field => `"${field}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ledger_export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function InvoiceTable({ currency }: Props) {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);
  const [payModal, setPayModal] = useState<{ id: string; total: number } | null>(null);
  const [voidModal, setVoidModal] = useState<string | null>(null);
  const [bulkModal, setBulkModal] = useState<Invoice[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, isError, refetch } = useInvoiceList({ status: statusFilter, page, limit: 10 });
  const resendMutation = useResendInvoiceEmail();
  const { addToast } = useToast();

  const totalPages = data ? Math.ceil(data.total / 10) : 1;
  const closeAndRefetch = () => { setPayModal(null); setVoidModal(null); setBulkModal(null); setSelected(new Set()); refetch(); };
  
const toggleSelect = (id: string) => {
  setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
};
  const selectedInvoices = useMemo(() => data?.invoices.filter(i => selected.has(i.id)) ?? [], [data, selected]);

  return (
    <>
      <AnimatePresence>
        {payModal && <PaymentModal invoiceId={payModal.id} invoiceTotal={payModal.total} currency={currency} onClose={() => setPayModal(null)} onSuccess={closeAndRefetch} />}
        {voidModal && <VoidModal invoiceId={voidModal} onClose={() => setVoidModal(null)} onSuccess={closeAndRefetch} />}
        {bulkModal && <BulkPaymentModal selectedInvoices={bulkModal} onClose={() => setBulkModal(null)} onSuccess={closeAndRefetch} />}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400"><FileText size={16} /></div>
            <div>
              <h3 className="text-xs font-black text-green-darkest uppercase tracking-wider">Historical Statements Ledger</h3>
              {data?.total != null && <p className="text-[10px] font-mono text-slate-400 mt-0.5">{data.total} operational trace logs found</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {selected.size > 0 && (
                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setBulkModal(selectedInvoices)}
                  className="px-3.5 py-2 bg-yellow-gold hover:bg-amber-500 text-green-darkest rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors">
                  Resolve {selected.size} Invoices
                </motion.button>
              )}
            </AnimatePresence>
            <button onClick={() => data?.invoices && exportToCSV(data.invoices, currency)}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">
              <Download size={12} /> Export CSV Stack
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap mb-5">
          {STATUSES.map(s => {
            const active = statusFilter === s;
            const sc = s ? STATUS_COLORS[s as InvoiceStatus] : null;
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className="relative px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-colors">
                <span className={`relative z-10 ${active ? (sc ? sc.text : "text-white") : "text-slate-400 hover:text-slate-600"}`}>
                  {STATUS_FILTER_LABELS[s]}
                </span>
                {active && (
                  <motion.span layoutId="activeFilterTab" className={`absolute inset-0 rounded-full ${sc ? sc.bg : "bg-green-darkest"}`} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : isError || !data ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
            <Search size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-400">Ledger communication path compromised.</p>
          </div>
        ) : data.invoices.length === 0 ? (
          <div className="text-center py-14 border border-dashed border-slate-200 rounded-2xl">
            <FileText size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-400">Zero entry logs recorded inside this profile vector.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-3 py-3 w-8">
                    <input type="checkbox" className="rounded" checked={data.invoices.length > 0 && selected.size === data.invoices.length}
                      onChange={() => setSelected(selected.size === data.invoices.length ? new Set() : new Set(data.invoices.map(i => i.id)))} />
                  </th>
                  {["Invoice Profile", "Operational Frame", "Allocation Mapping", "Financial Weight", "State Token", "Limit Threshold", ""].map(h => (
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {data.invoices.map((inv, idx) => {
                  const sc = STATUS_COLORS[inv.status];
                  const canPay  = ["sent","overdue","draft"].includes(inv.status);
                  const canVoid = ["sent","overdue","draft"].includes(inv.status);
                  return (
                    <motion.tr initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.03 }} key={inv.id} className="group hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-4">
                        <input type="checkbox" className="rounded" checked={selected.has(inv.id)} onChange={() => toggleSelect(inv.id)} />
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-black font-mono text-green-darkest tracking-tight">{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">{inv.label}</p>
                      </td>
                      <td className="px-4 py-4 text-[10px] font-mono text-slate-500">{formatPeriod(inv.periodStart, inv.periodEnd)}</td>
                      <td className="px-4 py-4">
                        <div className="max-w-[180px] space-y-0.5">
                          {inv.lines.map((l, li) => <p key={li} className="text-[10px] text-slate-400 font-mono truncate">{l.description}</p>)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs font-black text-green-darkest font-mono">{formatCurrency(inv.total, inv.currency)}</p>
                        {inv.paidAt && <p className="text-[9px] font-bold text-emerald-600 font-mono mt-0.5">Settled {formatDate(inv.paidAt)}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /> {STATUS_LABELS[inv.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[10px] font-mono text-slate-400">{formatDate(inv.dueAt)}</td>
                      <td className="px-4 py-4 text-right w-28">
                        <div className="flex items-center justify-end gap-1.5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                          {canPay && (
                            <button onClick={() => setPayModal({ id: inv.id, total: inv.total })} title="Commit settlement" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          {canVoid && (
                            <button onClick={() => setVoidModal(inv.id)} title="Invalidate node" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <XCircle size={13} />
                            </button>
                          )}
                          <button onClick={() => {
                            resendMutation.mutate(inv.id, {
                              onSuccess: () => addToast("Ledger statement resent via mail pipeline.", "success"),
                              onError: (err: unknown) => {
                                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Pipeline injection failed.";
                                addToast(msg, "error");
                              },
                            });
                          }} title="Re-dispatch notification" disabled={resendMutation.isPending && resendMutation.variables === inv.id} className="p-1.5 text-slate-400 hover:text-green-darkest hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30">
                            {resendMutation.isPending && resendMutation.variables === inv.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 font-mono text-[10px]">
            <p className="text-slate-400">Node block {page} of {totalPages}</p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-green-darkest hover:border-slate-300 disabled:opacity-30 transition-all"><ChevronLeft size={13} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-green-darkest hover:border-slate-300 disabled:opacity-30 transition-all"><ChevronRight size={13} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}