// clientside/src/components/billing/InvoiceTable.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listInvoices, recordPayment, voidInvoice,
  formatCurrency, formatDate, formatPeriod,
  STATUS_LABELS, STATUS_COLORS,
  type Invoice, type InvoiceStatus, type RecordPaymentPayload,
} from "@/api/billingApi";
import { useToast } from "@/context/ToastContext";
import {
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  Loader2, ChevronDown, RefreshCcw,
} from "lucide-react";

// ── Status pill ────────────────────────────────────────────────────────────────
export function InvoiceStatusPill({ status }: { status: InvoiceStatus }) {
  const s = STATUS_COLORS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Payment modal fields ───────────────────────────────────────────────────────
interface PayModalProps {
  invoice:   Invoice;
  currency:  string;
  onClose:   () => void;
  onSuccess: () => void;
}

function PayModal({ invoice, currency, onClose, onSuccess }: PayModalProps) {
  const { addToast } = useToast();
  const [amount, setAmount]   = useState(String(invoice.total));
  const [ref, setRef]         = useState("");
  const [method, setMethod]   = useState("bank_transfer");
  const [notes, setNotes]     = useState("");
  const [saving, setSaving]   = useState(false);

  const inp = "w-full bg-white border border-green-darkest/10 rounded-lg py-2.5 px-4 text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-yellow-gold/20 transition-all";
  const lbl = "text-[10px] font-black uppercase tracking-[0.25em] text-green-darkest/50 block mb-1.5";

  const handleSave = async () => {
    if (!amount || !ref.trim() || !method) {
      addToast("Amount, reference and method are required.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: RecordPaymentPayload = {
        paidAmount:    Number(amount),
        paymentRef:    ref.trim(),
        paymentMethod: method,
        notes:         notes || undefined,
      };
      const res = await recordPayment(invoice.id, payload);
      addToast(res.message, "success");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to record payment.";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-green-darkest/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-green-darkest rounded-t-2xl px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-yellow-gold text-[9px] font-black uppercase tracking-[0.3em] mb-1">Manual Payment</p>
            <h3 className="text-white text-sm font-black">{invoice.invoiceNumber}</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-7 space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-[11px] font-bold text-emerald-700">
              Invoice total: {formatCurrency(invoice.total, currency)}
            </p>
          </div>
          <div>
            <label className={lbl}>Amount Paid ({currency})</label>
            <input type="number" className={inp} value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Payment Reference</label>
            <input type="text" className={inp} placeholder="Cheque no. / Bank ref / M-Pesa code" value={ref} onChange={e => setRef(e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Payment Method</label>
            <select className={inp} value={method} onChange={e => setMethod(e.target.value)}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Notes (optional)</label>
            <input type="text" className={inp} placeholder="Any additional notes" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-green-darkest/10 text-green-darkest py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              {saving ? "Saving…" : "Record Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Void modal ─────────────────────────────────────────────────────────────────
interface VoidModalProps {
  invoice:   Invoice;
  onClose:   () => void;
  onSuccess: () => void;
}
function VoidModal({ invoice, onClose, onSuccess }: VoidModalProps) {
  const { addToast } = useToast();
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const inp = "w-full bg-white border border-green-darkest/10 rounded-lg py-2.5 px-4 text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-yellow-gold/20 transition-all";
  const lbl = "text-[10px] font-black uppercase tracking-[0.25em] text-green-darkest/50 block mb-1.5";

  const handleVoid = async () => {
    if (!reason.trim()) { addToast("A reason is required.", "error"); return; }
    setSaving(true);
    try {
      const res = await voidInvoice(invoice.id, reason);
      addToast(res.message, "success");
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed.";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-green-darkest/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-red-700 rounded-t-2xl px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-red-200 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Void Invoice</p>
            <h3 className="text-white text-sm font-black">{invoice.invoiceNumber}</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-7 space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-[10px] font-bold text-red-700">This cannot be undone. A voided invoice remains on record for audit purposes.</p>
          </div>
          <div>
            <label className={lbl}>Reason for voiding</label>
            <textarea rows={3} className={inp + " resize-none"} placeholder="State why this invoice is being voided…" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 border border-green-darkest/10 text-green-darkest py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handleVoid} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              {saving ? "Voiding…" : "Void Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main InvoiceTable ──────────────────────────────────────────────────────────
export default function InvoiceTable({ currency = "KES" }: { currency?: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [filter, setFilter]     = useState<InvoiceStatus | "">("");
  const [loading, setLoading]   = useState(true);
  const [payInvoice, setPayInvoice]   = useState<Invoice | null>(null);
  const [voidInvoiceItem, setVoidInvoiceItem] = useState<Invoice | null>(null);

  const PAGE_SIZE = 10;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listInvoices({ status: filter || undefined, page, limit: PAGE_SIZE });
      setInvoices(data.invoices);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filter}
              onChange={e => { setFilter(e.target.value as InvoiceStatus | ""); setPage(1); }}
              className="appearance-none bg-white border border-green-darkest/10 rounded-lg py-2 pl-4 pr-8 text-[10px] font-black uppercase tracking-wider text-green-darkest outline-none focus:ring-2 focus:ring-yellow-gold/20"
            >
              <option value="">All Statuses</option>
              {(Object.entries(STATUS_LABELS) as [InvoiceStatus, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">{total} invoice{total !== 1 ? "s" : ""}</span>
        </div>
        <button onClick={fetch} className="p-2 text-slate-300 hover:text-green-darkest transition-colors" title="Refresh">
          <RefreshCcw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-green-darkest/5 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-green-darkest/5 bg-slate-50/60">
              {["Invoice #", "Period", "Lines", "Amount", "Status", "Due", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <Loader2 size={20} className="animate-spin text-slate-300 mx-auto" />
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <p className="text-[11px] font-mono text-slate-300 uppercase tracking-widest">No invoices found</p>
                  <p className="text-[10px] text-slate-300 mt-1">Click "Generate Invoice" to create the first one.</p>
                </td>
              </tr>
            ) : invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-[11px] font-bold text-green-darkest font-mono">{inv.invoiceNumber}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 max-w-[160px] truncate">{inv.label}</p>
                </td>
                <td className="px-5 py-3.5 text-[10px] font-mono text-slate-500">
                  {formatPeriod(inv.periodStart, inv.periodEnd)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="space-y-0.5">
                    {(inv.lines ?? []).map((l, i) => (
                      <p key={i} className="text-[9px] text-slate-400 font-mono truncate max-w-[180px]" title={l.description}>
                        {l.description}
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-[12px] font-bold text-green-darkest font-mono">
                    {formatCurrency(inv.total, inv.currency || currency)}
                  </p>
                  {inv.paidAmount !== undefined && inv.paidAmount < inv.total && (
                    <p className="text-[9px] text-amber-600 font-mono mt-0.5">
                      Partial: {formatCurrency(inv.paidAmount, inv.currency || currency)}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <InvoiceStatusPill status={inv.status} />
                  {inv.paymentRef && (
                    <p className="text-[8px] font-mono text-slate-400 mt-1">{inv.paymentRef}</p>
                  )}
                </td>
                <td className="px-5 py-3.5 text-[10px] font-mono text-slate-500">
                  {formatDate(inv.dueAt)}
                  {inv.paidAt && (
                    <p className="text-[9px] text-emerald-600 font-mono mt-0.5">
                      Paid {formatDate(inv.paidAt)}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {["sent","overdue"].includes(inv.status) && (
                      <button
                        onClick={() => setPayInvoice(inv)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-all"
                      >
                        <CheckCircle2 size={10} /> Pay
                      </button>
                    )}
                    {!["paid","void"].includes(inv.status) && (
                      <button
                        onClick={() => setVoidInvoiceItem(inv)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-slate-200 transition-all"
                      >
                        <XCircle size={10} /> Void
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 text-slate-400 hover:text-green-darkest disabled:opacity-30 transition-colors">
            <ChevronLeft size={15} />
          </button>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 text-slate-400 hover:text-green-darkest disabled:opacity-30 transition-colors">
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Modals */}
      {payInvoice && (
        <PayModal
          invoice={payInvoice}
          currency={currency}
          onClose={() => setPayInvoice(null)}
          onSuccess={() => { setPayInvoice(null); fetch(); }}
        />
      )}
      {voidInvoiceItem && (
        <VoidModal
          invoice={voidInvoiceItem}
          onClose={() => setVoidInvoiceItem(null)}
          onSuccess={() => { setVoidInvoiceItem(null); fetch(); }}
        />
      )}
    </>
  );
}