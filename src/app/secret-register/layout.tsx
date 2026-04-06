// clientside/src/app/secret-register/layout.tsx
//
// Same pattern as coordinator-secret/layout.tsx.
// Prevents any parent layout from wrapping this page in ProtectedRoute.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Registration",
  robots: "noindex, nofollow",
};

export default function SecretRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
