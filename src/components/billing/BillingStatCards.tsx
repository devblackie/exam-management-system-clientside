// clientside/src/components/billing/BillingStatCards.tsx
"use client";

import { Users, CreditCard, Receipt, AlertTriangle } from "lucide-react";
import { BillingSummary, formatCurrency } from "@/api/billingApi";

interface Props {
  summary: BillingSummary;
}

export default function BillingStatCards({ summary }: Props) {
  const { plan, usage, alerts } = summary;

  const cards = [
    {
      label: "Active Seats",
      value: usage.activeStudents.toLocaleString(),
      sub: `of ${usage.seatLimit.toLocaleString()} limit`,
      icon: <Users size={20} className="text-green-darkest/30" />,
      accent: usage.overage > 0 ? "text-red-600" : "text-green-darkest",
      border:
        usage.overage > 0 ? "border-l-red-400" : "border-l-green-darkest/20",
    },
    {
      label: "Current Plan",
      value: plan.name,
      sub:
        plan.cycle === "annual"
          ? "Annual — 10% discount applied"
          : "Billed monthly",
      icon: <CreditCard size={20} className="text-green-darkest/30" />,
      accent: "text-green-darkest",
      border: "border-l-yellow-gold/60",
    },
    {
      label: "Monthly Base",
      value: formatCurrency(plan.basePrice, plan.currency),
      sub:
        usage.overage > 0
          ? `+${formatCurrency(usage.overage * plan.overageRate, plan.currency)} overage`
          : "No overage charges",
      icon: <Receipt size={20} className="text-green-darkest/30" />,
      accent: "text-green-darkest",
      border: "border-l-green-darkest/20",
    },
    {
      label: "Overdue",
      value: alerts.overdueCount.toString(),
      sub:
        alerts.overdueCount > 0
          ? `${formatCurrency(alerts.unpaidTotal, plan.currency)} outstanding`
          : "All invoices up to date",
      icon: (
        <AlertTriangle
          size={20}
          className={
            alerts.overdueCount > 0 ? "text-red-400" : "text-slate-300"
          }
        />
      ),
      accent: alerts.overdueCount > 0 ? "text-red-600" : "text-emerald-600",
      border:
        alerts.overdueCount > 0 ? "border-l-red-400" : "border-l-emerald-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`bg-white rounded-xl border border-green-darkest/5 border-l-4 ${c.border} p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {c.label}
            </p>
            {c.icon}
          </div>
          <p className={`text-2xl font-light tracking-tight ${c.accent}`}>
            {c.value}
          </p>
          <p className="text-[10px] text-slate-400 mt-1.5 font-mono">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
