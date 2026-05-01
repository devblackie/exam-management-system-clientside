// // clientside/src/app/page.tsx
// "use client";

// import type { Metadata } from "next";
// import Image from "next/image";
// import { branding } from "@/config/branding";
// import { motion } from "framer-motion";

// export const metadata: Metadata = {
//   title:       "Engineering Academic Progression Software",  // fills %s in template
//   description:
//     "SenateDesk automates student promotion, senate reports, supplementary tracking, " +
//     "and ENG regulation compliance for university engineering schools.",
//   robots: {
//     index:  true,   // ← override: this page IS indexed
//     follow: true,
//   },
//   alternates: {
//     canonical: "https://senatedesk.com",
//   },
// };


// export default function Home() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-green-darkest">
//       <motion.div
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="flex flex-col items-center"
//       >
//         <motion.div
//           animate={{ rotateY: 360 }}
//           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//         >
//           <Image
//             src={branding.institutionLogo}
//             alt="Logo"
//             width={120}
//             height={120}
//             priority
//           />
//         </motion.div>
        
//         <h1 className="mt-6 text-2xl font-bold text-yellow-gold tracking-widest uppercase">
//           {branding.appName}
//         </h1>
//               <motion.p
//         className="mt-2 text-sm text-yellow-gold/70"
//          initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.5 }}
//       >
//         Initializing dashboard...       </motion.p>

//         <div className="mt-4 w-12 h-1 bg-yellow-gold/30 rounded-full overflow-hidden">
//           <motion.div 
//             className="h-full bg-yellow-gold"
//             animate={{ x: [-50, 50] }}
//             transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
//           />
//         </div>
//       </motion.div>
//     </div>
//   );
// }


// clientside/src/app/(marketing)/page.tsx
//
// PUBLIC LANDING PAGE — fully indexed by Google
// This is a SERVER component — no "use client", metadata works here.
// Framer Motion animations use a client sub-component (LandingClient).
//
// Route group "(marketing)" keeps this layout separate from the app layout
// so Sidebar and Navbar do NOT render on the landing page.

import type { Metadata } from "next";
import LandingClient from "./LandingClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://senatedesk.com";

export const metadata: Metadata = {
  title: "Academic Progression Software — SenateDesk",
  description:
    "SenateDesk automates student promotion, senate reports, supplementary " +
    "tracking, carry-forward units, and ENG regulation compliance for " +
    "university engineering schools. Built for coordinators, designed for accuracy.",
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
  openGraph: {
    title:       "SenateDesk — Engineering Academic Progression System",
    description: "Automates senate reports, supplementary tracking, and ENG regulation compliance.",
    url:          APP_URL,
    images:      [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function LandingPage() {
  // JSON-LD structured data — rendered server-side, picked up by crawlers
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SenateDesk",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description:
      "Academic progression management for engineering schools. Automates " +
      "senate reports, supplementary tracking, carry-forward units, and " +
      "ENG regulation compliance.",
    url: APP_URL,
    author: {
      "@type":  "Organization",
      name:     "newtsolhub",
      url:      "https://newtsolhub.com",
    },
    offers: {
      "@type":         "Offer",
      price:           "3000",
      priceCurrency:   "KES",
      priceValidUntil: "2026-12-31",
    },
    featureList: [
      "Automated senate report generation",
      "Supplementary exam tracking",
      "ENG regulation compliance (ENG.13–ENG.26)",
      "Student promotion engine",
      "Carry-forward unit management",
      "Disciplinary case management",
      "Board of examiners CMS export",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingClient />
    </>
  );
}