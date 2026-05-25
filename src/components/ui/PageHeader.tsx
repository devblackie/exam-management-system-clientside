// clientside/src/components/ui/PageHeader.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useServerHealth, ConnectionStatus } from "@/hooks/useServerHealth";

interface PageHeaderProps {
  title: string;
  highlightedTitle?: string;
  subtitle?: string;
  systemLabel?: string;
  actions?: React.ReactNode;
  showStatus?: boolean;
}

// ── Status display config ─────────────────────────────────────────────────────

interface StatusDisplay {
  barColor: string;
  dotColor: string;
  dotPing: boolean;
  label: string;
  labelColor: string;
}

function getStatusDisplay(status: ConnectionStatus): StatusDisplay {
  switch (status) {
    case "online":
      return {
        barColor: "bg-yellow-gold",
        dotColor: "bg-emerald-500",
        dotPing: true,
        label: "Server Connected",
        labelColor: "text-slate-400",
      };
    case "server-down":
      return {
        barColor: "bg-orange-400",
        dotColor: "bg-orange-400",
        dotPing: false,
        label: "Server Offline",
        labelColor: "text-orange-400",
      };
    case "network-down":
      return {
        barColor: "bg-red-500",
        dotColor: "bg-red-500",
        dotPing: false,
        label: "No Internet",
        labelColor: "text-red-400",
      };
    case "checking":
    default:
      return {
        barColor: "bg-slate-300",
        dotColor: "bg-slate-300",
        dotPing: false,
        label: "Connecting...",
        labelColor: "text-slate-300",
      };
  }
}

// ── Inline WifiOff icon (red, no external deps) ──────────────────────────────

function WifiOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ef4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="No internet connection"
    >
      <title>No internet</title>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

// ── Wifi signal icon (normal state) ──────────────────────────────────────────

interface WifiSignalProps {
  effectiveType: string | null;
  status: ConnectionStatus;
}

function WifiSignal({ effectiveType, status }: WifiSignalProps) {
  const noNet = status === "network-down";

  const strength: number = noNet
    ? 0
    : status !== "online" && status !== "server-down"
      ? 0
      : effectiveType === "4g"
        ? 3
        : effectiveType === "3g"
          ? 2
          : effectiveType === "2g" || effectiveType === "slow-2g"
            ? 1
            : 0;

  const on = "#10b981"; // emerald-500
  const dim = "#d1d5db"; // gray-300

  const arcColor = (needed: number) =>
    noNet ? dim : strength >= needed ? on : dim;

  const tooltipText = noNet
    ? "No internet"
    : effectiveType
      ? `Wifi: ${effectiveType.toUpperCase()}`
      : "Checking...";

  return (
    <svg
      width="16"
      height="13"
      viewBox="0 0 24 19"
      fill="none"
      aria-label={tooltipText}
    >
      <title>{tooltipText}</title>

      {/* Outer arc */}
      <path
        d="M1.5 7.5C6.3 2.8 17.7 2.8 22.5 7.5"
        stroke={arcColor(3)}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Middle arc */}
      <path
        d="M5.5 11.5C8.2 8.8 15.8 8.8 18.5 11.5"
        stroke={arcColor(2)}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Inner arc */}
      <path
        d="M9 15C10.2 13.8 13.8 13.8 15 15"
        stroke={arcColor(1)}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Dot */}
      <circle cx="12" cy="18" r="1.6" fill={arcColor(1)} />
    </svg>
  );
}

// ── Latency badge ─────────────────────────────────────────────────────────────

function LatencyBadge({ latency }: { latency: number | null }) {
  if (latency === null) return null;

  const color =
    latency < 150
      ? "text-emerald-600"
      : latency < 400
        ? "text-yellow-600"
        : "text-orange-500";

  return (
    <span className={`text-[9px] font-mono font-bold tabular-nums ${color}`}>
      {latency}ms
    </span>
  );
}

// ── Downlink speed ────────────────────────────────────────────────────────────

function SpeedLabel({ downlink }: { downlink: number | null }) {
  if (downlink === null) return null;
  const label =
    downlink >= 1
      ? `${downlink.toFixed(1)} Mbps`
      : `${(downlink * 1000).toFixed(0)} Kbps`;
  return (
    <span className="text-[9px] font-mono tabular-nums text-slate-400">
      {label}
    </span>
  );
}

// ── PageHeader component ─────────────────────────────────────────────────────

export default function PageHeader({
  title,
  highlightedTitle,
  subtitle,
  systemLabel = "",
  actions,
  showStatus = true,
}: PageHeaderProps) {
  const { status, network } = useServerHealth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentTime
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  const sd = getStatusDisplay(status);

  return (
    <header className="mb-8 w-full animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex justify-between items-end border-b border-green-darkest/10 pb-2">
        {/* LEFT */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <span
              className={`h-1 w-8 rounded-full transition-colors duration-500 ${sd.barColor}`}
            />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-darkest/40">
              {systemLabel}
            </span>
          </div>

          <h1 className="text-xl font-black text-green-darkest tracking-tight">
            {title}{" "}
            {highlightedTitle && (
              <span className="text-yellow-gold/80 font-light">
                {highlightedTitle}
              </span>
            )}
          </h1>

          {subtitle && (
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-8">
          {actions && <div className="flex items-center gap-3">{actions}</div>}

          {showStatus && (
            <div className="text-right hidden sm:block border-l border-green-darkest/10 pl-6">
              {/* Row 1: dot · label · [wifi icon · latency · speed] */}
              <div className="flex items-center justify-end gap-2 mb-1">
                {/* Pulse dot */}
                <span className="relative flex h-2 w-2">
                  {sd.dotPing && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 transition-colors duration-500 ${sd.dotColor}`}
                  />
                </span>

                {/* Status label */}
                <p
                  className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${sd.labelColor}`}
                >
                  {sd.label}
                </p>

                {/* Wifi icon – WifiOff when network down, otherwise normal arcs */}
                {status === "network-down" ? (
                  <WifiOffIcon />
                ) : (
                  <WifiSignal
                    effectiveType={network.effectiveType}
                    status={status}
                  />
                )}

                {/* Only show latency and speed when we have a working connection */}
                {status !== "network-down" && status !== "checking" && (
                  <>
                    <LatencyBadge latency={network.latency} />
                    <SpeedLabel downlink={network.downlink} />
                  </>
                )}
              </div>

              {/* Row 2: date + time */}
              <div className="flex items-center justify-end">
                <p className="text-xs font-mono font-bold text-green-darkest/80 tabular-nums">
                  {mounted ? (
                    `${formattedDate} • ${formattedTime}`
                  ) : (
                    <span className="opacity-0">Loading...</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}