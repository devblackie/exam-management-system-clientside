// clientside/src/app/coordinator-secret/layout.tsx
//
// ── CRITICAL: This layout must exist and must NOT include ProtectedRoute ──
//
// Without this file, the coordinator-secret page inherits its nearest parent
// layout. If that parent layout wraps children in ProtectedRoute (which is
// common for app/(dashboard)/layout.tsx or similar), this public page will
// get caught by the auth check and redirect to /login.
//
// This layout is intentionally minimal — it renders children directly with
// no authentication wrapper.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coordinator Registration",
  description: "Coordinator portal registration",
  robots: "noindex, nofollow",   // keep registration pages out of search engines
};

export default function CoordinatorSecretLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Plain pass-through — no AuthProvider dependency here beyond what the
  // root layout already provides. No ProtectedRoute. No redirect logic.
  return <>{children}</>;
}