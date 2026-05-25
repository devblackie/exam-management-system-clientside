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
      sub: `${
        usage.extraSeats > 0
          ? `${usage.extraSeats} over ${usage.includedSeats} included`
          : `within ${usage.includedSeats.toLocaleString()} included`
      }`,
      icon: <Users size={20} className="text-green-darkest/40" />,
      valueColor: usage.extraSeats > 0 ? "text-red-600" : "text-green-darkest",
      borderColor:
        usage.extraSeats > 0 ? "border-l-red-400" : "border-l-emerald-400",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Current Plan",
      value: plan.name,
      sub: plan.cycle === "annual" ? "Annual — 15% off" : "Billed monthly",
      icon: <CreditCard size={20} className="text-yellow-gold/80" />,
      valueColor: "text-green-darkest",
      borderColor: "border-l-yellow-gold",
      iconBg: "bg-yellow-gold/10",
    },
    {
      label: "Monthly Base",
      value: formatCurrency(plan.basePrice, plan.currency),
      sub:
        usage.extraSeats > 0
          ? `+${formatCurrency(usage.extraSeats * plan.perSeatRate, plan.currency)} extra seats`
          : "No extra seat charges",
      icon: <Receipt size={20} className="text-green-darkest/40" />,
      valueColor: "text-green-darkest",
      borderColor: "border-l-green-darkest/20",
      iconBg: "bg-slate-100",
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
      valueColor:
        alerts.overdueCount > 0 ? "text-red-600" : "text-emerald-600",
      borderColor:
        alerts.overdueCount > 0
          ? "border-l-red-400"
          : "border-l-emerald-400",
      iconBg: alerts.overdueCount > 0 ? "bg-red-50" : "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`group bg-white rounded-2xl border border-slate-200/60 border-l-4 ${c.borderColor} p-5 shadow-sm hover:shadow-md transition-shadow duration-300`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {c.label}
            </p>
            <div className={`p-1.5 rounded-lg ${c.iconBg}`}>{c.icon}</div>
          </div>
          <p className={`text-2xl font-semibold tracking-tight ${c.valueColor}`}>
            {c.value}
          </p>
          <p className="text-[11px] text-slate-400 mt-1.5 font-mono leading-tight">
            {c.sub}
          </p>
        </div>
      ))}
    </div>
  );
}