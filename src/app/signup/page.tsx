// clientside/src/app/signup/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowLeft, ChevronRight } from "lucide-react";
import { track } from "@/lib/useAnalytics";

// ── Types ──────────────────────────────────────────────────────────────────

interface FormState {
  institutionName: string;
  fullName: string;
  jobTitle: string;
  email: string;
  studentCount: string;
  howHeard: string;
  message: string;
}

const EMPTY: FormState = {
  institutionName: "",
  fullName: "",
  jobTitle: "",
  email: "",
  studentCount: "",
  howHeard: "",
  message: "",
};

const STUDENT_COUNT_OPTIONS = [
  "Under 200",
  "200 – 500",
  "500 – 1,000",
  "1,000 – 2,000",
  "2,000 – 5,000",
  "Over 5,000",
];

const HOW_HEARD_OPTIONS = [
  "Colleague / referral",
  "Conference / workshop",
  "Google search",
  "Social media",
  "DeKUT / partner institution",
  "Other",
];

// ── Input component ────────────────────────────────────────────────────────

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
  "w-full bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 " +
  "outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-mono";

// ── Main component ─────────────────────────────────────────────────────────

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.institutionName ||
      !form.fullName ||
      !form.email ||
      !form.studentCount
    ) {
      setError("Please fill all required fields.");
      return;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) {
      setError("Please enter a valid work email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/pilot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string }).message || "Submission failed.",
        );
      }
      track("signup_form_submitted", {
        studentCount: form.studentCount,
        howHeard: form.howHeard || "not_specified",
      });
      setDone(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071510] text-white font-sans antialiased">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#D4AF37]/15 bg-[#071510]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#D4AF37] rounded-md flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 18 18" width="14" height="14" fill="none">
                <path
                  d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z"
                  stroke="#0A1F16"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M9 6L12 7.75V11.25L9 13L6 11.25V7.75L9 6Z"
                  fill="#0A1F16"
                />
              </svg>
            </div>
            <span className="font-bold text-[#D4AF37] text-sm">SenateDesk</span>
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
          {done ? (
            /* ── Success state ─────────────────────────────────────────── */
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Request received.
              </h1>
              <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-2">
                The newtsolhub team will review your request and reach out
                within <span className="text-white">1 business day</span> to
                schedule your onboarding call.
              </p>
              <p className="text-white/30 text-xs mb-8">
                Check your spam folder if you do not hear from us.
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
          ) : (
            /* ── Form ──────────────────────────────────────────────────── */
            <>
              {/* Header */}
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
                  We personally onboard every institution. After submitting, our
                  team will review your request and reach out within 1 business
                  day to walk you through setup.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Institution */}
                <Field label="Institution Name" required>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Dedan Kimathi University of Technology"
                    value={form.institutionName}
                    onChange={set("institutionName")}
                  />
                </Field>

                {/* Name + Title */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full Name" required>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Dr. Jane Wanjiku"
                      value={form.fullName}
                      onChange={set("fullName")}
                    />
                  </Field>
                  <Field label="Job Title">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Examination Coordinator"
                      value={form.jobTitle}
                      onChange={set("jobTitle")}
                    />
                  </Field>
                </div>

                {/* Email */}
                <Field label="Work Email" required>
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="j.wanjiku@dkut.ac.ke"
                    value={form.email}
                    onChange={set("email")}
                  />
                  <p className="text-[10px] text-white/20 mt-1 font-mono">
                    Use your institutional email — personal emails will not be
                    approved.
                  </p>
                </Field>

                {/* Student count + How heard */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Estimated Active Students" required>
                    <select
                      className={inputCls}
                      value={form.studentCount}
                      onChange={set("studentCount")}
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
                      onChange={set("howHeard")}
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

                {/* Message */}
                <Field label="Anything else? (optional)">
                  <textarea
                    className={inputCls + " resize-none h-24"}
                    placeholder="Tell us about your current exam management process, or any specific requirements…"
                    value={form.message}
                    onChange={set("message")}
                  />
                </Field>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() =>
                    track("get_started_clicked", {
                      label: "signup_form_submit",
                    })
                  }
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

                {/* Trust line */}
                <p className="text-center text-[11px] text-white/20 font-mono">
                  Your information is never shared. We respond within 1 business
                  day.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER — create this file:
// clientside/src/app/api/pilot-request/route.ts
// ══════════════════════════════════════════════════════════════════════════════
//
// npm install nodemailer
// npm install --save-dev @types/nodemailer
//
// Add to .env.local:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=your-gmail@gmail.com
//   SMTP_PASS=your-app-password          ← Gmail App Password, NOT your main password
//   NOTIFY_EMAIL=hello@newtsolhub.com
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  import { NextRequest, NextResponse } from "next/server";               │
// │  import nodemailer from "nodemailer";                                   │
// │                                                                         │
// │  export async function POST(req: NextRequest) {                         │
// │    try {                                                                │
// │      const body = await req.json();                                     │
// │      const {                                                            │
// │        institutionName, fullName, jobTitle, email,                      │
// │        studentCount, howHeard, message,                                 │
// │      } = body;                                                          │
// │                                                                         │
// │      if (!institutionName || !fullName || !email || !studentCount) {    │
// │        return NextResponse.json(                                        │
// │          { message: "Missing required fields." },                       │
// │          { status: 400 }                                                │
// │        );                                                               │
// │      }                                                                  │
// │                                                                         │
// │      const transporter = nodemailer.createTransport({                  │
// │        host:   process.env.SMTP_HOST,                                  │
// │        port:   Number(process.env.SMTP_PORT) || 587,                   │
// │        secure: false,                                                   │
// │        auth: {                                                          │
// │          user: process.env.SMTP_USER,                                  │
// │          pass: process.env.SMTP_PASS,                                  │
// │        },                                                               │
// │      });                                                                │
// │                                                                         │
// │      await transporter.sendMail({                                       │
// │        from:    `"SenateDesk" <${process.env.SMTP_USER}>`,             │
// │        to:      process.env.NOTIFY_EMAIL,                              │
// │        replyTo: email,                                                  │
// │        subject: `New Pilot Request — ${institutionName}`,              │
// │        html: `                                                          │
// │          <h2>New Pilot Request</h2>                                     │
// │          <table>                                                        │
// │            <tr><td><b>Institution</b></td><td>${institutionName}</td></tr>│
// │            <tr><td><b>Name</b></td><td>${fullName} (${jobTitle})</td></tr>│
// │            <tr><td><b>Email</b></td><td>${email}</td></tr>             │
// │            <tr><td><b>Students</b></td><td>${studentCount}</td></tr>   │
// │            <tr><td><b>How heard</b></td><td>${howHeard||"N/A"}</td></tr>│
// │            <tr><td><b>Message</b></td><td>${message||"—"}</td></tr>   │
// │          </table>                                                       │
// │        `,                                                               │
// │      });                                                                │
// │                                                                         │
// │      return NextResponse.json({ ok: true });                            │
// │    } catch (err: unknown) {                                             │
// │      console.error("[pilot-request]", err);                            │
// │      return NextResponse.json(                                          │
// │        { message: "Server error. Please try again." },                 │
// │        { status: 500 }                                                  │
// │      );                                                                 │
// │    }                                                                    │
// │  }                                                                      │
// └─────────────────────────────────────────────────────────────────────────┘
