// clientside/src/app/(marketing)/blog/page.tsx
// Blog index — fully indexed, lists all posts

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { branding } from "@/config/branding";


export const metadata: Metadata = {
  title: "Blog — ENG Regulations, Senate Reports & Academic Automation",
  description:
    "In-depth guides on ENG academic regulations, senate report automation, " +
    "supplementary exam workflows, and university academic progression. " +
    "By the AcadeDesk team at newtsolhub.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://acadedesk.com"}/blog`,
  },
};

const POSTS = [
  {
    slug: "eng-16-repeat-year-automation",
    tag: "ENG Regulations",
    title: "How ENG.16 repeat-year decisions work — and how to automate them",
    excerpt:
      "When a student fails more than half their units or scores a mean below 40, the regulation is clear. The implementation rarely is. Here's the complete decision tree and why the mean threshold matters as much as the unit count.",
    date: "15 January 2025",
    readTime: "8 min read",
  },
  {
    slug: "senate-report-automation-guide",
    tag: "Senate Reports",
    title:
      "What goes into a senate report and why it takes coordinators 3 days",
    excerpt:
      "Every promotion cycle ends with the same bottleneck — assembling the Senate documents. We break down every document in the set, what it must contain, and exactly what can be automated.",
    date: "10 February 2025",
    readTime: "11 min read",
  },
  {
    slug: "eng-13-supplementary-threshold",
    tag: "Supplementary Exams",
    title: "ENG.13(a) supplementary threshold: the one-third rule explained",
    excerpt:
      "One-third sounds simple until you determine the denominator — what counts as a registered unit, how deferred units affect the threshold, and why hardcoding 5 is wrong for any program with fewer than 15 units.",
    date: "5 March 2025",
    readTime: "7 min read",
  },
  {
    slug: "carry-forward-units-explained",
    tag: "ENG Regulations",
    title:
      "Carry-forward units under ENG.14: limits, qualifiers, and edge cases",
    excerpt:
      "ENG.14 allows students to carry forward up to 2 failed units. In practice, the rules around missing CA, the RP1C/RP2C qualifier system, and escalation to RPU create a complex decision tree.",
    date: "1 April 2025",
    readTime: "9 min read",
  },
  {
    slug: "board-of-examiners-cms-export",
    tag: "Reporting",
    title:
      "The Board of Examiners CMS: what it is and how to build one that doesn't break",
    excerpt:
      "The multi-year Journey CMS should give the board a complete picture of every student's academic history. Here's what columns it must include, common errors in manually built sheets, and how to automate it reliably.",
    date: "20 April 2025",
    readTime: "10 min read",
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-[#0A1F16] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/20 bg-[#0A1F16]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src={branding.logoIcon} alt={branding.devName} width={32} height={32} />
            <span className="font-serif text-lg font-bold text-[#D4AF37]">
              {branding.devName}
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm bg-[#D4AF37] text-[#0A1F16] font-semibold px-5 py-2 rounded-md hover:bg-[#F0D264] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-16">
          <div className="w-1 h-12 bg-[#D4AF37] mb-6" />
          <h1 className="text-4xl font-serif font-bold mb-4">
            Academic regulation, explained
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xl">
            In-depth guides on ENG regulations, senate report workflows, and
            university academic progression. Written by engineers who built the
            automation.
          </p>
        </div>

        {/* Posts */}
        <div className="divide-y divide-[#D4AF37]/10">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block py-10 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-wide">
                  {post.tag}
                </span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-white/30 text-xs">{post.date}</span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-white/30 text-xs">{post.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-[#D4AF37] transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>
              <div className="mt-4 text-xs text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors">
                Read article →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#D4AF37]/10 py-8 px-6 text-center">
        <p className="text-xs text-white/20">
          © {new Date().getFullYear()} {branding.devCom} · {branding.devName}
        </p>
      </footer>
    </div>
  );
}
