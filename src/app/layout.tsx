
// // clientside/src/app/layout.tsx — server component (no "use client")
// import type { Metadata } from "next";
// import "./global.css";
// import { branding } from "@/config/branding";
// import Providers from "./providers";          // NEW — see below

// export const metadata: Metadata = {
//   title:       branding.devName,
//   description: branding.tagLine,
//   icons: { icon: "/Logo.png" },
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className="min-h-screen bg-[#F8F9FA] text-gray-900 transition-colors duration-300">
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }



// // clientside/src/app/layout.tsx
// import type { Metadata } from "next";
// import "./global.css";
// import { branding } from "@/config/branding";
// import Providers from "./providers";

// // ── Choose one and replace throughout ────────────────────────────────────────
// // Replace "SenateDesk" with whichever name you choose.
// // Replace the description with what makes your system distinct from generic EMS.

// const APP_NAME        = branding.devName;
// const APP_URL         = process.env.NEXT_PUBLIC_APP_URL ?? "https://senatedesk.com";
// const APP_DESCRIPTION =
//   "Academic progression management built for Engineering schools. " +
//   "or Universities"+
//   "Automates senate reports, supplementary tracking, carry-forward units, " +
//   "and ENG regulation compliance — from marks upload to board of examiners,"+
//   "basically an automated exam management system";

// export const metadata: Metadata = {
//   // ── Core ───────────────────────────────────────────────────────────────────
//   metadataBase: new URL(APP_URL),
//   title: {
//     default:  `${APP_NAME} — Engineering Academic Progression System`,
//     template: `%s | ${APP_NAME}`,   // page titles become "Students | SenateDesk"
//   },
//   description: APP_DESCRIPTION,

//   // ── Keywords (secondary signal — Google uses them weakly, Bing uses them) ──
//   keywords: [
//     "academic progression system",
//     "engineering school EMS",
//     "senate report automation",
//     "supplementary exam management",
//     "university marks management Kenya",
//     "ENG regulation compliance software",
//     "board of examiners software",
//     "student promotion system university",
//     "carry forward units software",
//   ],

//   // ── Authorship & Ownership ─────────────────────────────────────────────────
//   authors:   [{ name: "SenateDesk", url: APP_URL }],
//   creator:   "SenateDesk",
//   publisher: "SenateDesk",

//   // ── Canonical URL (prevents duplicate content penalties) ──────────────────
//   alternates: {
//     canonical: APP_URL,
//   },

//   // ── Open Graph (Facebook, LinkedIn, WhatsApp previews) ────────────────────
//   openGraph: {
//     type:        "website",
//     url:          APP_URL,
//     siteName:     APP_NAME,
//     title:       `${APP_NAME} — Engineering Academic Progression System`,
//     description:  APP_DESCRIPTION,
//     images: [
//       {
//         url:    "/og-image.png",    // 1200×630px — create this (see Step 3)
//         width:  1200,
//         height: 630,
//         alt:    `${APP_NAME} dashboard showing student progression and senate reports`,
//       },
//     ],
//     locale: "en_KE",               // Kenya English — signals local relevance
//   },

//   // ── Twitter / X card ──────────────────────────────────────────────────────
//   twitter: {
//     card:        "summary_large_image",
//     title:       `${APP_NAME} — Engineering Academic Progression System`,
//     description:  APP_DESCRIPTION,
//     images:      ["/og-image.png"],
//   },

//   // ── Icons ─────────────────────────────────────────────────────────────────
//   icons: {
//     icon:        [
//       { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
//       { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
//     ],
//     apple:       "/apple-touch-icon.png",  // 180×180px
//     shortcut:    "/favicon.ico",
//   },

//   // ── Web App manifest (enables "Add to Home Screen" on mobile) ────────────
//   manifest: "/manifest.json",

//   // ── Robots ────────────────────────────────────────────────────────────────
//   // For a private SaaS (login-walled): noindex everything except the landing page.
//   // The landing page has its own metadata override — see Step 2.
//   robots: {
//     index:              false,  // default: don't index internal app pages
//     follow:             false,
//     googleBot: {
//       index:            false,
//       follow:           false,
//     },
//   },
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className="min-h-screen bg-[#F8F9FA] text-gray-900 transition-colors duration-300">
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }





// clientside/src/app/layout.tsx — ROOT SERVER COMPONENT
// No "use client" — metadata export only works in server components.
// Sidebar/Navbar moved to (app)/layout.tsx.

import type { Metadata, Viewport } from "next";
import "./global.css";
import { branding } from "@/config/branding";
import Providers from "./providers";

const APP_NAME = branding.devName;
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://acadedesk.com";
const APP_DESC =
  "AcadeDesk automates academic progression for engineering schools — " +
  "senate reports, supplementary tracking, ENG regulation compliance, " +
  "carry-forward units, and student promotion. Built by newtsolhub.";

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#0A1F16",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default:  `${APP_NAME} — Academic Progression System`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESC,

  keywords: [
    "academic progression system",
    "engineering school exam management",
    "senate report automation",
    "supplementary exam tracking Kenya",
    "university marks management",
    "ENG regulation compliance software",
    "board of examiners software",
    "student promotion system",
    "carry forward units",
    "AcadeDesk",
    "newtsolhub",
  ],

  authors:   [{ name: "newtsolhub", url: "https://newtsolhub.com" }],
  creator:   "newtsolhub",
  publisher: "newtsolhub",

  alternates: { canonical: APP_URL },

  openGraph: {
    type:        "website",
    url:          APP_URL,
    siteName:     APP_NAME,
    title:       `${APP_NAME} — Academic Progression System`,
    description:  APP_DESC,
    locale:       "en_KE",
    images: [{
      url:    "/og-image.png",
      width:  1200,
      height: 630,
      alt:    "AcadeDesk — Academic Progression System",
    }],
  },

  twitter: {
    card:        "summary_large_image",
    title:       `${APP_NAME} — Academic Progression System`,
    description:  APP_DESC,
    images:      ["/og-image.png"],
    creator:     "@newtsolhub",
  },

  icons: {
    icon: [
      { url: "/ll.png", sizes: "16x16", type: "image/png" },
      { url: "/ll.png", sizes: "32x32", type: "image/png" },
    ],
    apple:   "/apple-touch-icon.png",
    shortcut:"/favicon.ico",
  },

  manifest: "/manifest.json",

  // Default: don't index internal app pages.
  // Individual public pages override this with index: true.
  robots: {
    index:  false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F8F9FA] text-gray-900 transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}