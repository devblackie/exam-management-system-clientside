// clientside/src/app/demo/utils/helpers.ts

import { MockPromoStudent } from "../components/types";

export const classify = (mean: number) => {
  if (mean >= 70) return { label: "First Class Honours", color: "text-emerald-400" };
  if (mean >= 60) return { label: "Second Class (Upper)", color: "text-blue-400" };
  if (mean >= 50) return { label: "Second Class (Lower)", color: "text-amber-400" };
  if (mean >= 40) return { label: "Pass", color: "text-slate-400" };
  return { label: "Below Pass Mark", color: "text-red-400" };
};

export const promoColor = (status: MockPromoStudent["status"]) =>
  ({
    PASS: "bg-emerald-900/40 border-emerald-700/40 text-emerald-300",
    SUPP: "bg-amber-900/40 border-amber-700/40 text-amber-300",
    REPEAT: "bg-red-900/40 border-red-700/40 text-red-300",
    STAYOUT: "bg-orange-900/40 border-orange-700/40 text-orange-300",
    LEAVE: "bg-slate-800/60 border-slate-600/40 text-slate-300",
  })[status];

export const promoBadge = (status: MockPromoStudent["status"]) =>
  ({
    PASS: "bg-emerald-500 text-white",
    SUPP: "bg-amber-500 text-white",
    REPEAT: "bg-red-600 text-white",
    STAYOUT: "bg-orange-500 text-white",
    LEAVE: "bg-slate-600 text-white",
  })[status];

export const promoLabel = (status: MockPromoStudent["status"]) =>
  ({
    PASS: "PASS",
    SUPP: "SUPPLEMENTARY",
    REPEAT: "REPEAT YEAR",
    STAYOUT: "STAY OUT",
    LEAVE: "ON LEAVE",
  })[status];