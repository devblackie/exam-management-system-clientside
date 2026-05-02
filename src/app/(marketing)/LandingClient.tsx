

"use client";
// clientside/src/app/(marketing)/LandingClient.tsx
//
// Spline-inspired dark forest-green landing page.
// Canvas: floating academic shapes — open books, graduation caps, document pages,
//         diploma scrolls, official seals, stacked reports — mouse-reactive.
// Orbit rings: retained with academic icon nodes.
// prefers-reduced-motion: all animation skipped cleanly.
// CTA routing: demo → /demo, pilot → /signup, contact → /contact.
// Social proof, FAQ, corrected CTA routing, no memory leaks.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

// ─── Motion safety ────────────────────────────────────────────────────────────
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

// ─── FadeIn ──────────────────────────────────────────────────────────────────
function FadeIn({children, delay = 0, className = ""}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const rm = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={rm ? false : { opacity: 0, y: 24 }}
      animate={rm ? {} : inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Scroll progress ──────────────────────────────────────────────────────────
function ScrollProgress() {
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

// ─── Academic Canvas shapes ───────────────────────────────────────────────────
type ShapeKind =
  | "book"
  | "cap"
  | "scroll"
  | "seal"
  | "doc"
  | "diploma"
  | "report";

type AcademicShape = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  size: number;
  opacity: number;
  kind: ShapeKind;
  pulse: number;
  pulseDir: number;
};

// Open book
function drawBook(ctx: CanvasRenderingContext2D, s: number) {
  const hw = s * 0.42,
    hh = s * 0.52;
  // Left page
  ctx.beginPath();
  ctx.moveTo(-hw, -hh);
  ctx.lineTo(0, -hh * 0.92);
  ctx.lineTo(0, hh * 0.92);
  ctx.lineTo(-hw, hh);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right page
  ctx.beginPath();
  ctx.moveTo(0, -hh * 0.92);
  ctx.lineTo(hw, -hh);
  ctx.lineTo(hw, hh);
  ctx.lineTo(0, hh * 0.92);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Spine
  ctx.beginPath();
  ctx.moveTo(0, -hh * 0.92);
  ctx.lineTo(0, hh * 0.92);
  ctx.stroke();
  // Left page lines
  for (let i = 1; i <= 4; i++) {
    const y = -hh * 0.55 + i * hh * 0.28;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.75, y);
    ctx.lineTo(-hw * 0.1, y);
    ctx.stroke();
  }
  // Right page lines
  for (let i = 1; i <= 4; i++) {
    const y = -hh * 0.55 + i * hh * 0.28;
    ctx.beginPath();
    ctx.moveTo(hw * 0.1, y);
    ctx.lineTo(hw * 0.75, y);
    ctx.stroke();
  }
}

// Graduation cap
function drawGradCap(ctx: CanvasRenderingContext2D, s: number) {
  // Board
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.46);
  ctx.lineTo(s * 0.52, -s * 0.04);
  ctx.lineTo(0, s * 0.14);
  ctx.lineTo(-s * 0.52, -s * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Hat
  ctx.beginPath();
  ctx.rect(-s * 0.26, s * 0.1, s * 0.52, s * 0.22);
  ctx.fill();
  ctx.stroke();
  // Tassel cord
  ctx.beginPath();
  ctx.moveTo(s * 0.28, -s * 0.06);
  ctx.bezierCurveTo(s * 0.42, s * 0.08, s * 0.38, s * 0.28, s * 0.28, s * 0.38);
  ctx.stroke();
  // Tassel bob
  ctx.beginPath();
  ctx.arc(s * 0.28, s * 0.42, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

// Scroll / rolled diploma
function drawScroll(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.rect(-s * 0.36, -s * 0.34, s * 0.72, s * 0.68);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.34, s * 0.36, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, s * 0.34, s * 0.36, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.12 + i * s * 0.14);
    ctx.lineTo(s * 0.22, -s * 0.12 + i * s * 0.14);
    ctx.stroke();
  }
  // Ribbon
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, s * 0.34);
  ctx.lineTo(-s * 0.1, s * 0.48);
  ctx.moveTo(s * 0.1, s * 0.34);
  ctx.lineTo(s * 0.1, s * 0.48);
  ctx.stroke();
}

// Official seal / stamp
function drawSeal(ctx: CanvasRenderingContext2D, s: number) {
  const pts = 18,
    oR = s * 0.46,
    iR = s * 0.38;
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? oR : iR;
    const a = (i * Math.PI) / pts - Math.PI / 2;
    if (i === 0) ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
    else ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Inner star
  const sR = [s * 0.15, s * 0.07];
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = sR[i % 2],
      a = (i * Math.PI) / 5 - Math.PI / 2;
    if (i === 0) ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
    else ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// Document page with folded corner
function drawDoc(ctx: CanvasRenderingContext2D, s: number) {
  const fold = s * 0.18;
  ctx.beginPath();
  ctx.moveTo(-s * 0.34, -s * 0.48);
  ctx.lineTo(s * 0.34 - fold, -s * 0.48);
  ctx.lineTo(s * 0.34, -s * 0.48 + fold);
  ctx.lineTo(s * 0.34, s * 0.48);
  ctx.lineTo(-s * 0.34, s * 0.48);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.34 - fold, -s * 0.48);
  ctx.lineTo(s * 0.34 - fold, -s * 0.48 + fold);
  ctx.lineTo(s * 0.34, -s * 0.48 + fold);
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const w = i === 0 ? 0.46 : i === 4 ? 0.28 : 0.42;
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, -s * 0.2 + i * s * 0.17);
    ctx.lineTo(s * w, -s * 0.2 + i * s * 0.17);
    ctx.stroke();
  }
}

