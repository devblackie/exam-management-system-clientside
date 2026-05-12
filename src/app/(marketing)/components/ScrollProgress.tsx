// clientside/src/app/(marketing)/components/ScrollProgress.tsx
import { motion, useScroll, useSpring } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function ScrollProgress() {
  const rm = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  if (rm) return null;
  
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#D4AF37] origin-left z-[60]"
      style={{ scaleX }}
    />
  );
}