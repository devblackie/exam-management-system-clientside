// clientside/src/app/(marketing)/components/AnimatedCounter.tsx
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

export function AnimatedCounter({ value, suffix = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const rm = useReducedMotion();
  const [count, setCount] = useState(rm ? value : 0);
  
  useEffect(() => {
    if (!inView || rm) return;
    const startTime = performance.now();
    
    const animate = (now: number) => {
      const elapsed = Math.min((now - startTime) / 1400, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setCount(Math.floor(eased * value));
      if (elapsed < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [inView, rm, value]);
  
  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}