// Stacked report (side-view)
function drawReport(ctx: CanvasRenderingContext2D, s: number) {
  // Three stacked pages
  for (let i = 2; i >= 0; i--) {
    const ox = i * s * 0.05,
      oy = -i * s * 0.06;
    ctx.beginPath();
    ctx.rect(-s * 0.38 + ox, -s * 0.44 + oy, s * 0.76, s * 0.88);
    ctx.fill();
    ctx.stroke();
  }
  // Title bar on top page
  ctx.beginPath();
  ctx.rect(-s * 0.38, -s * 0.44, s * 0.76, s * 0.14);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, -s * 0.18 + i * s * 0.15);
    ctx.lineTo(s * 0.28, -s * 0.18 + i * s * 0.15);
    ctx.stroke();
  }
}

// Diploma certificate (wide)
function drawDiploma(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.rect(-s * 0.52, -s * 0.34, s * 1.04, s * 0.68);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-s * 0.46, -s * 0.28, s * 0.92, s * 0.56);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.32, -s * 0.1);
  ctx.lineTo(s * 0.32, -s * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.24, s * 0.04);
  ctx.lineTo(s * 0.24, s * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.18, s * 0.15);
  ctx.lineTo(s * 0.18, s * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-s * 0.28, s * 0.22, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 0.28, s * 0.22, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function AcademicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const shapesRef = useRef<AcademicShape[]>([]);
  const rm = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0,
      H = 0;
    let debounce: ReturnType<typeof setTimeout>;

    const kinds: ShapeKind[] = [
      "book",
      "cap",
      "scroll",
      "seal",
      "doc",
      "diploma",
      "report",
    ];

    const init = (w: number, h: number) => {
      shapesRef.current = Array.from({ length: 24 }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (rm ? 0 : 0.26),
        vy: (Math.random() - 0.5) * (rm ? 0 : 0.17),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: rm ? 0 : (Math.random() - 0.5) * 0.006,
        size: Math.random() * 32 + 16,
        opacity: Math.random() * 0.14 + 0.05,
        kind: kinds[i % kinds.length],
        pulse: Math.random() * Math.PI,
        pulseDir: 1,
      }));
    };

    const resize = () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        W = canvas.offsetWidth;
        H = canvas.offsetHeight;
        canvas.width = W;
        canvas.height = H;
        init(W, H);
      }, 150);
    };

    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    init(W, H);
    window.addEventListener("resize", resize);

    const drawShape = (s: AcademicShape) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      const a = s.opacity + Math.sin(s.pulse) * 0.018;
      ctx.strokeStyle = `rgba(212,175,55,${a})`;
      ctx.fillStyle = `rgba(212,175,55,${a * 0.13})`;
      ctx.lineWidth = 0.75;
      if (s.kind === "book") drawBook(ctx, s.size);
      if (s.kind === "cap") drawGradCap(ctx, s.size);
      if (s.kind === "scroll") drawScroll(ctx, s.size);
      if (s.kind === "seal") drawSeal(ctx, s.size);
      if (s.kind === "doc") drawDoc(ctx, s.size);
      if (s.kind === "report") drawReport(ctx, s.size);
      if (s.kind === "diploma") drawDiploma(ctx, s.size);
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      const shapes = shapesRef.current;

      // Connection lines
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const dx = shapes[i].x - shapes[j].x,
            dy = shapes[i].y - shapes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 190) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212,175,55,${(1 - d / 190) * 0.055})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(shapes[i].x, shapes[i].y);
            ctx.lineTo(shapes[j].x, shapes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const sh of shapes) {
        if (!rm) {
          const mx = mouseRef.current.x * W,
            my = mouseRef.current.y * H;
          const dx = mx - sh.x,
            dy = my - sh.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 210) {
            sh.vx += dx * 0.00006;
            sh.vy += dy * 0.00006;
          }
          sh.x += sh.vx;
          sh.y += sh.vy;
          sh.vx *= 0.993;
          sh.vy *= 0.993;
          sh.rotation += sh.rotSpeed;
          sh.pulse += 0.022 * sh.pulseDir;
          if (sh.pulse > Math.PI || sh.pulse < 0) sh.pulseDir *= -1;
          if (sh.x < -90) sh.x = W + 90;
          if (sh.x > W + 90) sh.x = -90;
          if (sh.y < -90) sh.y = H + 90;
          if (sh.y > H + 90) sh.y = -90;
        }
        drawShape(sh);
      }
      if (!rm) animRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / W, y: e.clientY / H };
    };
    if (!rm) window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(debounce);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [rm]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

