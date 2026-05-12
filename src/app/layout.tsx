
// clientside/src/app/layout.tsx — ROOT SERVER COMPONENT

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./global.css";
import { branding } from "@/config/branding";
import { config } from "@/config/config";
import Providers from "./providers";

const APP_NAME = branding.devName;
const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://acadedesk.com";
const APP_DESC =
  "AcadeDesk automates academic progression for institutions of higher education — " +
  "senate reports, supplementary tracking, exam rules regulation compliance, " +
  "carry-forward units, and student promotion. It is an automated exam management system Built by newtsolhub.";

  // Google Analytics ID from environment
const GA_MEASUREMENT_ID = config.ga4Id;

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  themeColor:   "#0A1F16",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: `${APP_NAME} — Academic Progression System`,
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

  authors: [{ name: "newtsolhub", url: "https://newtsolhub.com" }],
  creator: "newtsolhub",
  publisher: "newtsolhub",

  alternates: { canonical: APP_URL },

  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Academic Progression System`,
    description: APP_DESC,
    locale: "en_KE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AcadeDesk — Academic Progression System",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Academic Progression System`,
    description: APP_DESC,
    images: ["/og-image.png"],
    creator: "@newtsolhub",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/ll.png", sizes: "16x16", type: "image/png" },
      { url: "/ll.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.json",

  // Default: don't index internal app pages.
  // Individual public pages override this with index: true.
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics - only if measurement ID exists */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen bg-[#F8F9FA] text-gray-900 transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}