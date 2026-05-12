// src/app/signup/page.tsx - UPDATED with analytics
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Loader2, ArrowLeft, ChevronRight } from "lucide-react";
import { branding } from "@/config/branding";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSearchParams } from "next/navigation";

const STUDENT_COUNT_OPTIONS = ["Under 200", "200 – 500", "500 – 1,000", "1,000 – 2,000", "2,000 – 5,000", "Over 5,000"];
const HOW_HEARD_OPTIONS = ["Colleague / referral", "Conference / workshop", "Google search", "Social media", "Partner institution", "Other"];

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-1.5">
        {label}
        {required && <span className="text-[#D4AF37] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-mono";

function SignupContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "direct";
  const { trackSignupFormViewed, trackSignupFormSubmitted } = useAnalytics();

  const [form, setForm] = useState({
    institutionName: "",
    fullName: "",
    jobTitle: "",
    email: "",
    studentCount: "",
    howHeard: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    trackSignupFormViewed(source);
  }, [source, trackSignupFormViewed]);

  const handleChange =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ( !form.institutionName || !form.fullName || !form.email || !form.studentCount ) {
      setError("Please fill all required fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid work email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/pilot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      if (!res.ok) throw new Error("Submission failed");
      trackSignupFormSubmitted(form.studentCount, source);
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={28} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Request received.
        </h1>
        <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-2">
          The team will review your request and reach out within{" "}
          <span className="text-white">1 business day</span>.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/demo"
            className="flex items-center gap-1.5 border border-[#D4AF37]/30 text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#D4AF37]/5 transition-colors"
          >
            Back to Demo
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-[#D4AF37] text-[#0A1F16] px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#F0D264] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 border border-[#D4AF37]/30 rounded-full px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
            Pilot Programme
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
          Request access for
          <br />
          your institution
        </h1>
        <p className="text-white/50 text-sm leading-relaxed max-w-lg">
          We personally onboard every institution. After submitting, our team
          will review your request and reach out within 1 business day to walk
          you through setup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Institution Name" required>
          <input
            type="text"
            className={inputCls}
            placeholder="e.g. Dedan Kimathi University of Technology"
            value={form.institutionName}
            onChange={handleChange("institutionName")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input
              type="text"
              className={inputCls}
              placeholder="Dr. Jane Wanjiku"
              value={form.fullName}
              onChange={handleChange("fullName")}
            />
          </Field>
          <Field label="Job Title">
            <input
              type="text"
              className={inputCls}
              placeholder="Examination Coordinator"
              value={form.jobTitle}
              onChange={handleChange("jobTitle")}
            />
          </Field>
        </div>

        <Field label="Work Email" required>
          <input
            type="email"
            className={inputCls}
            placeholder="j.wanjiku@dkut.ac.ke"
            value={form.email}
            onChange={handleChange("email")}
          />
          <p className="text-[10px] text-white/20 mt-1 font-mono">
            Use your institutional email — personal emails will not be approved.
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Estimated Active Students" required>
            <select
              className={inputCls}
              value={form.studentCount}
              onChange={handleChange("studentCount")}
            >
              <option value="" disabled>
                Select range…
              </option>
              {STUDENT_COUNT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="How did you hear about us?">
            <select
              className={inputCls}
              value={form.howHeard}
              onChange={handleChange("howHeard")}
            >
              <option value="" disabled>
                Select…
              </option>
              {HOW_HEARD_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Anything else? (optional)">
          <textarea
            className={inputCls + " resize-none h-24"}
            placeholder="Tell us about your current exam management process…"
            value={form.message}
            onChange={handleChange("message")}
          />
        </Field>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A1F16] py-3.5 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-[#F0D264] transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Submitting…
            </>
          ) : (
            <>
              Request Access <ChevronRight size={15} />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-white/20 font-mono">
          We respond within 1 business day.
        </p>
      </form>
    </>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#071510] text-white font-sans antialiased">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#D4AF37]/15 bg-[#071510]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-md group-hover:bg-[#D4AF37]/40 transition-all" />
                        <Image src={branding.logoIcon} alt={branding.devCom} width={36} height={36} className="relative" />
                      </div>
                      <span className="font-serif text-lg font-bold text-[#D4AF37] tracking-wide">{branding.devName}</span>
                    </Link>
          <Link
            href="/demo"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-white/40 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft size={11} /> View Demo
          </Link>
        </div>
      </nav>
      <div className="pt-14 min-h-screen flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <Suspense
            fallback={
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto" />
              </div>
            }
          >
            <SignupContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
