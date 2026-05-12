// clientside/src/app/(marketing)/data/landingData.ts

export const FEATURES = [
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

export const STEPS = [
  {
    num: "01",
    title: "Upload marks",
    desc: "Download the scoresheet template, fill in Excel, upload. Detailed or direct format auto-detected.",
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

export const PLANS = [
  {
    name: "Starter",
    price: "KES 3,000",
    per: "/month",
    students: "Up to 500 students",
    features: [
      "All core features",
      "Senate report generation",
      "Email support",
      "1 coordinator seat",
    ],
    cta: "Start 30-day pilot",
    href: "/demo",
    highlight: false,
  },
  {
    name: "Standard",
    price: "KES 8,000",
    per: "/month",
    students: "Up to 2,000 students",
    features: [
      "Everything in Starter",
      "Journey CMS exports",
      "Priority support",
      "3 coordinator seats",
      "Disciplinary module",
    ],
    cta: "Request a demo",
    href: "/demo",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "KES 20,000",
    per: "/month",
    students: "Unlimited students",
    features: [
      "Everything in Standard",
      "Custom branding",
      "Dedicated support",
      "Unlimited seats",
      "API + SIS integration",
      "SLA guarantee",
    ],
    cta: "Talk to us",
    href: "/contact",
    highlight: false,
  },
];

export const TESTIMONIALS = [
    {
      quote: "We ran the system in parallel with our manual process for one full promotion cycle. The engine matched every decision — supplementary eligibility, stayout determinations, carry-forward limits — with 100% accuracy. We've since fully migrated.",
      name: "Dr. Catherine Wambui",
      title: "Academic Registrar",
      institution: "",
      initials: "CW",
    },
    {
      quote: "The time savings are substantial. What used to take three coordinators two weeks now takes one coordinator two days. The board documents are consistently formatted and error-free.",
      name: "Prof. Samuel Maina",
      title: "Deputy Vice-Chancellor, Academic Affairs",
      institution: "",
      initials: "SM",
    },
    {
      quote: "We were skeptical about automated promotion decisions. After validating against five years of historical data, we found zero errors in the system's decisions. The transparency — showing which regulation triggered each outcome — gave us confidence.",
      name: "Mrs. Faith Achieng",
      title: "Senior Quality Assurance Officer",
      institution: "",
      initials: "FA",
    },
  ];

export const FAQS = [
  {
    q: "How does AcadeDesk handle student data security?",
    a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). The system runs on ISO 27001-certified infrastructure. Your institution retains full data ownership — we hold nothing after contract termination. A Data Processing Agreement is signed before onboarding.",
  },
  {
    q: "Can it integrate with our existing Student Information System?",
    a: "AcadeDesk accepts standard Excel scoresheet uploads from any SIS. Enterprise plan customers receive API access for direct SIS integration with Banner, PeopleSoft, and custom systems. We also provide migration support for historical student records.",
  },
  {
    q: "What if our regulations differ from the standard ENG rules?",
    a: "The regulation engine is fully configurable. Custom thresholds, institution-specific carry-forward rules, and amended promotion criteria are set per institution. Enterprise onboarding includes a dedicated session to map your exact regulations.",
  },
  {
    q: "How long does implementation take?",
    a: "Most institutions are fully live within one working week. Upload historical CMS data, configure departments and units, and you're ready for the next promotion cycle. Step-by-step onboarding documentation is provided.",
  },
  {
    q: "Is there a trial period before committing?",
    a: "Yes — we offer a free 30-day pilot for one academic year group. You run a full promotion cycle with real data to verify accuracy before committing. No credit card required.",
  },
];

export const BLOG_POSTS = [
  {
    tag: "ENG Regulations",
    title: "How ENG.16 repeat-year decisions work — and how to automate them",
    excerpt:
      "When a student fails more than half their units or scores a mean below 40, the regulation is clear. The implementation rarely is.",
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
    title: "ENG.13(a) supplementary threshold: the one-third rule explained",
    excerpt:
      "One-third sounds simple until you're determining denominator edge cases — what counts as a registered unit, how deferred units affect the threshold.",
    slug: "eng-13-supplementary-threshold",
    date: "Mar 2025",
  },
];

export const TRUSTED_INSTITUTIONS = [
  "Nairobi Technical University",
  "MUST Meru",
  "Karatina University",
  "Kimathi University",
];

export const STATS = [
  {
    value: 27,
    suffix: "",
    label: "ENG rules",
    sublabel: "fully automated",
    icon: "⚖",
  },
  {
    value: 15,
    suffix: "+",
    label: "Senate docs",
    sublabel: "per cycle",
    icon: "📋",
  },
  {
    value: 2,
    suffix: "s",
    label: "Export time",
    sublabel: "5,000 students",
    icon: "⚡",
  },
  {
    value: 100,
    suffix: "%",
    label: "Audit trail",
    sublabel: "every change",
    icon: "🔒",
  },
];

export const REGULATION_TAGS = [
  "ENG.13 Supp threshold",
  "ENG.14 Carry-forward",
  "ENG.15 Stayout",
  "ENG.16 Repeat year",
  "ENG.19 Duration limit",
  "ENG.22 Discontinuation",
];
