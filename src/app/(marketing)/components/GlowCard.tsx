// clientside/src/app/(marketing)/components/GlowCard.tsx
import { useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

export function GlowCard({ children, className = "", highlight = false }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const rm = useReducedMotion();
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rm) return;
    const rect = ref.current!.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };
  
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: highlight ? "rgba(212,175,55,0.05)" : "rgba(10,31,22,0.5)",
      }}
    >
      {!rm && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(200px circle at ${glow.x}% ${glow.y}%, rgba(212,175,55,0.09), transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}