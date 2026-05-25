// clientside/src/components/billing/SeatUsageBar.tsx
"use client";

import { motion } from "framer-motion";
import { BillingSummary, formatCurrency } from "@/api/billingApi";

interface Props {
  summary: BillingSummary;
}

export default function SeatUsageBar({ summary }: Props) {
  const { plan, usage } = summary;
  const pct = Math.min(usage.usagePercent, 100);

  const barColor =
    usage.extraSeats > 0
      ? "bg-red-500"
      : pct > 90
        ? "bg-amber-500"
        : pct > 70
          ? "bg-yellow-gold"
          : "bg-green-darkest";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
            Seat Utilisation
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            {usage.activeStudents.toLocaleString()} active students
            &nbsp;/&nbsp;
            {usage.includedSeats.toLocaleString()} included seats
          </p>
        </div>
        <span className={`text-xl font-light tabular-nums ${usage.extraSeats > 0 ? "text-red-600" : "text-green-darkest"}`}>
          {pct}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-darkest inline-block" />
            Active ({usage.activeStudents.toLocaleString()})
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 inline-block" />
            Included ({usage.includedSeats.toLocaleString()})
          </span>
        </div>

        {usage.extraSeats > 0 && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold text-red-600 font-mono"
          >
            +{usage.extraSeats} extra @ {formatCurrency(plan.perSeatRate, plan.currency)}/seat &nbsp;=&nbsp;
            <span className="text-red-700">
              {formatCurrency(usage.extraSeats * plan.perSeatRate, plan.currency)}/mo extra
            </span>
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}