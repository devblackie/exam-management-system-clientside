// clientside/src/app/(marketing)/LandingClient.tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { branding } from "@/config/branding";

// Components
import { AcademicCanvas } from "./components/AcademicCanvas";
import { OrbitRings } from "./components/OrbitRings";
import { ScrollProgress } from "./components/ScrollProgress";
import { FadeIn } from "./components/FadeIn";
import { GlowCard } from "./components/GlowCard";
import { AnimatedCounter } from "./components/AnimatedCounter";
import { TerminalBlock } from "./components/TerminalBlock";
import { FAQItem } from "./components/FAQItem";
import { TestimonialsBand } from "./components/TestimonialsBand";

// Data
import {
  FEATURES, STEPS, TESTIMONIALS, FAQS, BLOG_POSTS,
  // TRUSTED_INSTITUTIONS, PLANS,
   STATS, REGULATION_TAGS,
} from "./data/landingData";

// Hooks
import { useReducedMotion } from "./hooks/useReducedMotion";

export default function LandingClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const rm = useReducedMotion();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const rawO = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const heroY = rm ? 0 : rawY;
  const heroO = rm ? 1 : rawO;

  const navigationItems = ["Features", "How it works", "Pricing", "Blog"];
  const sidebarItems = ["Features", "Pricing", "Blog", "Sign in"];

  return (
    <div className="min-h-screen bg-[#040D08] text-white font-sans antialiased overflow-x-hidden">
      <ScrollProgress />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/10 bg-[#040D08]/88 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-md group-hover:bg-[#D4AF37]/40 transition-all" />
              <Image
                src={branding.logoIcon}
                alt={branding.devCom}
                width={36}
                height={36}
                className="relative"
              />
            </div>
            <span className="font-serif text-lg font-bold text-[#D4AF37] tracking-wide">
              {branding.devName}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-white/50 hover:text-[#D4AF37] transition-colors relative group font-medium"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/48 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/demo"
              className="text-sm bg-[#D4AF37] text-[#040D08] font-bold px-5 py-2.5 rounded-md hover:bg-[#F0D264] transition-colors shadow-lg shadow-[#D4AF37]/20"
            >
              Request demo →
            </Link>
          </div>

          <button
            className="md:hidden text-white/60 hover:text-white p-2"
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

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={rm ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={rm ? {} : { opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#D4AF37]/10 bg-[#040D08] px-6 py-4 flex flex-col gap-4 overflow-hidden"
            >
              {navigationItems.map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-white/60 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <Link
                href="/demo"
                className="text-sm bg-[#D4AF37] text-[#040D08] font-bold px-4 py-2.5 rounded-md text-center"
              >
                Request demo
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      >
        <AcademicCanvas />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_52%_at_50%_-8%,rgba(15,50,25,0.6),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_38%_38%_at_80%_58%,rgba(8,24,14,0.55),transparent)] pointer-events-none" />
        <OrbitRings />
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[2px] pointer-events-none"
        >
          <div className="h-full bg-gradient-to-b from-transparent via-[#D4AF37]/55 to-transparent" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroO }}
          className="relative max-w-6xl mx-auto px-6 py-28 w-full"
        >
          {/* <FadeIn className="mb-10">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="text-xs text-white/28 tracking-widest uppercase font-medium">Trusted by</span>
              {TRUSTED_INSTITUTIONS.map((name) => (
                <span key={name} className="text-xs font-semibold text-white/38 border border-[#D4AF37]/18 rounded px-3 py-1 bg-[#D4AF37]/4 backdrop-blur-sm">{name}</span>
              ))}
            </div>
          </FadeIn> */}

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <FadeIn delay={0.05}>
                <div className="inline-flex items-center gap-2 border border-[#D4AF37]/28 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/6 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-xs text-[#D4AF37] tracking-widest uppercase font-medium">
                    Built for Institutions of Higher Learning
                  </span>
                </div>
              </FadeIn>

              <FadeIn delay={0.12}>
                <h1 className="text-5xl md:text-6xl font-serif font-bold leading-[1.08] tracking-tight mb-6 text-white">
                  Academic progression,{" "}
                  <span className="text-[#D4AF37] relative">
                    finally automated.
                    <svg
                      aria-hidden
                      className="absolute -bottom-2 left-0 w-full opacity-35"
                      viewBox="0 0 340 6"
                      preserveAspectRatio="none"
                      height="6"
                    >
                      <path
                        d="M0 3 Q85 0 170 3 Q255 6 340 3"
                        stroke="#D4AF37"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-base text-white/48 leading-relaxed mb-7 max-w-lg">
                  {branding.devName} handles everything from marks upload to
                  senate report generation — ENG regulation compliance,
                  supplementary tracking, carry-forward units, and promotion
                  decisions. Built for engineering school coordinators who spend
                  too many hours doing what software should do.
                </p>
              </FadeIn>

              <FadeIn delay={0.26}>
                <div className="border-l-2 border-[#D4AF37]/45 pl-4 mb-8 py-1">
                  <p className="text-sm text-white/52 italic leading-relaxed">
                    &ldquo;The regulation engine caught edge cases our manual
                    process missed. We validated {branding.devName} against
                    three previous promotion cycles and found zero discrepancies
                    — but it took 85% less time.&rdquo;
                  </p>
                  <p className="text-xs text-[#D4AF37]/55 mt-2 font-semibold">
                    — Senior Examination Officer, validated across 2,300+
                    student records
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.32}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#040D08] font-bold px-8 py-3.5 rounded-md hover:bg-[#F0D264] transition-colors text-sm shadow-xl shadow-[#D4AF37]/22"
                  >
                    Book a free demo{" "}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M1 7h11M8 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 border border-[#D4AF37]/28 text-[#D4AF37] px-8 py-3.5 rounded-md hover:bg-[#D4AF37]/8 hover:border-[#D4AF37]/55 transition-all text-sm"
                  >
                    See how it works
                  </Link>
                </div>
                <p className="text-xs text-white/24 mt-3">
                  30-day pilot · No credit card required · Onboarding included
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={0.18} className="hidden lg:grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <GlowCard
                  key={stat.label}
                  className="border border-[#D4AF37]/14 rounded-2xl p-5 hover:border-[#D4AF37]/38 transition-all duration-300 group"
                >
                  <div className="text-base mb-2 opacity-55" aria-hidden>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-[#D4AF37] font-serif group-hover:scale-105 transition-transform inline-block">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-white/34 mt-0.5">
                    {stat.sublabel}
                  </div>
                </GlowCard>
              ))}
            </FadeIn>
          </div>

          <FadeIn
            delay={0.4}
            className="mt-14 grid grid-cols-2 gap-3 lg:hidden"
          >
            {STATS.slice(0, 4).map((stat) => (
              <div
                key={stat.label}
                className="border border-[#D4AF37]/14 rounded-xl p-4 bg-[#0A1F16]/40"
              >
                <div className="text-xl font-bold text-[#D4AF37] font-serif">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/45 mt-1">{stat.label}</div>
              </div>
            ))}
          </FadeIn>

          {!rm && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] text-white/18 tracking-widest uppercase">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-px h-8 bg-gradient-to-b from-[#D4AF37]/38 to-transparent"
              />
            </motion.div>
          )}
        </motion.div>
      </section>

      <TestimonialsBand testimonials={TESTIMONIALS} />

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 border-b border-[#D4AF37]/8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
              Capabilities
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Everything a coordinator needs
            </h2>
            <p className="text-white/38 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              One system handles the full academic year cycle — no spreadsheet
              juggling, no manual regulation lookups, no missed edge cases.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, idx) => (
              <FadeIn key={feature.title} delay={idx * 0.06}>
                <GlowCard className="h-full border border-[#D4AF37]/12 rounded-2xl p-7 hover:border-[#D4AF37]/34 transition-all duration-300 group cursor-default">
                  <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/8 border border-[#D4AF37]/18 flex items-center justify-center text-lg mb-5 group-hover:bg-[#D4AF37]/15 group-hover:scale-105 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2.5 group-hover:text-[#D4AF37] transition-colors text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="mt-4 w-7 h-px bg-[#D4AF37]/28 group-hover:w-14 transition-all duration-400" />
                </GlowCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-24 px-6 border-b border-[#D4AF37]/8 bg-[#050C07]/50 relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.024] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#D4AF37 1px,transparent 1px),linear-gradient(90deg,#D4AF37 1px,transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
        <div className="max-w-6xl mx-auto relative">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
              Workflow
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              From upload to senate report in 4 steps
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, idx) => (
              <FadeIn key={step.num} delay={idx * 0.09}>
                <motion.div
                  whileHover={rm ? {} : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="relative group cursor-default"
                >
                  {idx < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-[calc(100%+12px)] w-6 h-px bg-gradient-to-r from-[#D4AF37]/28 to-transparent" />
                  )}
                  <div className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37]/22 to-[#D4AF37]/5 mb-3 select-none">
                    {step.num}
                  </div>
                  <div className="w-9 h-0.5 bg-[#D4AF37] mb-4 group-hover:w-16 transition-all duration-400" />
                  <h3 className="font-semibold text-white mb-2 text-sm group-hover:text-[#D4AF37] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ENG COMPLIANCE */}
      <section className="py-24 px-6 border-b border-[#D4AF37]/8">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="border border-[#D4AF37]/18 rounded-3xl p-8 md:p-14 bg-gradient-to-br from-[#0A1F14]/75 to-[#040D08] flex flex-col md:flex-row gap-12 items-start relative overflow-hidden shadow-2xl shadow-black/55">
              <div
                aria-hidden
                className="absolute top-0 right-0 w-56 h-56 bg-[#D4AF37]/4 rounded-full blur-3xl pointer-events-none"
              />
              <div className="flex-1 relative">
                <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
                  Regulation compliance
                </p>
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                  Every ENG rule, correctly applied
                </h2>
                <p className="text-white/48 text-sm leading-relaxed mb-7">
                  {branding.devName} implements ENG.10 through ENG.27 —
                  supplementary thresholds, stayout decisions, carry-forward
                  limits, 10-year BSc and 8-year BEd duration caps, and deferred
                  unit handling. The engine doesn&apos;t guess; it calculates.
                </p>
                <div className="flex flex-wrap gap-2">
                  {REGULATION_TAGS.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs border border-[#D4AF37]/22 text-[#D4AF37]/68 px-3 py-1 rounded-full bg-[#D4AF37]/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-80 flex-shrink-0">
                <TerminalBlock />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PRICING */}
      {/* <section
        id="pricing"
        className="py-24 px-6 border-b border-[#D4AF37]/8 bg-[#050C07]/50"
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Simple, transparent pricing
            </h2>
            <p className="text-white/38 mt-3 text-sm">
              All plans include the full feature set. Start with a 30-day pilot
              at no cost.
            </p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan, idx) => (
              <FadeIn key={plan.name} delay={idx * 0.08}>
                <motion.div
                  whileHover={rm ? {} : { y: -5, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <GlowCard
                    highlight={plan.highlight}
                    className={`h-full rounded-2xl p-8 flex flex-col border transition-all duration-300 ${plan.highlight ? "border-[#D4AF37]/48 shadow-xl shadow-[#D4AF37]/8" : "border-[#D4AF37]/14"}`}
                  >
                    {plan.highlight && (
                      <div className="text-[10px] font-bold text-[#040D08] bg-[#D4AF37] px-3 py-1 rounded-full self-start mb-4 tracking-widest uppercase">
                        Most popular
                      </div>
                    )}
                    <div className="text-sm font-medium text-white/58 mb-1">
                      {plan.name}
                    </div>
                    <div className="text-4xl font-serif font-bold text-[#D4AF37] mb-0.5">
                      {plan.price}
                    </div>
                    <div className="text-xs text-white/28 mb-1">{plan.per}</div>
                    <div className="text-xs text-[#D4AF37]/58 font-semibold mb-7 pb-7 border-b border-[#D4AF37]/10">
                      {plan.students}
                    </div>
                    <ul className="space-y-3 flex-1 mb-8">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2.5 text-sm text-white/58"
                        >
                          <div className="w-4 h-4 rounded-full border border-[#D4AF37]/32 flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/62" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={plan.href}
                      className={`text-center text-sm font-bold py-3.5 rounded-xl transition-all duration-200 ${plan.highlight ? "bg-[#D4AF37] text-[#040D08] hover:bg-[#F0D264] shadow-lg shadow-[#D4AF37]/18" : "border border-[#D4AF37]/28 text-[#D4AF37] hover:bg-[#D4AF37]/8 hover:border-[#D4AF37]/52"}`}
                    >
                      {plan.cta}
                    </Link>
                  </GlowCard>
                </motion.div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="mt-8 text-center">
            <p className="text-xs text-white/20">
              All prices in Kenyan Shillings · Overage at KES 5/student · Annual
              billing: 2 months free · 30-day pilot available
            </p>
          </FadeIn>
        </div>
      </section> */}

      {/* FAQ */}
      <section className="py-24 px-6 border-b border-[#D4AF37]/8">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="mb-12 text-center">
            <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
              Common questions
            </p>
            <h2 className="text-3xl font-serif font-bold">
              Questions from registrars
            </h2>
            <p className="text-white/38 mt-3 text-sm">
              The questions your procurement team and IT department will ask —
              answered upfront.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="border border-[#D4AF37]/12 rounded-2xl bg-[#0A1F16]/35 px-7">
              {FAQS.map((faq, idx) => (
                <FAQItem
                  key={faq.q}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFaqIndex === idx}
                  onToggle={() =>
                    setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                  }
                />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* BLOG */}
      <section
        id="blog"
        className="py-24 px-6 border-b border-[#D4AF37]/8 bg-[#050C07]/50"
      >
        <div className="max-w-6xl mx-auto">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs tracking-widest text-[#D4AF37] uppercase mb-3 font-medium">
                From the blog
              </p>
              <h2 className="text-3xl font-serif font-bold">
                Academic regulation, explained
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm text-[#D4AF37]/48 hover:text-[#D4AF37] transition-colors whitespace-nowrap font-medium group flex items-center gap-1"
            >
              View all posts{" "}
              <span className="group-hover:translate-x-1 transition-transform inline-block">
                →
              </span>
            </Link>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BLOG_POSTS.map((post, idx) => (
              <FadeIn key={post.slug} delay={idx * 0.07}>
                <motion.div
                  whileHover={rm ? {} : { y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <GlowCard className="h-full border border-[#D4AF37]/11 rounded-2xl p-7 hover:border-[#D4AF37]/32 transition-all duration-300 group">
                    <Link href={`/blog/${post.slug}`} className="block h-full">
                      <div className="text-[10px] text-[#D4AF37]/65 font-bold mb-4 uppercase tracking-wider">
                        {post.tag}
                      </div>
                      <h3 className="font-semibold text-white text-sm leading-snug mb-3 group-hover:text-[#D4AF37] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-white/34 leading-relaxed mb-5">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/20">{post.date}</div>
                        <div className="text-xs text-[#D4AF37]/42 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all">
                          Read →
                        </div>
                      </div>
                    </Link>
                  </GlowCard>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_52%_52%_at_50%_50%,rgba(12,38,18,0.45),transparent)] pointer-events-none"
        />
        {!rm && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {[16, 30, 44, 58, 72, 86].map((left, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#D4AF37]/16"
                style={{ left: `${left}%`, top: `${20 + (i % 3) * 28}%` }}
                animate={{ y: [-8, 8, -8], opacity: [0.16, 0.48, 0.16] }}
                transition={{
                  duration: 3.5 + i * 0.4,
                  repeat: Infinity,
                  delay: i * 0.35,
                }}
              />
            ))}
          </div>
        )}
        <div className="max-w-3xl mx-auto text-center relative">
          <FadeIn>
            <div
              aria-hidden
              className="w-px h-14 bg-gradient-to-b from-[#D4AF37]/28 to-transparent mx-auto mb-12"
            />
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-5 leading-tight">
              Ready to run your first
              <br />
              automated promotion cycle?
            </h2>
            <p className="text-white/40 text-sm mb-12 leading-relaxed max-w-md mx-auto">
              Book a 30-minute demo. We&apos;ll walk through a live promotion
              cycle using your institution&apos;s actual regulations. No
              commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center bg-[#D4AF37] text-[#040D08] font-bold px-10 py-4 rounded-xl hover:bg-[#F0D264] transition-colors text-sm shadow-2xl shadow-[#D4AF37]/22"
              >
                Book a free demo
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center border border-[#D4AF37]/24 text-[#D4AF37]/72 px-10 py-4 rounded-xl hover:bg-[#D4AF37]/8 hover:text-[#D4AF37] hover:border-[#D4AF37]/48 transition-all text-sm"
              >
                Start 30-day pilot
              </Link>
            </div>
            <p className="text-white/20 text-xs mt-7">
              Or email us:{" "}
              <a
                href="mailto:newtsolhub@gmail.com"
                className="text-[#D4AF37]/48 hover:text-[#D4AF37] transition-colors underline underline-offset-2"
              >
                newtsolhub@gmail.com
              </a>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D4AF37]/8 py-10 px-6 bg-[#030A05]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 bg-[#D4AF37]/14 rounded-full blur-sm"
              />
              <Image
                src={branding.logoIcon}
                alt={branding.devName}
                width={28}
                height={28}
                className="relative"
              />
            </div>
            <span className="text-sm font-serif text-[#D4AF37] font-bold">
              {branding.devName}
            </span>
            <span className="text-white/16 text-sm">by</span>
            <Image
              src="/newtsolhubLogo.png"
              alt="newtsolhub"
              width={28}
              height={22}
              className="opacity-32 hover:opacity-65 transition-opacity"
            />
          </div>
          <div className="flex items-center gap-6">
            {sidebarItems.map((link) => (
              <Link
                key={link}
                href={link === "Sign in" ? "/login" : `#${link.toLowerCase()}`}
                className="text-xs text-white/26 hover:text-white/58 transition-colors font-medium"
              >
                {link}
              </Link>
            ))}
          </div>
          <p className="text-xs text-white/16">
            © {new Date().getFullYear()} {branding.devCom}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}