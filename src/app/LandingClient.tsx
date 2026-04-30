"use client";
// clientside/src/app/(marketing)/LandingClient.tsx
//
// All interactive/animated parts of the landing page.
// Kept separate from page.tsx so metadata can stay in a server component.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

// ── Fade-in wrapper used throughout ─────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
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

// ── Workflow steps ────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Upload marks",
    desc: "Download the scoresheet template, fill it in Excel, upload. Detailed or direct format auto-detected.",
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

// ── Pricing ───────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    price: "KES 3,000",
    per: "/ month",
    students: "Up to 500 students",
    features: [
      "All core features",
      "Senate report generation",
      "Email support",
      "1 coordinator seat",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Standard",
    price: "KES 8,000",
    per: "/ month",
    students: "Up to 2,000 students",
    features: [
      "Everything in Starter",
      "Journey CMS exports",
      "Priority support",
      "3 coordinator seats",
      "Disciplinary module",
    ],
    cta: "Most popular",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "KES 20,000",
    per: "/ month",
    students: "Unlimited students",
    features: [
      "Everything in Standard",
      "Custom branding",
      "Dedicated support",
      "Unlimited seats",
      "API access",
      "SLA guarantee",
    ],
    cta: "Contact us",
    highlight: false,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function LandingClient() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1F16] text-white font-sans antialiased">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/20 bg-[#0A1F16]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/Logo.png" alt="SenateDesk" width={36} height={36} />
            <span className="font-serif text-lg font-bold text-[#D4AF37] tracking-wide">
              SenateDesk
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Pricing", "Blog"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-white/70 hover:text-[#D4AF37] transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-[#D4AF37] text-[#0A1F16] font-semibold px-5 py-2 rounded-md hover:bg-[#F0D264] transition-colors"
            >
              Request demo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2"
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

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-[#D4AF37]/20 bg-[#0A1F16] px-6 py-4 flex flex-col gap-4"
          >
            {["Features", "How it works", "Pricing", "Blog"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-white/70"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm bg-[#D4AF37] text-[#0A1F16] font-semibold px-4 py-2 rounded-md text-center"
            >
              Sign in
            </Link>
          </motion.div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Gold accent left bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]" />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-xs text-[#D4AF37] tracking-widest uppercase font-medium">
                Built for Engineering Schools
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight tracking-tight mb-6 max-w-4xl">
              Academic progression,{" "}
              <span className="text-[#D4AF37]">finally automated.</span>
            </h1>

            <p className="text-lg text-white/60 max-w-2xl leading-relaxed mb-10">
              SenateDesk handles everything from marks upload to senate report
              generation — ENG regulation compliance, supplementary tracking,
              carry-forward units, and promotion decisions. Built for
              engineering school coordinators who spend too many hours doing
              what software should do.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#0A1F16] font-bold px-8 py-3.5 rounded-md hover:bg-[#F0D264] transition-colors text-sm"
              >
                Request a demo
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"
                  />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-[#D4AF37]/40 text-[#D4AF37] px-8 py-3.5 rounded-md hover:bg-[#D4AF37]/10 transition-colors text-sm"
              >
                See how it works
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { val: "27", unit: "ENG rules", label: "fully automated" },
              { val: "15+", unit: "Senate docs", label: "generated per cycle" },
              { val: "< 2s", unit: "Export time", label: "per 5,000 students" },
              { val: "100%", unit: "Audit trail", label: "every state change" },
            ].map((stat) => (
              <div
                key={stat.unit}
                className="border border-[#D4AF37]/20 rounded-lg p-5 bg-[#123828]/50"
              >
                <div className="text-2xl font-bold text-[#D4AF37] font-serif">
                  {stat.val}
                </div>
                <div className="text-sm font-medium text-white mt-1">
                  {stat.unit}
                </div>
                <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24 px-6 border-t border-[#D4AF37]/10"
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3">
              Capabilities
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Everything a coordinator needs
            </h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              One system handles the full academic year cycle — no spreadsheet
              juggling, no manual regulation lookups, no missed edge cases.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.07}>
                <div className="h-full border border-[#D4AF37]/15 rounded-xl p-6 bg-[#123828]/30 hover:border-[#D4AF37]/40 hover:bg-[#123828]/60 transition-all group">
                  <div className="text-2xl mb-4">{feat.icon}</div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-6 border-t border-[#D4AF37]/10 bg-[#123828]/20"
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3">
              Workflow
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              From upload to senate report in 4 steps
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="relative">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(100%+12px)] w-6 h-px bg-[#D4AF37]/30 -translate-y-1/2" />
                  )}
                  <div className="text-4xl font-serif font-bold text-[#D4AF37]/20 mb-3">
                    {step.num}
                  </div>
                  <div className="w-8 h-0.5 bg-[#D4AF37] mb-4" />
                  <h3 className="font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENG COMPLIANCE CALLOUT ──────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-[#D4AF37]/10">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="border border-[#D4AF37]/30 rounded-2xl p-8 md:p-12 bg-[#123828]/40 flex flex-col md:flex-row gap-10 items-start">
              <div className="flex-1">
                <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3">
                  Regulation compliance
                </p>
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                  Every ENG rule, correctly applied
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
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
                  ].map((rule) => (
                    <span
                      key={rule}
                      className="text-xs border border-[#D4AF37]/30 text-[#D4AF37]/80 px-3 py-1 rounded-full"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mini rule visualisation */}
              <div className="w-full md:w-72 flex-shrink-0">
                <div className="bg-[#0A1F16] rounded-xl p-5 border border-[#D4AF37]/20 font-mono text-xs">
                  <div className="text-[#D4AF37]/60 mb-3">
                    {/* // ENG.13(a) status engine */}
                  </div>
                  {[
                    {
                      cond: "fail ≥ 50%   →",
                      result: "REPEAT YEAR",
                      color: "text-red-400",
                    },
                    {
                      cond: "mean &lt; 40  →",
                      result: "REPEAT YEAR",
                      color: "text-red-400",
                    },
                    {
                      cond: "fail &gt; ⅓  →",
                      result: "STAYOUT",
                      color: "text-amber-400",
                    },
                    {
                      cond: "fail ≤ ⅓   →",
                      result: "SUPPLEMENTARY",
                      color: "text-yellow-300",
                    },
                    {
                      cond: "all pass   →",
                      result: "PROMOTED",
                      color: "text-green-400",
                    },
                  ].map((row) => (
                    <div
                      key={row.result}
                      className="flex justify-between py-1 border-b border-white/5 last:border-0"
                    >
                      <span
                        className="text-white/40"
                        dangerouslySetInnerHTML={{ __html: row.cond }}
                      />
                      <span className={row.color}>{row.result}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-24 px-6 border-t border-[#D4AF37]/10 bg-[#123828]/20"
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Simple, transparent pricing
            </h2>
            <p className="text-white/50 mt-3 text-sm">
              All plans include the full feature set. Scale up as your
              institution grows.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.08}>
                <div
                  className={`h-full rounded-2xl p-7 flex flex-col border transition-all ${
                    plan.highlight
                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                      : "border-[#D4AF37]/20 bg-[#123828]/30"
                  }`}
                >
                  {plan.highlight && (
                    <div className="text-xs font-semibold text-[#0A1F16] bg-[#D4AF37] px-3 py-1 rounded-full self-start mb-4">
                      Most popular
                    </div>
                  )}
                  <div className="text-lg font-bold text-white mb-1">
                    {plan.name}
                  </div>
                  <div className="text-3xl font-serif font-bold text-[#D4AF37] mb-0.5">
                    {plan.price}
                  </div>
                  <div className="text-xs text-white/40 mb-1">{plan.per}</div>
                  <div className="text-xs text-[#D4AF37]/70 mb-6">
                    {plan.students}
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-8">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-white/70"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <circle
                            cx="7"
                            cy="7"
                            r="6"
                            stroke="#D4AF37"
                            strokeWidth="1"
                          />
                          <path
                            d="M4.5 7L6.5 9L9.5 5"
                            stroke="#D4AF37"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`text-center text-sm font-semibold py-3 rounded-md transition-colors ${
                      plan.highlight
                        ? "bg-[#D4AF37] text-[#0A1F16] hover:bg-[#F0D264]"
                        : "border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-8 text-center">
            <p className="text-xs text-white/30">
              All prices in Kenyan Shillings. Overage charged at KES 5 per
              additional student. Annual billing available at 2 months free.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── BLOG TEASER ─────────────────────────────────────────────────── */}
      <section id="blog" className="py-24 px-6 border-t border-[#D4AF37]/10">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3">
                From the blog
              </p>
              <h2 className="text-3xl font-serif font-bold">
                Academic regulation, explained
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors whitespace-nowrap"
            >
              View all posts →
            </Link>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                tag: "ENG Regulations",
                title:
                  "How ENG.16 repeat-year decisions work — and how to automate them",
                excerpt:
                  "When a student fails more than half their units or scores a mean below 40, the regulation is clear. The implementation rarely is. Here's the complete decision tree.",
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
                  "One-third sounds simple until you're determining denominator edge cases — what counts as a registered unit, how deferred units affect the threshold, and why hardcoding 5 is wrong.",
                slug: "eng-13-supplementary-threshold",
                date: "Mar 2025",
              },
            ].map((post, i) => (
              <FadeIn key={post.slug} delay={i * 0.08}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block h-full border border-[#D4AF37]/15 rounded-xl p-6 bg-[#123828]/20 hover:border-[#D4AF37]/40 hover:bg-[#123828]/50 transition-all group"
                >
                  <div className="text-xs text-[#D4AF37] font-medium mb-3 uppercase tracking-wide">
                    {post.tag}
                  </div>
                  <h3 className="font-semibold text-white text-sm leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="text-xs text-white/30">{post.date}</div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#D4AF37]/10">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="w-px h-12 bg-[#D4AF37]/30 mx-auto mb-10" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Ready to eliminate manual promotion cycles?
            </h2>
            <p className="text-white/50 text-sm mb-10 leading-relaxed">
              Request a demo and see how SenateDesk handles your
              institution&apos;s full academic cycle — from upload to senate
              board.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-[#D4AF37] text-[#0A1F16] font-bold px-10 py-3.5 rounded-md hover:bg-[#F0D264] transition-colors text-sm"
              >
                Get started
              </Link>
              <a
                href="mailto:hello@newtsolhub.com"
                className="inline-flex items-center justify-center border border-[#D4AF37]/40 text-[#D4AF37] px-10 py-3.5 rounded-md hover:bg-[#D4AF37]/10 transition-colors text-sm"
              >
                Contact newtsolhub
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#D4AF37]/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/Logo.png" alt="SenateDesk" width={28} height={28} />
            <span className="text-sm font-serif text-[#D4AF37]">
              SenateDesk
            </span>
            <span className="text-white/20 text-sm">by</span>
            <Image
              src="/newtsolhubLogo.png"
              alt="newtsolhub"
              width={90}
              height={22}
              className="opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>

          <div className="flex items-center gap-6">
            {["Features", "Pricing", "Blog", "Sign in"].map((link) => (
              <Link
                key={link}
                href={link === "Sign in" ? "/login" : `#${link.toLowerCase()}`}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                {link}
              </Link>
            ))}
          </div>

          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} newtsolhub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
