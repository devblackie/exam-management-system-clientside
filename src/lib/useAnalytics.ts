// clientside/src/lib/useAnalytics.ts
//
// WHAT THIS IS
// ─────────────────────────────────────────────────────────────────────────────
// A zero-dependency analytics wrapper. Fires GA4 events when the gtag script
// is present, and Plausible events when the Plausible script is present.
// If neither is loaded (dev/localhost), it logs to the console only.
//
// WHY A WRAPPER AND NOT DIRECT GTAG CALLS
// ─────────────────────────────────────────────────────────────────────────────
// 1. Type safety — window.gtag is untyped by default. This wrapper types it.
// 2. Fail-safe — never crashes if scripts haven't loaded yet.
// 3. Single place to swap analytics providers later.
// 4. Easy to mock in tests.
//
// SETUP — add to your Next.js layout.tsx <head>:
//
// GA4 (replace G-XXXXXXXXXX with your measurement ID):
//   <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
//   <Script id="ga4-init" strategy="afterInteractive">{`
//     window.dataLayer = window.dataLayer || [];
//     function gtag(){dataLayer.push(arguments);}
//     gtag('js', new Date());
//     gtag('config', 'G-XXXXXXXXXX');
//   `}</Script>
//
// Plausible (replace yourdomain.co.ke):
//   <Script defer data-domain="yourdomain.co.ke" src="https://plausible.io/js/script.js" />
//
// Both can run simultaneously — this wrapper fires both.
//
// EVENTS TRACKED ON THE DEMO PAGE
// ─────────────────────────────────────────────────────────────────────────────
//   demo_email_gate_shown   — email modal appeared
//   demo_email_submitted    — user submitted work email
//   demo_screen_switched    — user clicked a tab (which feature they want first)
//   demo_cms_download       — user clicked the CMS download button
//   demo_talk_to_team       — "Talk to our team" button clicked (peak interest)
//   get_started_clicked     — nav CTA clicked
//   signup_form_submitted   — pilot request form submitted

// ── Types ──────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (
      event: string,
      opts?: { props?: Record<string, string | number | boolean> },
    ) => void;
    dataLayer?: unknown[];
  }
}

export type AnalyticsEvent =
  | "demo_email_gate_shown"
  | "demo_email_submitted"
  | "demo_screen_switched"
  | "demo_cms_download"
  | "demo_talk_to_team"
  | "get_started_clicked"
  | "signup_form_submitted";

interface EventProps {
  screen?: string; // for demo_screen_switched
  email?: string; // for demo_email_submitted (hash before sending!)
  label?: string; // general label
  [key: string]: string | number | boolean | undefined;
}

// ── Core track function ─────────────────────────────────────────────────────

export function track(event: AnalyticsEvent, props?: EventProps): void {
  const safeProps = props ? sanitiseProps(props) : {};

  // GA4
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", event, safeProps);
  }

  // Plausible
  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible(event, {
      props: safeProps as Record<string, string | number | boolean>,
    });
  }

  // Dev console (always)
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Analytics] ${event}`, safeProps);
  }
}

// ── Strip undefined values (GA4 rejects them) ──────────────────────────────

function sanitiseProps(
  props: EventProps,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v !== undefined && v !== null) {
      out[k] = v as string | number | boolean;
    }
  }
  return out;
}

// ── Hook ───────────────────────────────────────────────────────────────────
// Usage: const { track } = useAnalytics();

export function useAnalytics() {
  return { track };
}
