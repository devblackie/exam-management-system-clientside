// clientside/src/app/(marketing)/components/FAQItem.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  const rm = useReducedMotion();
  
  return (
    <div className="border-b border-[#D4AF37]/10 last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left px-0 py-5 flex items-start justify-between gap-4 group"
      >
        <span className="text-sm font-semibold text-white/78 group-hover:text-white transition-colors leading-snug">
          {question}
        </span>
        <span className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isOpen ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#D4AF37]/30"}`}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path
              d={isOpen ? "M1.5 4.5h6" : "M4.5 1.5v6M1.5 4.5h6"}
              stroke={isOpen ? "#040D08" : "#D4AF37"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={rm ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={rm ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-white/44 leading-relaxed pb-5">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}