// clientside/src/components/ui/StatRibbon.tsx
"use client";

import { motion } from "framer-motion";

interface StatItem {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string; // CSS class for value color
}

interface Props {
  items: StatItem[];
  watermark?: React.ReactNode; // optional logo / image
}

export default function StatRibbon({ items, watermark }: Props) {
  return (
    <div className="bg-white border-y border-green-darkest/5 py-10 relative overflow-hidden">
      {watermark && (
        <div className="absolute right-0 top-0 h-full flex items-center pr-10 opacity-[0.03] pointer-events-none select-none">
          {watermark}
        </div>
      )}
      <div className="max-w-[1600px] mx-auto flex flex-wrap lg:flex-nowrap items-center">
        {items.map((item, index) => (
          // <motion.div
          //   key={item.label}
          //   className="flex-1 px-8 lg:px-10 relative group border-r border-green-darkest/[0.06] last:border-r-0"
          // >
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 px-8 lg:px-10 relative group border-r border-slate-100 last:border-r-0 h-full flex flex-col justify-between"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-green-darkest/20 group-hover:text-yellow-gold transition-all duration-500 transform group-hover:-translate-y-1">
                {item.icon}
              </div>
              <span className="text-[9px] font-mono text-slate-300 group-hover:text-green-darkest transition-colors">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {item.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-3xl font-light tracking-tighter group-hover:tracking-normal transition-all duration-500 ${item.accent || "text-green-darkest"}`}
              >
                {item.value}
              </span>
            </div>
            {item.sub && (
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                {item.sub}
              </p>
            )}
            <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

