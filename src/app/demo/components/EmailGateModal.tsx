// src/components/demo/EmailGateModal.tsx
"use client";

import { useState } from "react";
import { X, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";


interface EmailGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export function EmailGateModal({ isOpen, onClose, onSuccess }: EmailGateModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { trackEmailSubmitted } = useAnalytics();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check for free email domains
    const domain = email.split("@")[1];
    const freeDomains = [
      // "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "protonmail.com",
      "icloud.com",
    ];
    if (freeDomains.includes(domain?.toLowerCase() || "")) {
        setError("Please use your institutional email address (e.g., @university.ac.ke).");
        return;
      }

    setLoading(true);

    try {
      // Send to lead capture
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "demo_email_gate" }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      // Track analytics
      trackEmailSubmitted(email);

      setSubmitted(true);
      setTimeout(() => {
        onSuccess(email);
        onClose();
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0A1F16] border border-[#D4AF37]/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white/80 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {!submitted ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
                <Mail size={22} className="text-[#D4AF37]" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                See the full demo
              </h2>
              <p className="text-sm text-white/40 mb-6">
                Enter your work email to access the complete interactive demo,
                including CMS exports and senate report generation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-white/40 mb-1.5">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.ac.ke"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#D4AF37]/50 transition-colors"
                    autoFocus
                  />
                  {error && (
                    <p className="text-xs text-red-400 mt-1.5">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A1F16] py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-[#F0D264] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Continue to Demo →"
                  )}
                </button>
              </form>

              <p className="text-[10px] text-white/20 text-center mt-4">
                We&apos;ll send you the CMS export demo file.
                <br />
                No spam, unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={22} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Check your inbox
              </h3>
              <p className="text-sm text-white/40">
                We&apos;ve sent the CMS demo file to{" "}
                <strong className="text-white">{email}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Gold accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0" />
      </div>
    </div>
  );
}
