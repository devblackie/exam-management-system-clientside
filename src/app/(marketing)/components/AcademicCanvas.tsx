// clientside/src/app/(marketing)/components/AcademicCanvas.tsx
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

type ShapeKind = "book" | "cap" | "scroll" | "seal" | "doc" | "diploma" | "report";

interface AcademicShape {
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
}

const SHAPE_KINDS: ShapeKind[] = ["book", "cap", "scroll", "seal", "doc", "diploma", "report"];

// Drawing functions (unchanged from original)
const drawBook = (ctx: CanvasRenderingContext2D, s: number) => {
  const hw = s * 0.42, hh = s * 0.52;
  ctx.beginPath();
  ctx.moveTo(-hw, -hh);
  ctx.lineTo(0, -hh * 0.92);
  ctx.lineTo(0, hh * 0.92);
  ctx.lineTo(-hw, hh);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -hh * 0.92);
  ctx.lineTo(hw, -hh);
  ctx.lineTo(hw, hh);
  ctx.lineTo(0, hh * 0.92);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -hh * 0.92);
  ctx.lineTo(0, hh * 0.92);
  ctx.stroke();
  for (let i = 1; i <= 4; i++) {
    const y = -hh * 0.55 + i * hh * 0.28;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.75, y);
    ctx.lineTo(-hw * 0.1, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hw * 0.1, y);
    ctx.lineTo(hw * 0.75, y);
    ctx.stroke();
  }
};

const drawGradCap = (ctx: CanvasRenderingContext2D, s: number) => {
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.46);
  ctx.lineTo(s * 0.52, -s * 0.04);
  ctx.lineTo(0, s * 0.14);
  ctx.lineTo(-s * 0.52, -s * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-s * 0.26, s * 0.1, s * 0.52, s * 0.22);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.28, -s * 0.06);
  ctx.bezierCurveTo(s * 0.42, s * 0.08, s * 0.38, s * 0.28, s * 0.28, s * 0.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 0.28, s * 0.42, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
};

const drawScroll = (ctx: CanvasRenderingContext2D, s: number) => {
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
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, s * 0.34);
  ctx.lineTo(-s * 0.1, s * 0.48);
  ctx.moveTo(s * 0.1, s * 0.34);
  ctx.lineTo(s * 0.1, s * 0.48);
  ctx.stroke();
};

const drawSeal = (ctx: CanvasRenderingContext2D, s: number) => {
  const pts = 18, oR = s * 0.46, iR = s * 0.38;
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
  const starRadii = [s * 0.15, s * 0.07];
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = starRadii[i % 2];
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    if (i === 0) ctx.moveTo(r * Math.cos(a), r * Math.sin(a));
    else ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawDoc = (ctx: CanvasRenderingContext2D, s: number) => {
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
};

const drawReport = (ctx: CanvasRenderingContext2D, s: number) => {
  for (let i = 2; i >= 0; i--) {
    const ox = i * s * 0.05, oy = -i * s * 0.06;
    ctx.beginPath();
    ctx.rect(-s * 0.38 + ox, -s * 0.44 + oy, s * 0.76, s * 0.88);
    ctx.fill();
    ctx.stroke();
  }
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
};

const drawDiploma = (ctx: CanvasRenderingContext2D, s: number) => {
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
};

const drawShape = (ctx: CanvasRenderingContext2D, shape: AcademicShape) => {
  ctx.save();
  ctx.translate(shape.x, shape.y);
  ctx.rotate(shape.rotation);
  const alpha = shape.opacity + Math.sin(shape.pulse) * 0.018;
  ctx.strokeStyle = `rgba(212,175,55,${alpha})`;
  ctx.fillStyle = `rgba(212,175,55,${alpha * 0.13})`;
  ctx.lineWidth = 0.75;
  
  const drawMap: Record<ShapeKind, (ctx: CanvasRenderingContext2D, s: number) => void> = {
    book: drawBook, cap: drawGradCap, scroll: drawScroll,
    seal: drawSeal, doc: drawDoc, report: drawReport, diploma: drawDiploma,
  };
  drawMap[shape.kind](ctx, shape.size);
  ctx.restore();
};

export function AcademicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const shapesRef = useRef<AcademicShape[]>([]);
  const rm = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let width = 0, height = 0;
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const initShapes = (w: number, h: number) => {
      shapesRef.current = Array.from({ length: 24 }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (rm ? 0 : 0.26),
        vy: (Math.random() - 0.5) * (rm ? 0 : 0.17),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: rm ? 0 : (Math.random() - 0.5) * 0.006,
        size: Math.random() * 32 + 16,
        opacity: Math.random() * 0.14 + 0.05,
        kind: SHAPE_KINDS[i % SHAPE_KINDS.length],
        pulse: Math.random() * Math.PI,
        pulseDir: 1,
      }));
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        initShapes(width, height);
      }, 150);
    };

    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    initShapes(width, height);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const shapes = shapesRef.current;

      // Connection lines
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const dx = shapes[i].x - shapes[j].x, dy = shapes[i].y - shapes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 190) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(212,175,55,${(1 - dist / 190) * 0.055})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(shapes[i].x, shapes[i].y);
            ctx.lineTo(shapes[j].x, shapes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const shape of shapes) {
        if (!rm) {
          const mouseX = mouseRef.current.x * width, mouseY = mouseRef.current.y * height;
          const dx = mouseX - shape.x, dy = mouseY - shape.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 210) {
            shape.vx += dx * 0.00006;
            shape.vy += dy * 0.00006;
          }
          shape.x += shape.vx;
          shape.y += shape.vy;
          shape.vx *= 0.993;
          shape.vy *= 0.993;
          shape.rotation += shape.rotSpeed;
          shape.pulse += 0.022 * shape.pulseDir;
          if (shape.pulse > Math.PI || shape.pulse < 0) shape.pulseDir *= -1;
          if (shape.x < -90) shape.x = width + 90;
          if (shape.x > width + 90) shape.x = -90;
          if (shape.y < -90) shape.y = height + 90;
          if (shape.y > height + 90) shape.y = -90;
        }
        drawShape(ctx, shape);
      }
      if (!rm) animRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / width, y: e.clientY / height };
    };
    if (!rm) window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [rm]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" />;
}