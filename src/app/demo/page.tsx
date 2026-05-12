
// src/app/demo/page.tsx 
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { branding } from "@/config/branding";
import { useAnalytics } from "@/hooks/useAnalytics";
import { JourneyScreen } from "./components/JourneyScreen";
import { PromotionScreen } from "./components/PromotionScreen";
import { StatusScreen } from "./components/StatusScreen";
import { ScreenId } from "./components/types";
import { useSearchParams } from "next/navigation";
import { DemoWrapper } from "./components/DemoWrapper";
import { Users, TrendingUp, Zap } from "lucide-react";


const SCREENS = [
  { id: "journey" as const, label: "Journey Timeline", icon: <TrendingUp size={14} />, desc: "Full student history" },
  { id: "promotion" as const, label: "Promotion Preview", icon: <Users size={14} />, desc: "ENG rules applied" },
  { id: "engine" as const, label: "Status Engine", icon: <Zap size={14} />, desc: "Real-time calculation" },
];

// Need to import these icons

function DemoContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const [activeScreen, setActiveScreen] = useState<ScreenId>("journey");
  const { trackScreenSwitch, trackGetStarted } = useAnalytics();

  const handleScreenChange = (screen: ScreenId) => {
    setActiveScreen(screen);
    trackScreenSwitch(screen);
  };

  const handleGetStarted = () => {
    trackGetStarted();
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case "journey": return <JourneyScreen />;
      case "promotion": return <PromotionScreen />;
      case "engine": return <StatusScreen />;
      default: return <JourneyScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#071510] text-white font-sans antialiased">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/10 bg-[#071510]/90 backdrop-blur-md flex items-center h-14">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-md group-hover:bg-[#D4AF37]/40 transition-all" />
              <Image src={branding.logoIcon} alt={branding.devCom} width={36} height={36} className="relative" />
            </div>
            <span className="font-serif text-lg font-bold text-[#D4AF37] tracking-wide">{branding.devName}</span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50 animate-pulse" />
            Interactive Demo
          </div>
          <Link
            href="/signup"
            onClick={handleGetStarted}
            className="flex items-center gap-1.5 bg-[#D4AF37] text-[#0A1F16] px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider hover:bg-[#F0D264] transition-colors"
          >
            Get Started <ChevronRight size={11} />
          </Link>
        </div>
      </nav>

      <div className="pt-14 flex flex-col h-screen">
        {/* Demo header */}
        <div className="px-6 py-4 border-b border-[#D4AF37]/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-widest mb-0.5">
                  Live Interactive Demo
                </p>
                <h1 className="text-lg font-bold text-white">
                  {branding.devName} — Academic Management System
                </h1>
              </div>
              <div className="flex items-center gap-1 p-1 bg-white/3 border border-white/5 rounded-xl">
                {SCREENS.map((screen) => (
                  <button
                    key={screen.id}
                    onClick={() => handleScreenChange(screen.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      activeScreen === screen.id
                        ? "bg-[#D4AF37] text-[#0A1F16]"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {screen.icon}
                    {screen.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Demo body with wrapper */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="max-w-7xl mx-auto h-full">
            <DemoWrapper userEmail={emailParam || undefined}>
              <div className="flex-1 flex overflow-hidden h-full">
                {/* Sidebar - preserving your existing sidebar */}
                <div className="w-48 border-r border-white/5 bg-black/10 p-3 flex flex-col gap-1 flex-shrink-0">
                  <div className="mb-2 px-2">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Coordinator</p>
                    <p className="text-[9px] font-bold text-white/50 truncate">Dr. J. Mwangi</p>
                    {emailParam && (
                      <p className="text-[7px] font-mono text-white/20 truncate mt-1">{emailParam}</p>
                    )}
                  </div>
                  {[
                    { icon: <Users size={10} />, label: "Students", screenId: "journey" as ScreenId },
                    { icon: <TrendingUp size={10} />, label: "Promotion", screenId: "promotion" as ScreenId },
                    { icon: <Zap size={10} />, label: "Status Engine", screenId: "engine" as ScreenId },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={() => handleScreenChange(item.screenId)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-[9px] font-medium cursor-pointer transition-colors ${
                        activeScreen === item.screenId
                          ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                          : "text-white/20 hover:text-white/40"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-5 overflow-hidden">{renderActiveScreen()}</div>
              </div>
            </DemoWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#071510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    }>
      <DemoContent />
    </Suspense>
  );
}