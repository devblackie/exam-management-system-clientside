// clientside/src/app/(marketing)/components/TestimonialsBand.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  institution: string;
  initials: string;
}

interface TestimonialsBandProps {
  testimonials: Testimonial[];
}

export function TestimonialsBand({ testimonials }: TestimonialsBandProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const rm = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const current = testimonials[activeIndex];

  return (
    <section className="py-16 px-6 bg-[#071410] border-y border-[#D4AF37]/10">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs tracking-widest text-[#D4AF37]/65 uppercase font-semibold text-center mb-10">
          What academic offices say
        </p>
        <div className="relative min-h-[160px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={rm ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={rm ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.38 }}
              className="text-center px-4"
            >
              <p className="text-white/72 text-base md:text-lg font-serif leading-relaxed italic mb-6 max-w-3xl mx-auto">
                &ldquo;{current.quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/14 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
                  {current.initials}
                </div>
                <div className="text-left">
                  <div className="text-white/78 text-sm font-semibold">{current.name}</div>
                  <div className="text-[#D4AF37]/50 text-xs">
                    {current.title} · {current.institution}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              aria-label={`Testimonial ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? "bg-[#D4AF37] w-6" : "bg-[#D4AF37]/24 w-1.5"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}