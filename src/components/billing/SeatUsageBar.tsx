// clientside/src/components/billing/SeatUsageBar.tsx
"use client";

import { BillingSummary, formatCurrency } from "@/api/billingApi";

interface Props { summary: BillingSummary; }

export default function SeatUsageBar({ summary }: Props) {
  const { plan, usage } = summary;
  const pct = Math.min(usage.usagePercent, 100);

  const barColor =
    usage.overage > 0        ? "bg-red-500"
    : pct > 90               ? "bg-amber-500"
    : pct > 70               ? "bg-yellow-gold"
    : "bg-green-darkest";

  return (
    <div className="bg-white rounded-xl border border-green-darkest/5 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
            Seat Utilisation
          </p>
          <p className="text-[11px] font-mono text-slate-500">
            {usage.activeStudents.toLocaleString()} active students
            &nbsp;/&nbsp;
            {usage.seatLimit.toLocaleString()} seat limit
          </p>
        </div>
        <span
          className={`text-xl font-light tabular-nums ${
            usage.overage > 0 ? "text-red-600" : "text-green-darkest"
          }`}
        >
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Legend row */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-darkest inline-block" />
            Active ({usage.activeStudents.toLocaleString()})
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
            Remaining ({Math.max(0, usage.seatLimit - usage.activeStudents).toLocaleString()})
          </span>
        </div>

        {usage.overage > 0 && (
          <p className="text-[10px] font-bold text-red-600 font-mono">
            +{usage.overage} overage @ {formatCurrency(plan.overageRate, plan.currency)}/seat
            &nbsp;=&nbsp;
            <span className="text-red-700">
              {formatCurrency(usage.overage * plan.overageRate, plan.currency)}/mo extra
            </span>
          </p>
        )}
      </div>
    </div>
  );
}