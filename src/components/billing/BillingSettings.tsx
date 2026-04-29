// clientside/src/components/billing/BillingSettings.tsx
//
// Three components in one file — all used only on the billing page.
// AlertBanners, PlanSettings, BillingContactCard.
"use client";

import { useState } from "react";
import {
  changePlan, updateBillingContact, switchBillingCycle,
  formatCurrency,
  type BillingSummary, type ChangePlanPayload, type BillingContactPayload,
} from "@/api/billingApi";
import { useToast } from "@/context/ToastContext";
import { AlertCircle, Info, TrendingUp, CreditCard, Building2, Loader2, ChevronDown } from "lucide-react";

// ── Shared tokens ──────────────────────────────────────────────────────────────
const inp = "w-full bg-white border border-green-darkest/10 rounded-lg py-2.5 px-4 text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-yellow-gold/20 focus:border-yellow-gold/50 transition-all";
const lbl = "text-[10px] font-black uppercase tracking-[0.25em] text-green-darkest/50 block mb-1.5";
const card = "bg-white rounded-xl border border-green-darkest/5 shadow-sm p-6";

// ══════════════════════════════════════════════════════════════════════════════
// AlertBanners
// ══════════════════════════════════════════════════════════════════════════════
export function AlertBanners({ summary }: { summary: BillingSummary }) {
  const { alerts, plan, usage, billing } = summary;

  return (
    <div className="space-y-3">
      {/* Trial notice */}
      {billing.accountStatus === "trial" && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3.5">
          <Info size={15} className="text-yellow-600 flex-shrink-0" />
          <p className="text-[11px] font-bold text-yellow-800">
            You are on a free trial.
            {billing.trialEndsAt && (
              <> Trial ends {new Date(billing.trialEndsAt).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" })}.</>
            )}
            {" "}Contact us to activate a paid plan.
          </p>
        </div>
      )}

      {/* Suspended */}
      {billing.accountStatus === "suspended" && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-xl px-5 py-3.5">
          <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
          <p className="text-[11px] font-bold text-red-800">
            Account suspended.{" "}
            {billing.suspensionReason && <span className="font-normal">{billing.suspensionReason}</span>}
            {" "}Contact support to reactivate.
          </p>
        </div>
      )}

      {/* Overdue invoices */}
      {alerts.overdueCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
          <p className="text-[11px] font-bold text-red-700">
            {alerts.overdueCount} overdue invoice{alerts.overdueCount > 1 ? "s" : ""} —{" "}
            {formatCurrency(alerts.unpaidTotal, plan.currency)} outstanding. Mark as paid in the Invoices tab.
          </p>
        </div>
      )}

      {/* Overage warning */}
      {alerts.overageWarning && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3.5">
          <TrendingUp size={15} className="text-orange-600 flex-shrink-0" />
          <p className="text-[11px] font-bold text-orange-800">
            {usage.overage} seat{usage.overage !== 1 ? "s" : ""} over your plan limit.
            Overage charge: {formatCurrency(usage.overage * plan.overageRate, plan.currency)}/month.
            Consider upgrading your plan.
          </p>
        </div>
      )}

      {/* Near limit */}
      {alerts.nearLimit && !alerts.overageWarning && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5">
          <Info size={15} className="text-blue-500 flex-shrink-0" />
          <p className="text-[11px] font-bold text-blue-800">
            {usage.usagePercent}% of your seat limit used ({usage.activeStudents}/{usage.seatLimit}).
            You may need to upgrade soon.
          </p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PlanSettings
// ══════════════════════════════════════════════════════════════════════════════
export function PlanSettings({
  summary,
  onRefresh,
}: {
  summary:   BillingSummary;
  onRefresh: () => void;
}) {
  const { addToast }  = useToast();
  const { plan }      = summary;

  const [showModal, setShowModal]   = useState(false);
  const [newPlan, setNewPlan]       = useState(plan.name);
  const [reason, setReason]         = useState("");
  const [customSeats, setCustomSeats]   = useState("");
  const [customBase, setCustomBase]     = useState("");
  const [customOverage, setCustomOverage] = useState("");
  const [saving, setSaving]         = useState(false);
  const [cycleLoading, setCycleLoading] = useState(false);

  const handleChangePlan = async () => {
    if (!newPlan.trim()) { addToast("Select a plan.", "error"); return; }
    setSaving(true);
    try {
      const payload: ChangePlanPayload = {
        newPlanName:        newPlan,
        reason:             reason || undefined,
        customSeatLimit:    customSeats   ? Number(customSeats)   : undefined,
        customBasePrice:    customBase    ? Number(customBase)    : undefined,
        customOverageRate:  customOverage ? Number(customOverage) : undefined,
      };
      const res = await changePlan(payload);
      addToast(res.message, "success");
      setShowModal(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed.";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCycleSwitch = async (cycle: "monthly" | "annual") => {
    if (cycle === plan.cycle) return;
    setCycleLoading(true);
    try {
      const res = await switchBillingCycle(cycle);
      addToast(res.message, "success");
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed.";
      addToast(msg, "error");
    } finally {
      setCycleLoading(false);
    }
  };

  return (
    <>
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-black text-green-darkest uppercase tracking-wider">Plan & Pricing</p>
          <button
            onClick={() => { setShowModal(true); setNewPlan(plan.name); setReason(""); setCustomSeats(""); setCustomBase(""); setCustomOverage(""); }}
            className="text-[10px] font-bold text-yellow-gold hover:text-yellow-500 transition-colors flex items-center gap-1"
          >
            <CreditCard size={11} /> Change Plan
          </button>
        </div>

        {/* Plan details */}
        <div className="space-y-2.5 mb-6">
          {[
            { label: "Plan",          value: plan.name + (plan.isCustomPlan ? " (Custom)" : "") },
            { label: "Seat Limit",    value: plan.seatLimit.toLocaleString() + " students"      },
            { label: "Base Price",    value: `${formatCurrency(plan.basePrice, plan.currency)} / month` },
            { label: "Overage Rate",  value: `${formatCurrency(plan.overageRate, plan.currency)} / seat above limit` },
            { label: "Tax Rate",      value: `${(plan.taxRate * 100).toFixed(0)}%`               },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{r.label}</span>
              <span className="text-[11px] font-mono text-green-darkest">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Billing cycle toggle */}
        <div>
          <p className={lbl}>Billing Cycle</p>
          <div className="grid grid-cols-2 gap-3">
            {(["monthly","annual"] as const).map(cycle => (
              <button
                key={cycle}
                onClick={() => handleCycleSwitch(cycle)}
                disabled={cycleLoading}
                className={`p-3.5 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${
                  plan.cycle === cycle
                    ? "border-green-darkest bg-green-darkest/5 shadow-sm"
                    : "border-slate-200 hover:border-green-darkest/30"
                }`}
              >
                <p className={`text-[11px] font-black uppercase tracking-tight capitalize ${plan.cycle === cycle ? "text-green-darkest" : "text-slate-500"}`}>
                  {cycle}
                </p>
                {cycle === "annual" && (
                  <p className="text-[9px] font-bold text-emerald-600 mt-0.5">10% off — save {formatCurrency(plan.basePrice * 12 * 0.1, plan.currency)}/yr</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Change plan modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-green-darkest/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-green-darkest rounded-t-2xl px-7 py-5 flex items-center justify-between">
              <div>
                <p className="text-yellow-gold text-[9px] font-black uppercase tracking-[0.3em] mb-1">Plan Management</p>
                <h3 className="text-white text-sm font-black">Change Plan</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="p-7 space-y-4">
              <div>
                <label className={lbl}>New Plan</label>
                <div className="relative">
                  <select className={inp + " pr-8 appearance-none"} value={newPlan} onChange={e => setNewPlan(e.target.value)}>
                    {summary.planCatalogue.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} — {p.seatLimit.toLocaleString()} seats @ KES {p.monthlyKES.toLocaleString()}/mo
                      </option>
                    ))}
                    <option value="Custom">Custom (Enterprise)</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {newPlan === "Custom" && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>Seat Limit</label>
                    <input type="number" className={inp} placeholder="3000" value={customSeats} onChange={e => setCustomSeats(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Base (KES)</label>
                    <input type="number" className={inp} placeholder="60000" value={customBase} onChange={e => setCustomBase(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Overage/Seat</label>
                    <input type="number" className={inp} placeholder="20" value={customOverage} onChange={e => setCustomOverage(e.target.value)} />
                  </div>
                </div>
              )}

              <div>
                <label className={lbl}>Reason (optional)</label>
                <input type="text" className={inp} placeholder="e.g. Enrolled new cohort" value={reason} onChange={e => setReason(e.target.value)} />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-green-darkest/10 text-green-darkest py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleChangePlan} disabled={saving} className="flex-1 bg-green-darkest hover:bg-green-800 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} className="text-yellow-gold" />}
                  {saving ? "Saving…" : "Confirm Change"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BillingContactCard
// ══════════════════════════════════════════════════════════════════════════════
export function BillingContactCard({
  summary,
  onRefresh,
}: {
  summary:   BillingSummary;
  onRefresh: () => void;
}) {
  const { addToast }    = useToast();
  const contact         = summary.billingContact;

  const [showModal, setShowModal] = useState(false);
  const [name, setName]     = useState(contact?.name    ?? "");
  const [email, setEmail]   = useState(contact?.email   ?? "");
  const [phone, setPhone]   = useState(contact?.phone   ?? "");
  const [address, setAddress] = useState(contact?.address ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      addToast("Name and email are required.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: BillingContactPayload = { name, email, phone: phone || undefined, address: address || undefined };
      const res = await updateBillingContact(payload);
      addToast(res.message, "success");
      setShowModal(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed.";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-black text-green-darkest uppercase tracking-wider">Billing Contact</p>
          <button
            onClick={() => { setShowModal(true); setName(contact?.name ?? ""); setEmail(contact?.email ?? ""); setPhone(contact?.phone ?? ""); setAddress(contact?.address ?? ""); }}
            className="text-[10px] font-bold text-yellow-gold hover:text-yellow-500 transition-colors flex items-center gap-1"
          >
            <Building2 size={11} /> Edit
          </button>
        </div>

        {contact ? (
          <div className="space-y-3">
            {[
              { label: "Name",    value: contact.name             },
              { label: "Email",   value: contact.email            },
              { label: "Phone",   value: contact.phone   ?? "—"   },
              { label: "Address", value: contact.address ?? "—"   },
            ].map(r => (
              <div key={r.label} className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-0 gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex-shrink-0">{r.label}</span>
                <span className="text-[11px] font-mono text-green-darkest text-right break-all">{r.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-[11px] text-slate-300 font-mono uppercase tracking-widest mb-3">No contact set</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-[10px] font-bold text-yellow-gold hover:text-yellow-500 transition-colors"
            >
              Add billing contact →
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-green-darkest/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-green-darkest rounded-t-2xl px-7 py-5 flex items-center justify-between">
              <div>
                <p className="text-yellow-gold text-[9px] font-black uppercase tracking-[0.3em] mb-1">Account Settings</p>
                <h3 className="text-white text-sm font-black">Billing Contact</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="p-7 space-y-4">
              <div>
                <label className={lbl}>Full Name</label>
                <input type="text" className={inp} placeholder="Finance Director" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" className={inp} placeholder="finance@institution.ac.ke" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Phone (optional)</label>
                  <input type="text" className={inp} placeholder="+254…" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Address (optional)</label>
                  <input type="text" className={inp} placeholder="P.O. Box…" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-green-darkest/10 text-green-darkest py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-darkest hover:bg-green-800 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Building2 size={13} className="text-yellow-gold" />}
                  {saving ? "Saving…" : "Save Contact"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}