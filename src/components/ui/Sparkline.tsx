// clientside/src/components/ui/Sparkline.tsx
"use client";

export default function Sparkline({ data }: { data: number[] }) {
  const width = 100;
  const height = 30;
  const padding = 5;

  // Calculate SVG points based on data
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Subtle Glow Path */}
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-yellow-gold/30 blur-[2px]"
      />
      {/* Primary Path */}
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-yellow-gold group-hover:text-green-darkest transition-colors duration-500"
      />
    </svg>
  );
}