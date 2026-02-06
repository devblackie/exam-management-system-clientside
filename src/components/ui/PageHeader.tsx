"use client";

import React, { useState, useEffect } from "react";
import { useServerHealth } from "@/hooks/useServerHealth";

interface PageHeaderProps {
  title: string;
  highlightedTitle?: string; // The "Overview" part in light font
  subtitle?: string; // For instructions like "Required: Reg No..."
  systemLabel?: string; // e.g. "Exam Management System"
  actions?: React.ReactNode; // Buttons like "+ New Unit"
  showStatus?: boolean; // Toggle for the pulse/clock
}

export default function PageHeader({
  title,
  highlightedTitle,
  subtitle,
  systemLabel = "",
  actions,
  showStatus = true,
}: PageHeaderProps) {
  const isOnline = useServerHealth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Clock Synchronization
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
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    .toUpperCase();

  return (
    <header className="mb-8 w-full animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex justify-between items-end border-b border-green-darkest/10 pb-2">
        {/* LEFT: Identity & Context */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <span
              className={`h-1 w-8 rounded-full transition-colors duration-500 ${isOnline ? "bg-yellow-gold" : "bg-red-500"}`}
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

        {/* RIGHT: Actions & Live Telemetry */}
        <div className="flex items-center  gap-8">
          {actions && <div className="flex items-center gap-3 ">{actions}</div>}

          {showStatus && (
            <div className="text-right hidden sm:block border-l border-green-darkest/10 pl-6">
              <div className="flex items-center justify-end gap-2 mb-1 ">
                {/* Dynamic Pulse Indicator */}
                <span className="relative flex h-2 w-2">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 transition-colors duration-500 ${isOnline ? "bg-emerald-500" : "bg-red-500"}`}
                  ></span>
                </span>

                <p
                  className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isOnline ? "text-slate-400" : "text-red-500"}`}
                >
                  {isOnline ? "Server Connected" : "Server Disconnected"}
                </p>
              </div>

              <p className="text-xs font-mono font-bold text-green-darkest/80 tabular-nums">
                {/* {formattedDate} • {formattedTime} */}
                {mounted ? (
                  `${formattedDate} • ${formattedTime}`
                ) : (
                  <span className="opacity-0">Loading...</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}