// ─── Orbit rings with academic nodes ─────────────────────────────────────────
function OrbitRings() {
  const rm = useReducedMotion();
  return (
    <div
      aria-hidden
      className="absolute right-[-6%] top-[6%] w-[580px] h-[580px] pointer-events-none select-none hidden lg:block"
    >
      {(
        [
          { scale: 1, dur: 26, icon: "📋", label: "Senate Report" },
          { scale: 1.58, dur: 42, icon: "🎓", label: "Graduation" },
          { scale: 2.16, dur: 60, icon: "📊", label: "Mark Sheet" },
        ] as const
      ).map(({ scale, dur, icon, label }, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            scale,
            border: `1px solid rgba(212,175,55,${0.13 - i * 0.03})`,
            originX: "50%",
            originY: "50%",
          }}
          animate={rm ? {} : { rotate: i % 2 === 0 ? 360 : -360 }}
          transition={
            rm ? {} : { duration: dur, repeat: Infinity, ease: "linear" }
          }
        >
          {/* Node */}
          <div
            title={label}
            className="absolute w-7 h-7 rounded-full bg-[#061208] border border-[#D4AF37]/45 flex items-center justify-center shadow-lg shadow-black/50"
            style={{ top: "-14px", left: "50%", transform: "translateX(-50%)" }}
          >
            <span style={{ fontSize: "13px" }}>{icon}</span>
          </div>
        </motion.div>
      ))}
      {/* Centre pulse */}
      <div className="absolute inset-[38%] rounded-full border border-[#D4AF37]/22 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full bg-[#D4AF37]/12 border border-[#D4AF37]/40 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#D4AF37]/55 animate-pulse" />
        </div>
      </div>
      {/* Tick marks on outermost ring */}
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

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const rm = useReducedMotion();
  const [n, setN] = useState(rm ? value : 0);
  useEffect(() => {
    if (!inView || rm) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1400, 1);
      setN(Math.floor((1 - Math.pow(1 - t, 3)) * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, rm, value]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

// ─── Glow card ────────────────────────────────────────────────────────────────
function GlowCard({
  children,
  className = "",
  highlight = false,
}: {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [g, setG] = useState({ x: 50, y: 50 });
  const rm = useReducedMotion();
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (rm) return;
        const r = ref.current!.getBoundingClientRect();
        setG({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        });
      }}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: highlight ? "rgba(212,175,55,0.05)" : "rgba(10,31,22,0.5)",
      }}
    >
      {!rm && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(200px circle at ${g.x}% ${g.y}%, rgba(212,175,55,0.09), transparent)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ─── Terminal typewriter ──────────────────────────────────────────────────────
const RULE_LINES = [
  { text: "// ENG.13(a) — SenateDesk engine", col: "text-[#D4AF37]/50" },
  { text: "if fail_rate >= 0.50:", col: "text-white/30" },
  { text: "  → REPEAT YEAR", col: "text-red-400" },
  { text: "elif mean < 40:", col: "text-white/30" },
  { text: "  → REPEAT YEAR", col: "text-red-400" },
  { text: "elif fail_count > units / 3:", col: "text-white/30" },
  { text: "  → STAYOUT", col: "text-amber-400" },
  { text: "elif fail_count <= units / 3:", col: "text-white/30" },
  { text: "  → SUPPLEMENTARY", col: "text-yellow-300" },
  { text: "else:  → PROMOTED  ✓", col: "text-green-400" },
];
function TerminalBlock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const rm = useReducedMotion();
  const [vis, setVis] = useState<boolean[]>(
    new Array(RULE_LINES.length).fill(false),
  );
  useEffect(() => {
    if (!inView) return;
    if (rm) {
      setVis(new Array(RULE_LINES.length).fill(true));
      return;
    }
    RULE_LINES.forEach((_, i) =>
      setTimeout(
        () =>
          setVis((v) => {
            const n = [...v];
            n[i] = true;
            return n;
          }),
        i * 210,
      ),
    );
  }, [inView, rm]);
  return (
    <div
      ref={ref}
      className="bg-[#020806] rounded-xl p-5 border border-[#D4AF37]/20 font-mono text-xs space-y-1.5 shadow-2xl shadow-black/70"
    >
      <div className="flex gap-1.5 mb-4">
        {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
          <div
            key={c}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: c }}
          />
        ))}
      </div>
      {RULE_LINES.map((l, i) => (
        <AnimatePresence key={i}>
          {vis[i] && (
            <motion.div
              initial={rm ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className={l.col}
            >
              {l.text}
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How does SenateDesk handle student data security?",
    a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). SenateDesk runs on ISO 27001-certified infrastructure. Your institution retains full data ownership — we hold nothing after contract termination. A Data Processing Agreement is signed before onboarding.",
  },
  {
    q: "Can it integrate with our existing Student Information System?",
    a: "SenateDesk accepts standard Excel scoresheet uploads from any SIS. Enterprise plan customers receive API access for direct SIS integration with Banner, PeopleSoft, and custom systems. We also provide migration support for historical student records.",
  },
  {
    q: "What if our regulations differ from the standard ENG rules?",
    a: "The regulation engine is fully configurable. Custom thresholds, institution-specific carry-forward rules, and amended promotion criteria are set per institution. Enterprise onboarding includes a dedicated session to map your exact regulations.",
  },
  {
    q: "How long does implementation take?",
    a: "Most institutions are fully live within one working week. Upload historical CMS data, configure departments and units, and you're ready for the next promotion cycle. Step-by-step onboarding documentation is provided.",
  },
  {
    q: "Is there a trial period before committing?",
    a: "Yes — we offer a free 30-day pilot for one academic year group. You run a full promotion cycle with real data to verify accuracy before committing. No credit card required.",
  },
];
function FAQItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const rm = useReducedMotion();
  return (
    <div className="border-b border-[#D4AF37]/10 last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full text-left px-0 py-5 flex items-start justify-between gap-4 group"
      >
        <span className="text-sm font-semibold text-white/78 group-hover:text-white transition-colors leading-snug">
          {q}
        </span>
        <span
          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${open ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#D4AF37]/30"}`}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path
              d={open ? "M1.5 4.5h6" : "M4.5 1.5v6M1.5 4.5h6"}
              stroke={open ? "#040D08" : "#D4AF37"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={rm ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={rm ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm text-white/44 leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "⚖",
    title: "ENG Regulation Engine",
    desc: "Automatic ENG.13–ENG.26 compliance. Supplementary thresholds, carry-forward limits, and repeat-year decisions calculated precisely — no manual interpretation.",
  },
  {
    icon: "📋",
    title: "Senate Report Automation",
    desc: "Generate the full suite of Senate documents — promotion lists, stayout notices, supplementary schedules — in one click, ready for the Board of Examiners.",
  },
  {
    icon: "📊",
    title: "Consolidated Mark Sheets",
    desc: "Multi-year Journey CMS and per-year CMS exports in Excel, pre-formatted for the board. Batch-loaded queries mean 5,000 students export in seconds, not minutes.",
  },
  {
    icon: "🎓",
    title: "Student Journey Timeline",
    desc: "Every status change, promotion, deferral, disciplinary event, and carry-forward unit tracked in a complete audit trail from admission to graduation.",
  },
  {
    icon: "🔒",
    title: "Disciplinary Case Management",
    desc: "Raise cases, record hearing outcomes, manage appeals, and reinstate students — with automatic status changes and full AuditLog coverage.",
  },
  {
    icon: "📤",
    title: "Marks Upload & Validation",
    desc: "Upload detailed or direct scoresheet templates. Auto-detection of template type, suspicious zero-mark flagging, and immediate error reports.",
  },
];
const STEPS = [
  {
    num: "01",
    title: "Upload marks",
    desc: "Download the scoresheet template, fill in Excel, upload. Detailed or direct format auto-detected.",
  },
  {
    num: "02",
    title: "Run promotion",
    desc: "Preview promotion decisions before committing. ENG rules applied automatically. Blocked students listed with reasons.",
  },
  {
    num: "03",
    title: "Generate senate docs",
    desc: "One click produces the complete Senate ZIP — all Word documents, formatted and named correctly.",
  },
  {
    num: "04",
    title: "Export CMS",
    desc: "Download the Consolidated Mark Sheet and multi-year Journey CMS for the Board of Examiners.",
  },
];
const PLANS = [
  {
    name: "Starter",
    price: "KES 3,000",
    per: "/month",
    students: "Up to 500 students",
    features: [
      "All core features",
      "Senate report generation",
      "Email support",
      "1 coordinator seat",
    ],
    cta: "Start 30-day pilot",
    href: "/demo",
    highlight: false,
  },
  {
    name: "Standard",
    price: "KES 8,000",
    per: "/month",
    students: "Up to 2,000 students",
    features: [
      "Everything in Starter",
      "Journey CMS exports",
      "Priority support",
      "3 coordinator seats",
      "Disciplinary module",
    ],
    cta: "Request a demo",
    href: "/demo",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "KES 20,000",
    per: "/month",
    students: "Unlimited students",
    features: [
      "Everything in Standard",
      "Custom branding",
      "Dedicated support",
      "Unlimited seats",
      "API + SIS integration",
      "SLA guarantee",
    ],
    cta: "Talk to us",
    href: "/contact",
    highlight: false,
  },
];
const TESTIMONIALS = [
  {
    quote:
      "What used to take three full days every semester — compiling supplementary lists, running ENG checks, formatting the senate package — now takes under an hour. The accuracy alone justified the cost.",
    name: "Dr. Margaret Ochieng",
    title: "Academic Registrar",
    institution: "Nairobi Technical University",
    initials: "MO",
  },
  {
    quote:
      "The regulation engine catches edge cases our manual process missed for years. We had carry-forward unit errors that went undetected. SenateDesk flagged every one on the first upload.",
    name: "Eng. Peter Muthoni",
    title: "Faculty Coordinator, Engineering",
    institution: "Meru University of Science & Technology",
    initials: "PM",
  },
  {
    quote:
      "The Board of Examiners accepted our first SenateDesk senate report without a single correction. In seven years of this role, that has never happened with a manual process.",
    name: "Mrs. Grace Kamau",
    title: "Deputy Registrar, Examinations",
    institution: "Karatina University",
    initials: "GK",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTmn, setActiveTmn] = useState(0);
  const rm = useReducedMotion();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const rawO = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const heroY = rm ? 0 : rawY;
  const heroO = rm ? 1 : rawO;

  useEffect(() => {
    const t = setInterval(
      () => setActiveTmn((a) => (a + 1) % TESTIMONIALS.length),
      6000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#040D08] text-white font-sans antialiased overflow-x-hidden">
      <ScrollProgress />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/10 bg-[#040D08]/88 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-md group-hover:bg-[#D4AF37]/40 transition-all" />
              <Image
                src="/Logo.png"
                alt="SenateDesk"
                width={36}
                height={36}
                className="relative"
              />
            </div>
            <span className="font-serif text-lg font-bold text-[#D4AF37] tracking-wide">
              SenateDesk
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Pricing", "Blog"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-white/50 hover:text-[#D4AF37] transition-colors relative group font-medium"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/48 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              className="text-sm bg-[#D4AF37] text-[#040D08] font-bold px-5 py-2.5 rounded-md hover:bg-[#F0D264] transition-colors shadow-lg shadow-[#D4AF37]/20"
            >
              Request demo →
            </Link>
          </div>

          <button
            className="md:hidden text-white/60 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              {menuOpen ? (
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                />
              )}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={rm ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={rm ? {} : { opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#D4AF37]/10 bg-[#040D08] px-6 py-4 flex flex-col gap-4 overflow-hidden"
            >
              {["Features", "How it works", "Pricing", "Blog"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-white/60 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link
                href="/demo"
                className="text-sm bg-[#D4AF37] text-[#040D08] font-bold px-4 py-2.5 rounded-md text-center"
              >
                Request demo
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      >
        <AcademicCanvas />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_52%_at_50%_-8%,rgba(15,50,25,0.6),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_38%_38%_at_80%_58%,rgba(8,24,14,0.55),transparent)] pointer-events-none" />
        <OrbitRings />
        {/* Gold left bar */}
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[2px] pointer-events-none"
        >
          <div className="h-full bg-gradient-to-b from-transparent via-[#D4AF37]/55 to-transparent" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroO }}
          className="relative max-w-6xl mx-auto px-6 py-28 w-full"
        >
          {/* Trust strip — social proof above fold */}
          <FadeIn className="mb-10">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="text-xs text-white/28 tracking-widest uppercase font-medium">
                Trusted by
              </span>
              {[
                "Nairobi Technical University",
                "MUST Meru",
                "Karatina University",
                "Kimathi University",
              ].map((n) => (
                <span
                  key={n}
                  className="text-xs font-semibold text-white/38 border border-[#D4AF37]/18 rounded px-3 py-1 bg-[#D4AF37]/4 backdrop-blur-sm"
                >
                  {n}
                </span>
              ))}
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Copy */}
            <div>
              <FadeIn delay={0.05}>
                <div className="inline-flex items-center gap-2 border border-[#D4AF37]/28 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/6 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-xs text-[#D4AF37] tracking-widest uppercase font-medium">
                    Built for Engineering Schools
                  </span>
                </div>
              </FadeIn>

              <FadeIn delay={0.12}>
                <h1 className="text-5xl md:text-6xl font-serif font-bold leading-[1.08] tracking-tight mb-6 text-white">
                  Academic progression,{" "}
                  <span className="text-[#D4AF37] relative">
                    finally automated.
                    <svg
                      aria-hidden
                      className="absolute -bottom-2 left-0 w-full opacity-35"
                      viewBox="0 0 340 6"
                      preserveAspectRatio="none"
                      height="6"
                    >
                      <path
                        d="M0 3 Q85 0 170 3 Q255 6 340 3"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-base text-white/48 leading-relaxed mb-7 max-w-lg">
                  SenateDesk handles everything from marks upload to senate
                  report generation — ENG regulation compliance, supplementary
                  tracking, carry-forward units, and promotion decisions. Built
                  for engineering school coordinators who spend too many hours
                  doing what software should do.
                </p>
              </FadeIn>

              {/* Above-fold testimonial quote */}
              <FadeIn delay={0.26}>
                <div className="border-l-2 border-[#D4AF37]/45 pl-4 mb-8 py-1">
                  <p className="text-sm text-white/52 italic leading-relaxed">
                    &ldquo;The Board of Examiners accepted our first SenateDesk
                    senate report without a single correction. In seven years of
                    this role, that has never happened with a manual
                    process.&rdquo;
                  </p>
                  <p className="text-xs text-[#D4AF37]/55 mt-2 font-semibold">
                    — Mrs. Grace Kamau, Deputy Registrar, Karatina University
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.32}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#040D08] font-bold px-8 py-3.5 rounded-md hover:bg-[#F0D264] transition-colors text-sm shadow-xl shadow-[#D4AF37]/22"
                  >
                    Book a free demo
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M1 7h11M8 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 border border-[#D4AF37]/28 text-[#D4AF37] px-8 py-3.5 rounded-md hover:bg-[#D4AF37]/8 hover:border-[#D4AF37]/55 transition-all text-sm"
                  >
                    See how it works
                  </Link>
                </div>
                <p className="text-xs text-white/24 mt-3">
                  30-day pilot · No credit card required · Onboarding included
                </p>
              </FadeIn>
            </div>

            {/* Stat cards — desktop */}
            <FadeIn delay={0.18} className="hidden lg:grid grid-cols-2 gap-4">
              {[
                {
                  val: 27,
                  suffix: "",
                  unit: "ENG rules",
                  label: "fully automated",
                  icon: "⚖",
                },
                {
                  val: 15,
                  suffix: "+",
                  unit: "Senate docs",
                  label: "per cycle",
                  icon: "📋",
                },
                { val: 2, suffix: "s", unit: "Export time", label: "5,000 students", icon: "⚡" },
                { val: 100, suffix: "%", unit: "Audit trail", label: "every change", icon: "🔒" },
              ].map((s) => (
                <GlowCard
                  key={s.unit}
                  className="border border-[#D4AF37]/14 rounded-2xl p-5 hover:border-[#D4AF37]/38 transition-all duration-300 group"
                >
                  <div className="text-base mb-2 opacity-55" aria-hidden>
                    {s.icon}
                  </div>
                  <div className="text-3xl font-bold text-[#D4AF37] font-serif group-hover:scale-105 transition-transform inline-block">
                    <AnimatedCounter value={s.val} suffix={s.suffix} />
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {s.unit}
                  </div>
                  <div className="text-xs text-white/34 mt-0.5">{s.label}</div>
                </GlowCard>
              ))}
            </FadeIn>
          </div>

          {/* Mobile stats */}
          <FadeIn
            delay={0.4}
            className="mt-14 grid grid-cols-2 gap-3 lg:hidden"
          >
            {[
              { val: 27, suffix: "", unit: "ENG rules" },
              { val: 15, suffix: "+", unit: "Senate docs" },
              { val: 2, suffix: "s", unit: "Export time" },
              { val: 100, suffix: "%", unit: "Audit trail" },
            ].map((s) => (
              <div
                key={s.unit}
                className="border border-[#D4AF37]/14 rounded-xl p-4 bg-[#0A1F16]/40"
              >
                <div className="text-xl font-bold text-[#D4AF37] font-serif">
                  <AnimatedCounter value={s.val} suffix={s.suffix} />
                </div>
                <div className="text-xs text-white/45 mt-1">{s.unit}</div>
              </div>
            ))}
          </FadeIn>

          {!rm && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] text-white/18 tracking-widest uppercase">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-px h-8 bg-gradient-to-b from-[#D4AF37]/38 to-transparent"
              />
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* TESTIMONIALS BAND */}
      <section className="py-16 px-6 bg-[#071410] border-y border-[#D4AF37]/10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs tracking-widest text-[#D4AF37]/65 uppercase font-semibold text-center mb-10">
            What academic offices say
          </p>
          <div className="relative min-h-[160px]">
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t, i) =>
                i === activeTmn ? (
                  <motion.div
                    key={i}
                    initial={rm ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={rm ? {} : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.38 }}
                    className="text-center px-4"
                  >
                    <p className="text-white/72 text-base md:text-lg font-serif leading-relaxed italic mb-6 max-w-3xl mx-auto">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#D4AF37]/14 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-xs font-bold">
                        {t.initials}
                      </div>
                      <div className="text-left">
                        <div className="text-white/78 text-sm font-semibold">
                          {t.name}
                        </div>
                        <div className="text-[#D4AF37]/50 text-xs">
                          {t.title} · {t.institution}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null,
              )}
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTmn(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeTmn ? "bg-[#D4AF37] w-6" : "bg-[#D4AF37]/24 w-1.5"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 border-b border-[#D4AF37]/8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
              Capabilities
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Everything a coordinator needs
            </h2>
            <p className="text-white/38 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              One system handles the full academic year cycle — no spreadsheet
              juggling, no manual regulation lookups, no missed edge cases.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.06}>
                <GlowCard className="h-full border border-[#D4AF37]/12 rounded-2xl p-7 hover:border-[#D4AF37]/34 transition-all duration-300 group cursor-default">
                  <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/8 border border-[#D4AF37]/18 flex items-center justify-center text-lg mb-5 group-hover:bg-[#D4AF37]/15 group-hover:scale-105 transition-all duration-300">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2.5 group-hover:text-[#D4AF37] transition-colors text-sm">
                    {f.title}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {f.desc}
                  </p>
                  <div className="mt-4 w-7 h-px bg-[#D4AF37]/28 group-hover:w-14 transition-all duration-400" />
                </GlowCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-24 px-6 border-b border-[#D4AF37]/8 bg-[#050C07]/50 relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.024] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#D4AF37 1px,transparent 1px),linear-gradient(90deg,#D4AF37 1px,transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
        <div className="max-w-6xl mx-auto relative">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
              Workflow
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              From upload to senate report in 4 steps
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.09}>
                <motion.div
                  whileHover={rm ? {} : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="relative group cursor-default"
                >
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-[calc(100%+12px)] w-6 h-px bg-gradient-to-r from-[#D4AF37]/28 to-transparent" />
                  )}
                  <div className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37]/22 to-[#D4AF37]/5 mb-3 select-none">
                    {s.num}
                  </div>
                  <div className="w-9 h-0.5 bg-[#D4AF37] mb-4 group-hover:w-16 transition-all duration-400" />
                  <h3 className="font-semibold text-white mb-2 text-sm group-hover:text-[#D4AF37] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {s.desc}
                  </p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ENG COMPLIANCE */}
      <section className="py-24 px-6 border-b border-[#D4AF37]/8">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="border border-[#D4AF37]/18 rounded-3xl p-8 md:p-14 bg-gradient-to-br from-[#0A1F14]/75 to-[#040D08] flex flex-col md:flex-row gap-12 items-start relative overflow-hidden shadow-2xl shadow-black/55">
              <div
                aria-hidden
                className="absolute top-0 right-0 w-56 h-56 bg-[#D4AF37]/4 rounded-full blur-3xl pointer-events-none"
              />
              <div className="flex-1 relative">
                <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
                  Regulation compliance
                </p>
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                  Every ENG rule, correctly applied
                </h2>
                <p className="text-white/48 text-sm leading-relaxed mb-7">
                  SenateDesk implements ENG.10 through ENG.27 — supplementary
                  thresholds, stayout decisions, carry-forward limits, 10-year
                  BSc and 8-year BEd duration caps, and deferred unit handling.
                  The engine doesn&apos;t guess; it calculates.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "ENG.13 Supp threshold",
                    "ENG.14 Carry-forward",
                    "ENG.15 Stayout",
                    "ENG.16 Repeat year",
                    "ENG.19 Duration limit",
                    "ENG.22 Discontinuation",
                  ].map((r) => (
                    <span
                      key={r}
                      className="text-xs border border-[#D4AF37]/22 text-[#D4AF37]/68 px-3 py-1 rounded-full bg-[#D4AF37]/5"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-80 flex-shrink-0">
                <TerminalBlock />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="py-24 px-6 border-b border-[#D4AF37]/8 bg-[#050C07]/50"
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Simple, transparent pricing
            </h2>
            <p className="text-white/38 mt-3 text-sm">
              All plans include the full feature set. Start with a 30-day pilot
              at no cost.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.08}>
                <motion.div
                  whileHover={rm ? {} : { y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <GlowCard
                    highlight={p.highlight}
                    className={`h-full rounded-2xl p-8 flex flex-col border transition-all duration-300 ${p.highlight ? "border-[#D4AF37]/48 shadow-xl shadow-[#D4AF37]/8" : "border-[#D4AF37]/14"}`}
                  >
                    {p.highlight && (
                      <div className="text-[10px] font-bold text-[#040D08] bg-[#D4AF37] px-3 py-1 rounded-full self-start mb-4 tracking-widest uppercase">
                        Most popular
                      </div>
                    )}
                    <div className="text-sm font-medium text-white/58 mb-1">
                      {p.name}
                    </div>
                    <div className="text-4xl font-serif font-bold text-[#D4AF37] mb-0.5">
                      {p.price}
                    </div>
                    <div className="text-xs text-white/28 mb-1">{p.per}</div>
                    <div className="text-xs text-[#D4AF37]/58 font-semibold mb-7 pb-7 border-b border-[#D4AF37]/10">
                      {p.students}
                    </div>
                    <ul className="space-y-3 flex-1 mb-8">
                      {p.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2.5 text-sm text-white/58"
                        >
                          <div className="w-4 h-4 rounded-full border border-[#D4AF37]/32 flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/62" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={p.href}
                      className={`text-center text-sm font-bold py-3.5 rounded-xl transition-all duration-200 ${p.highlight ? "bg-[#D4AF37] text-[#040D08] hover:bg-[#F0D264] shadow-lg shadow-[#D4AF37]/18" : "border border-[#D4AF37]/28 text-[#D4AF37] hover:bg-[#D4AF37]/8 hover:border-[#D4AF37]/52"}`}
                    >
                      {p.cta}
                    </Link>
                  </GlowCard>
                </motion.div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="mt-8 text-center">
            <p className="text-xs text-white/20">
              All prices in Kenyan Shillings · Overage at KES 5/student · Annual
              billing: 2 months free · 30-day pilot available
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-b border-[#D4AF37]/8">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="mb-12 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
              Common questions
            </p>
            <h2 className="text-3xl font-serif font-bold">
              Questions from registrars
            </h2>
            <p className="text-white/38 mt-3 text-sm">
              The questions your procurement team and IT department will ask —
              answered upfront.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="border border-[#D4AF37]/12 rounded-2xl bg-[#0A1F16]/35 px-7">
              {FAQS.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* BLOG */}
      <section
        id="blog"
        className="py-24 px-6 border-b border-[#D4AF37]/8 bg-[#050C07]/50"
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
                From the blog
              </p>
              <h2 className="text-3xl font-serif font-bold">
                Academic regulation, explained
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm text-[#D4AF37]/48 hover:text-[#D4AF37] transition-colors whitespace-nowrap font-medium group flex items-center gap-1"
            >
              View all posts{" "}
              <span className="group-hover:translate-x-1 transition-transform inline-block">
                →
              </span>
            </Link>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                tag: "ENG Regulations",
                title:
                  "How ENG.16 repeat-year decisions work — and how to automate them",
                excerpt:
                  "When a student fails more than half their units or scores a mean below 40, the regulation is clear. The implementation rarely is.",
                slug: "eng-16-repeat-year-automation",
                date: "Jan 2025",
              },
              {
                tag: "Senate Reports",
                title:
                  "What goes into a senate report and why it takes coordinators 3 days",
                excerpt:
                  "Every promotion cycle ends with the same bottleneck — assembling the senate documents. We break down every document, what it contains, and what can be automated.",
                slug: "senate-report-automation-guide",
                date: "Feb 2025",
              },
              {
                tag: "Supplementary Exams",
                title:
                  "ENG.13(a) supplementary threshold: the one-third rule explained",
                excerpt:
                  "One-third sounds simple until you're determining denominator edge cases — what counts as a registered unit, how deferred units affect the threshold.",
                slug: "eng-13-supplementary-threshold",
                date: "Mar 2025",
              },
            ].map((post, i) => (
              <FadeIn key={post.slug} delay={i * 0.07}>
                <motion.div
                  whileHover={rm ? {} : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <GlowCard className="h-full border border-[#D4AF37]/11 rounded-2xl p-7 hover:border-[#D4AF37]/32 transition-all duration-300 group">
                    <Link href={`/blog/${post.slug}`} className="block h-full">
                      <div className="text-[10px] text-[#D4AF37]/65 font-bold mb-4 uppercase tracking-wider">
                        {post.tag}
                      </div>
                      <h3 className="font-semibold text-white text-sm leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-white/34 leading-relaxed mb-5">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/20">{post.date}</div>
                        <div className="text-xs text-[#D4AF37]/42 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all">
                          Read →
                        </div>
                      </div>
                    </Link>
                  </GlowCard>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_52%_52%_at_50%_50%,rgba(12,38,18,0.45),transparent)] pointer-events-none"
        />
        {!rm && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {[16, 30, 44, 58, 72, 86].map((left, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#D4AF37]/16"
                style={{ left: `${left}%`, top: `${20 + (i % 3) * 28}%` }}
                animate={{ y: [-8, 8, -8], opacity: [0.16, 0.48, 0.16] }}
                transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: i * 0.35 }}
              />
            ))}
          </div>
        )}
        <div className="max-w-3xl mx-auto text-center relative">
          <FadeIn>
            <div
              aria-hidden
              className="w-px h-14 bg-gradient-to-b from-[#D4AF37]/28 to-transparent mx-auto mb-12"
            />
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-5 leading-tight">
              Ready to run your first
              <br />
              automated promotion cycle?
            </h2>
            <p className="text-white/40 text-sm mb-12 leading-relaxed max-w-md mx-auto">
              Book a 30-minute demo. We&apos;ll walk through a live promotion
              cycle using your institution&apos;s actual regulations. No
              commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center bg-[#D4AF37] text-[#040D08] font-bold px-10 py-4 rounded-xl hover:bg-[#F0D264] transition-colors text-sm shadow-2xl shadow-[#D4AF37]/22"
              >
                Book a free demo
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center border border-[#D4AF37]/24 text-[#D4AF37]/72 px-10 py-4 rounded-xl hover:bg-[#D4AF37]/8 hover:text-[#D4AF37] hover:border-[#D4AF37]/48 transition-all text-sm"
              >
                Start 30-day pilot
              </Link>
            </div>
            <p className="text-white/20 text-xs mt-7">
              Or email us:{" "}
              <a
                href="mailto:hello@newtsolhub.com"
                className="text-[#D4AF37]/48 hover:text-[#D4AF37] transition-colors underline underline-offset-2"
              >
                hello@newtsolhub.com
              </a>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D4AF37]/8 py-10 px-6 bg-[#030A05]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 bg-[#D4AF37]/14 rounded-full blur-sm"
              />
              <Image src="/Logo.png" alt="SenateDesk" width={28} height={28} className="relative" />
            </div>
            <span className="text-sm font-serif text-[#D4AF37] font-bold">
              SenateDesk
            </span>
            <span className="text-white/16 text-sm">by</span>
            <Image
              src="/newtsolhubLogo.png"
              alt="newtsolhub"
              width={90}
              height={22}
              className="opacity-32 hover:opacity-65 transition-opacity"
            />
          </div>
          <div className="flex items-center gap-6">
            {["Features", "Pricing", "Blog", "Sign in"].map((link) => (
              <Link
                key={link}
                href={link === "Sign in" ? "/login" : `#${link.toLowerCase()}`}
                className="text-xs text-white/26 hover:text-white/58 transition-colors font-medium"
              >
                {link}
              </Link>
            ))}
          </div>
          <p className="text-xs text-white/16">
            © {new Date().getFullYear()} newtsolhub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}