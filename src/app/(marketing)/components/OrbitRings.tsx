// clientside/src/app/(marketing)/components/OrbitRings.tsx
import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

const ORBITS = [
  { scale: 1, duration: 26, icon: "📋", label: "Senate Report" },
  { scale: 1.58, duration: 42, icon: "🎓", label: "Graduation" },
  { scale: 2.16, duration: 60, icon: "📊", label: "Mark Sheet" },
];

export function OrbitRings() {
  const rm = useReducedMotion();
  
  return (
    <div aria-hidden className="absolute right-[-6%] top-[6%] w-[580px] h-[580px] pointer-events-none select-none hidden lg:block">
      {ORBITS.map((orbit, index) => (
        <motion.div
          key={orbit.label}
          className="absolute inset-0 rounded-full"
          style={{
            scale: orbit.scale,
            border: `1px solid rgba(212,175,55,${0.13 - index * 0.03})`,
            originX: "50%",
            originY: "50%",
          }}
          animate={rm ? {} : { rotate: index % 2 === 0 ? 360 : -360 }}
          transition={rm ? {} : { duration: orbit.duration, repeat: Infinity, ease: "linear" }}
        >
          <div
            title={orbit.label}
            className="absolute w-7 h-7 rounded-full bg-[#061208] border border-[#D4AF37]/45 flex items-center justify-center shadow-lg shadow-black/50"
            style={{ top: "-14px", left: "50%", transform: "translateX(-50%)" }}
          >
            <span style={{ fontSize: "13px" }}>{orbit.icon}</span>
          </div>
        </motion.div>
      ))}
      <div className="absolute inset-[38%] rounded-full border border-[#D4AF37]/22 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full bg-[#D4AF37]/12 border border-[#D4AF37]/40 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#D4AF37]/55 animate-pulse" />
        </div>
      </div>
      {Array.from({ length: 8 }, (_, i) => i * 45).map((deg) => (
        <div
          key={deg}
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: "1px",
            height: "7px",
            background: "rgba(212,175,55,0.18)",
            transformOrigin: "top center",
            transform: `rotate(${deg}deg) translateX(-50%) translateY(-${580 * 2.16 * 0.5 - 7}px)`,
          }}
        />
      ))}
    </div>
  );
}