// clientside/src/app/(marketing)/blog/eng-16-repeat-year-automation/page.tsx
//
// This is the highest-leverage SEO content piece.
// No competitor has published this. It targets a specific, low-competition,
// high-intent keyword: "ENG.16 repeat year university Kenya".

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { branding } from "@/config/branding";


const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://acadedesk.com";
const SLUG = "eng-16-repeat-year-automation";
const TITLE =
  "How ENG.16 Repeat-Year Decisions Work — and How to Automate Them";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "ENG.16 requires a student to repeat a year if they fail 50% or more of their " +
    "units OR score a mean below 40. This guide explains the full decision tree, " +
    "edge cases, and how to implement it correctly in software.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE}/blog/${SLUG}` },
  openGraph: {
    title: TITLE,
    description:
      "Complete guide to ENG.16 repeat year decisions for engineering schools.",
    url: `${BASE}/blog/${SLUG}`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "article",
  },
};

// JSON-LD Article structured data — Google uses this for rich results
function ArticleJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description:
      "ENG.16 repeat year decision tree — thresholds, mean mark rules, and automation.",
    author: {
      "@type": "Organization",
      name: "newtsolhub",
      url: "https://newtsolhub.com",
    },
    publisher: {
      "@type": "Organization",
      name: "newtsolhub",
      logo: { "@type": "ImageObject", url: `${BASE}/newtsolhubLogo.png` },
    },
    datePublished: "2025-01-15",
    dateModified: "2025-01-15",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/blog/${SLUG}` },
    image: `${BASE}/og-image.png`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ENG16Post() {
  return (
    <div className="min-h-screen bg-[#0A1F16] text-white">
      <ArticleJsonLd />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/20 bg-[#0A1F16]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src={branding.logoIcon} alt={branding.devName} width={32} height={32} />
            <span className="font-serif text-lg font-bold text-[#D4AF37]">
              {branding.devName}
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              ← Blog
            </Link>
            <Link
              href="/login"
              className="text-sm bg-[#D4AF37] text-[#0A1F16] font-semibold px-5 py-2 rounded-md"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-wide">
              ENG Regulations
            </span>
            <span className="text-white/20">·</span>
            <time className="text-xs text-white/30" dateTime="2025-01-15">
              15 January 2025
            </time>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/30">8 min read</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-6">
            How ENG.16 repeat-year decisions work — and how to automate them
          </h1>

          <p className="text-white/60 text-lg leading-relaxed border-l-2 border-[#D4AF37]/40 pl-5">
            When a student fails more than half their units or scores a mean
            below 40, the regulation is clear. The implementation rarely is.
          </p>
        </header>

        {/* Body */}
        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              What ENG.16 actually says
            </h2>
            <p>
              ENG.16(a) states that a student shall repeat a year of study if
              they fail 50% or more of the units they were registered for in
              that academic year. ENG.16(b) adds a parallel condition: a student
              shall also repeat if their annual mean mark falls below 40,
              regardless of how many units they failed.
            </p>
            <p className="mt-4">
              These are two independent triggers. A student who fails 3 out of
              10 units (30% — below the 50% threshold) but scores an overall
              mean of 38 still repeats. A student who fails 5 out of 10 units
              (exactly 50%) also repeats.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              The complete decision tree
            </h2>
            <p>
              In priority order — each condition is evaluated before the next:
            </p>

            <div className="my-6 rounded-xl overflow-hidden border border-[#D4AF37]/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#123828] text-[#D4AF37]">
                    <th className="text-left px-4 py-3 font-semibold">
                      Condition
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Rule</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Outcome
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/10">
                  {[
                    ["fail ≥ 50% of units", "ENG.16(a)", "REPEAT YEAR"],
                    ["annual mean < 40", "ENG.16(b)", "REPEAT YEAR"],
                    ["fail > ⅓ of units", "ENG.15(h)", "STAYOUT"],
                    ["fail ≤ ⅓ of units", "ENG.13(a)", "SUPPLEMENTARY"],
                    ["all units passed", "ENG.10(b)", "PROMOTED"],
                  ].map(([cond, rule, outcome]) => (
                    <tr key={rule} className="bg-[#0A1F16]/60">
                      <td className="px-4 py-3 font-mono text-xs text-white/60">
                        {cond}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#D4AF37]/70">
                        {rule}
                      </td>
                      <td
                        className={`px-4 py-3 text-xs font-semibold ${
                          outcome === "REPEAT YEAR"
                            ? "text-red-400"
                            : outcome === "STAYOUT"
                              ? "text-amber-400"
                              : outcome === "SUPPLEMENTARY"
                                ? "text-yellow-300"
                                : "text-green-400"
                        }`}
                      >
                        {outcome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              Why coordinators get this wrong
            </h2>
            <p>
              The most common implementation error is hardcoding the fail
              threshold as a fixed number — typically 5 — instead of calculating
              it dynamically as a fraction of registered units. A student in a
              6-unit semester has a threshold of 2 units (⅓ of 6). A student in
              a 12-unit year has a threshold of 4 (⅓ of 12). Using 5 as the
              cutoff gives wrong results for both.
            </p>
            <p className="mt-4">
              The second common error is applying the mean threshold to the
              wrong set of marks. The annual mean should be calculated from all
              registered units, not just the units the student sat. If a student
              was registered for a unit but did not sit the exam (missing CA,
              for example), that unit still counts toward the denominator.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              Deferred units and the ENG.13(b)/18(c) complication
            </h2>
            <p>
              ENG.13(b) and ENG.18(c) allow a student to defer a supplementary
              examination to the next ordinary examination period. When a
              student has deferred supp units, the status engine must treat them
              differently: the student can be promoted (conditionally) without
              having cleared those units. The deferred units are tracked
              separately and resolved at the next ordinary exam, not the next
              supplementary period.
            </p>
            <p className="mt-4">
              This means the promotion decision must check two unit lists: the
              current year&apos;s results, and the deferred supp unit list from
              a prior year. If pending deferred units exist, the promotion is
              valid but the units remain on the student&apos;s record with a
              &quot;pending&quot; status.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              Correct implementation in TypeScript
            </h2>

            <div className="rounded-xl bg-[#0A1F16] border border-[#D4AF37]/20 p-5 font-mono text-xs overflow-x-auto">
              <div className="text-[#D4AF37]/50 mb-3">
                {/* // statusEngine.ts — ENG.16 decision */}
              </div>
              <pre className="text-white/70 whitespace-pre">{`const totalRegistered = units.length;
