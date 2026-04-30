// clientside/src/config/branding.ts
export const branding = {
  // ── Company (developer/maintainer) ───────────────────────────────────────
  devCom: "newtsolhub",
  devComLogo: "/newtsolhubLogo.png",
  devComUrl: "https://newtsolhub.com",

  // ── Product ───────────────────────────────────────────────────────────────
  devName: "SenateDesk",
  appName: "Exams Coordinator", // shown inside the app
  tagLine: "Academic progression, automated.",
  logoIcon: "/Logo.png", // the SD column mark
  logoAltText: "SenateDesk",

  // ── Institution (set per deployment) ─────────────────────────────────────
  // In a multi-institution deployment, these would come from InstitutionSettings.
  // For single-institution deployments, set them here.
  institutionLogo: "/institutionLogo.png",
  school: "University of Technology",

  // ── URLs ──────────────────────────────────────────────────────────────────
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://senatedesk.com",
  supportEmail: "hello@newtsolhub.com",
};
