// clientside/src/components/billing/BillingSettings.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  changePlan, updateBillingContact, switchBillingCycle, formatCurrency,
  type BillingSummary, type ChangePlanPayload, type BillingContactPayload,
} from "@/api/billingApi";
import { useToast } from "@/context/ToastContext";
import {
  AlertCircle, Info, TrendingUp, CreditCard,
  Building2, Loader2, ChevronDown, X
} from "lucide-react";

// const inp = "w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-green-darkest/5 focus:border-green-darkest/40 focus:bg-white transition-all";
// const lbl = "text-[9px] font-black uppercase tracking-[0.2em] text-green-darkest/40 block mb-2";
// const card = "bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm";

 const inp =
   "w-full bg-white border border-green-darkest/10 rounded-lg py-2.5 px-4 text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-yellow-gold/20 focus:border-yellow-gold/50 transition-all";
 const lbl = "text-[10px] font-black uppercase tracking-[0.25em] text-green-darkest/50 block mb-1.5";
 const card = "bg-white rounded-xl border border-green-darkest/5 shadow-sm p-6";

export function AlertBanners({ summary }: { summary: BillingSummary }) {
  const { alerts, plan, usage, billing } = summary;

  const banners = [
    {
      condition: billing.accountStatus === "trial",
      bg: "bg-amber-50/60 border-amber-200 text-amber-800",
      icon: <Info size={15} className="text-amber-600 flex-shrink-0" />,
      text: `Account operating in evaluation window. Active until ${billing.trialEndsAt ? new Date(billing.trialEndsAt).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" }) : ""}. Establish a core settlement framework to prevent service pauses.`
    },
    {
      condition: billing.accountStatus === "suspended",
      bg: "bg-red-50 border-red-200 text-red-800",
      icon: <AlertCircle size={15} className="text-red-600 flex-shrink-0" />,
      text: `Operational system freeze active. ${billing.suspensionReason || "Contact root system security administrators to resume operations."}`
    },
    {
      condition: alerts.overdueCount > 0,
      bg: "bg-red-50/60 border-red-200 text-red-700",
      icon: <AlertCircle size={15} className="text-red-500 flex-shrink-0" />,
      text: `${alerts.overdueCount} statement(s) outstanding — total overhead of ${formatCurrency(alerts.unpaidTotal, plan.currency)}. Resolve within the active workspace.`
    },
    {
      condition: alerts.overageWarning,
      bg: "bg-orange-50 border-orange-200 text-orange-800",
      icon: <TrendingUp size={15} className="text-orange-600 flex-shrink-0" />,
      text: `System scale limits exceeded by ${usage.extraSeats} allocation tracks. Current excess costs mapping at ${formatCurrency(usage.extraSeats * plan.perSeatRate, plan.currency)}/mo.`
    },
    {
      condition: alerts.nearLimit && !alerts.overageWarning,
      bg: "bg-blue-50/60 border-blue-200 text-blue-800",
      icon: <Info size={15} className="text-blue-500 flex-shrink-0" />,
      text: `Workspace volume usage currently optimized at ${usage.usagePercent}% capacity limit (${usage.activeStudents}/${usage.includedSeats}).`
    }
  ];

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {banners.map((b, i) => b.condition && (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className={`flex items-start gap-3 border rounded-xl px-5 py-4 overflow-hidden shadow-xs ${b.bg}`}
          >
            <div className="mt-0.5">{b.icon}</div>
            <p className="text-[11px] font-medium leading-relaxed tracking-wide">{b.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function PlanSettings({ summary, onRefresh }: { summary: BillingSummary; onRefresh: () => void }) {
  const { addToast } = useToast();
  const { plan } = summary;

  const [showModal, setShowModal] = useState(false);
  const [newPlan, setNewPlan] = useState(plan.name);
  const [reason, setReason] = useState("");
  const [customSeats, setCustomSeats] = useState("");
  const [customBase, setCustomBase] = useState("");
  const [customPerSeat, setCustomPerSeat] = useState("");
  const [saving, setSaving] = useState(false);
  const [cycleLoading, setCycleLoading] = useState(false);

  const handleChangePlan = async () => {
    if (!newPlan.trim()) return;
    setSaving(true);
    try {
      const payload: ChangePlanPayload = {
        newPlanName: newPlan,
        reason: reason || undefined,
        customSeatLimit: customSeats ? Number(customSeats) : undefined,
        customBasePrice: customBase ? Number(customBase) : undefined,
        customPerSeatRate: customPerSeat ? Number(customPerSeat) : undefined,
      };
      const res = await changePlan(payload);
      addToast(res.message, "success");
      setShowModal(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Configuration shift failed.";
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
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Cycle alteration rejected.";
      addToast(msg, "error");
    } finally {
      setCycleLoading(false);
    }
  };

  return (
    <>
      <div className={card}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-black text-green-darkest uppercase tracking-wider">
            Plan Infrastructure
          </p>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => {
              setShowModal(true);
              setNewPlan(plan.name);
            }}
            className="text-[10px] font-bold text-yellow-gold hover:text-amber-600 transition-colors flex items-center gap-1.5"
          >
            <CreditCard size={12} /> Mutate Framework
          </motion.button>
        </div>

        <div className="space-y-3 mb-6">
          {[
            { label: "Active Model", value: plan.name + (plan.isCustomPlan ? " (Customized)" : "") },
            { label: "Included Student Allocation", value: `${plan.includedSeats.toLocaleString()} seats` },
            { label: "Contract Baseline Base", value: `${formatCurrency(plan.basePrice, plan.currency)} / mo` },
            { label: "Overage Incremental Rate", value: `${formatCurrency(plan.perSeatRate, plan.currency)} / active seat` },
            { label: "Tax Obligation Mapping", value: `${(plan.taxRate * 100).toFixed(0)}%` },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{r.label}</span>
              <span className="text-xs font-mono text-green-darkest font-medium">{r.value}</span>
            </div>
          ))}
        </div>

        <div>
          <p className={lbl}>Settlement Invoicing Interval</p>
          <div className="grid grid-cols-2 gap-3">
            {(["monthly", "annual"] as const).map((cycle) => {
              const active = plan.cycle === cycle;
              return (
                <button
                  key={cycle}
                  onClick={() => handleCycleSwitch(cycle)}
                  disabled={cycleLoading}
                  className={`p-4 rounded-xl border-2 text-left relative overflow-hidden transition-all disabled:opacity-50 ${
                    active ? "border-green-darkest bg-green-darkest/[0.02]" : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <p className={`text-xs font-black uppercase tracking-wider ${active ? "text-green-darkest" : "text-slate-400"}`}>
                    {cycle}
                  </p>
                  {cycle === "annual" && (
                    <p className="text-[9px] font-bold text-emerald-600 mt-1 font-mono">
                      Save {formatCurrency(plan.basePrice * 12 * 0.15, plan.currency)}/yr
                    </p>
                  )}
                  {active && (
                    <motion.div layoutId="activeCycleDot" className="absolute right-3 top-3 w-1.5 h-1.5 bg-green-darkest rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-green-darkest/20 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 relative z-10 overflow-hidden"
            >
              <div className="bg-green-darkest px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-yellow-gold text-[9px] font-black uppercase tracking-[0.25em] mb-0.5">Configuration Engine</p>
                  <h3 className="text-white text-sm font-black">Alter Infrastructure Metrics</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className={lbl}>Target Framework Profile</label>
                  <div className="relative">
                    <select className={`${inp} appearance-none pr-10`} value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>
                      {summary.planCatalogue.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name} — Allocation threshold: {p.includedSeats.toLocaleString()} seats
                        </option>
                      ))}
                      <option value="Custom">Custom Enterprise Profile</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <AnimatePresence>
                  {newPlan === "Custom" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-3 gap-3"
                    >
                      <div>
                        <label className={lbl}>Seats Limit</label>
                        <input type="number" className={inp} placeholder="2500" value={customSeats} onChange={(e) => setCustomSeats(e.target.value)} />
                      </div>
                      <div>
                        <label className={lbl}>Base Price</label>
                        <input type="number" className={inp} placeholder="50000" value={customBase} onChange={(e) => setCustomBase(e.target.value)} />
                      </div>
                      <div>
                        <label className={lbl}>Overage / Unit</label>
                        <input type="number" className={inp} placeholder="15" value={customPerSeat} onChange={(e) => setCustomPerSeat(e.target.value)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className={lbl}>Modification Justification Logging</label>
                  <input type="text" className={inp} placeholder="Internal audit justification token" value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors">
                    Abort Changes
                  </button>
                  <button onClick={handleChangePlan} disabled={saving} className="flex-1 bg-green-darkest hover:bg-green-900 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} className="text-yellow-gold" />}
                    Commit System Vector
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BillingContactCard({ summary, onRefresh }: { summary: BillingSummary; onRefresh: () => void }) {
  const { addToast } = useToast();
  const contact = summary.billingContact;

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(contact?.name ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [address, setAddress] = useState(contact?.address ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const payload: BillingContactPayload = { name, email, phone: phone || undefined, address: address || undefined };
      const res = await updateBillingContact(payload);
      addToast(res.message, "success");
      setShowModal(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Contact persist mutation failure.";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={card}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-black text-green-darkest uppercase tracking-wider">
            Operational Registry Node
          </p>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => {
              setShowModal(true);
              setName(contact?.name ?? "");
              setEmail(contact?.email ?? "");
            }}
            className="text-[10px] font-bold text-yellow-gold hover:text-amber-600 transition-colors flex items-center gap-1.5"
          >
            <Building2 size={12} /> Modify Registry
          </motion.button>
        </div>

        {contact ? (
          <div className="space-y-3">
            {[
              { label: "Target Representative", value: contact.name },
              { label: "Secure Destination Route", value: contact.email },
              { label: "Communications Line", value: contact.phone ?? "—" },
              { label: "Physical Processing Node", value: contact.address ?? "—" },
            ].map((r) => (
              <div key={r.label} className="flex items-start justify-between py-2 border-b border-slate-100 last:border-0 gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex-shrink-0">{r.label}</span>
                <span className="text-xs font-mono text-green-darkest text-right font-medium break-all">{r.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-3">No contact profile structured</p>
            <button onClick={() => setShowModal(true)} className="text-[11px] font-bold text-yellow-gold hover:underline">
              Bind Contact Signature →
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-green-darkest/20 backdrop-blur-md" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 relative z-10 overflow-hidden"
            >
              <div className="bg-green-darkest px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-yellow-gold text-[9px] font-black uppercase tracking-[0.25em] mb-0.5">Contact Mapping</p>
                  <h3 className="text-white text-sm font-black">Registry Assignment</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className={lbl}>Representative Authority Name</label>
                  <input type="text" className={inp} placeholder="Finance Executive Signature" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>System Communications Endpoint</label>
                  <input type="email" className={inp} placeholder="billing@institution.ac.ke" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Phone Vector</label>
                    <input type="text" className={inp} placeholder="+254..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Mailing Endpoint</label>
                    <input type="text" className={inp} placeholder="P.O. Box..." value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors">
                    Cancel Shift
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-darkest hover:bg-green-900 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Building2 size={13} className="text-yellow-gold" />}
                    Bind Metadata
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}