const suppThreshold   = totalRegistered / 3;    // ENG.13(a)
const repeatThreshold = totalRegistered / 2;    // ENG.16(a)
const annualMean      = calcWeightedMean(marks); // ENG.16(b)

// ENG.16 — both conditions are independent triggers
if (failCount >= repeatThreshold || annualMean < 40) {
  return "REPEAT_YEAR";
}

// ENG.15(h) — stayout
if (failCount > suppThreshold) {
  return "STAYOUT";
}

// ENG.13(a) — supplementary
if (failCount > 0) {
  return "SUPPLEMENTARY";
}

return "PROMOTED";`}</pre>
            </div>

            <p className="mt-4">
              Note that{" "}
              <code className="text-[#D4AF37] bg-[#123828] px-1 rounded text-xs">
                repeatThreshold
              </code>{" "}
              uses division, not an integer. A student with 10 units has a
              threshold of 5.0 — failing exactly 5 units means{" "}
              <code className="text-[#D4AF37] bg-[#123828] px-1 rounded text-xs">
                failCount {">="} 5.0
              </code>{" "}
              is true, so they repeat. This matches the regulation&apos;s
              &quot;50% or more.&quot;
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              Summary
            </h2>
            <ul className="space-y-2 list-none">
              {[
                "ENG.16 has two independent triggers — fail count AND mean mark",
                "Both thresholds are fractions of registered units, never fixed numbers",
                "Deferred supp units must be resolved separately from current year results",
                "The annual mean uses all registered units as the denominator",
                "Missing CA marks zero-out that unit's contribution to the mean",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5 flex-shrink-0">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <div className="mt-12 border border-[#D4AF37]/30 rounded-xl p-8 text-center bg-[#123828]/30">
            <p className="text-[#D4AF37] font-serif font-bold text-lg mb-3">
              {branding.devName} implements all of this automatically
            </p>
            <p className="text-white/50 text-sm mb-6">
              Dynamic thresholds, deferred unit handling, mean mark calculation
              — all built in. No manual rule lookups for coordinators.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A1F16] font-bold px-8 py-3 rounded-md hover:bg-[#F0D264] transition-colors text-sm"
            >
              Request a demo
            </Link>
          </div>
        </div>

        {/* Author */}
        <footer className="mt-16 pt-8 border-t border-[#D4AF37]/10 flex items-center gap-4">
          <Image
            src="/newtsolhubLogo.png"
            alt="newtsolhub"
            width={100}
            height={24}
            className="opacity-60"
          />
          <div>
            <p className="text-xs text-white/30">Published by {branding.devCom}</p>
            <p className="text-xs text-white/20">Builders of {branding.devName}</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
