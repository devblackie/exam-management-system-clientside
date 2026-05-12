// src/components/demo/DemoWrapper.tsx
"use client";

import { useState, useEffect } from "react";
import { Download, MessageCircle, Mail } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { EmailGateModal } from "./EmailGateModal";

interface DemoWrapperProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function DemoWrapper({ children, userEmail: initialEmail }: DemoWrapperProps) {
  const [isEmailGateOpen, setIsEmailGateOpen] = useState(!initialEmail);
  const [userEmail, setUserEmail] = useState(initialEmail);
  const { trackEmailGateShown, trackCMSDownload, trackTalkToTeam } = useAnalytics();

  useEffect(() => {
    if (isEmailGateOpen) {
      trackEmailGateShown();
    }
  }, [isEmailGateOpen, trackEmailGateShown]);

  const handleEmailSuccess = (email: string) => {
    setUserEmail(email);
    setIsEmailGateOpen(false);
  };

  const handleCMSDownload = () => {
    trackCMSDownload();
    const link = document.createElement("a");
    link.href = "/sample-cms.xlsx";
    link.download = "sample-cms.xlsx";
    link.click();
  };

  const handleTalkToTeam = () => {
    trackTalkToTeam();
    window.location.href = "/signup?source=demo_talk_to_team";
  };

  return (
    <>
      <EmailGateModal
        isOpen={isEmailGateOpen}
        onClose={() => setIsEmailGateOpen(false)}
        onSuccess={handleEmailSuccess}
      />

      <div className="h-full rounded-2xl border border-white/8 bg-[#0A1F16]/50 overflow-hidden flex flex-col">
        {/* Window chrome with buttons */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-black/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-5 max-w-xs rounded bg-white/5 flex items-center px-2">
              <span className="text-[8px] font-mono text-white/20">app.senatedesk.co.ke/coordinator</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* User email indicator - now actually displayed */}
            {userEmail && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                <Mail size={10} className="text-[#D4AF37]/60" />
                <span className="text-[8px] font-mono text-white/40 max-w-[120px] truncate">
                  {userEmail}
                </span>
              </div>
            )}
            <button
              onClick={handleCMSDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-bold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all"
            >
              <Download size={10} /> CMS Demo
            </button>
            <button
              onClick={handleTalkToTeam}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D4AF37] text-[#0A1F16] text-[10px] font-bold hover:bg-[#F0D264] transition-all"
            >
              <MessageCircle size={10} /> Talk to Team
            </button>
          </div>
        </div>

        {/* Your existing demo content */}
        {children}
      </div>
    </>
  );
}