// clientside/src/app/(marketing)/components/TerminalBlock.tsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

const RULE_LINES = [
  { text: "// ENG.13(a) — Academic progression engine", color: "text-[#D4AF37]/50" },
  { text: "if fail_rate >= 0.50:", color: "text-white/30" },
  { text: "  → REPEAT YEAR", color: "text-red-400" },
  { text: "elif mean < 40:", color: "text-white/30" },
  { text: "  → REPEAT YEAR", color: "text-red-400" },
  { text: "elif fail_count > units / 3:", color: "text-white/30" },
  { text: "  → STAYOUT", color: "text-amber-400" },
  { text: "elif fail_count <= units / 3:", color: "text-white/30" },
  { text: "  → SUPPLEMENTARY", color: "text-yellow-300" },
  { text: "else:  → PROMOTED  ✓", color: "text-green-400" },
];

export function TerminalBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const rm = useReducedMotion();
  const [visible, setVisible] = useState<boolean[]>(new Array(RULE_LINES.length).fill(false));

  useEffect(() => {
    if (!inView) return;
    if (rm) {
      setVisible(new Array(RULE_LINES.length).fill(true));
      return;
    }
    RULE_LINES.forEach((_, index) => {
      setTimeout(() => {
        setVisible(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, index * 210);
    });
  }, [inView, rm]);

  return (
    <div ref={ref} className="bg-[#020806] rounded-xl p-5 border border-[#D4AF37]/20 font-mono text-xs space-y-1.5 shadow-2xl shadow-black/70">
      <div className="flex gap-1.5 mb-4">
        {["#FF5F56", "#FFBD2E", "#27C93F"].map((color) => (
          <div key={color} className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        ))}
      </div>
      {RULE_LINES.map((line, index) => (
        <AnimatePresence key={index}>
          {visible[index] && (
            <motion.div
              initial={rm ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className={line.color}
            >
              {line.text}
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}