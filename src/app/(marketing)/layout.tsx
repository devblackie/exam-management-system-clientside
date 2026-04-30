// clientside/src/app/(marketing)/layout.tsx
//
// Route group layout — pages inside (marketing)/ get THIS layout,
// which has NO Sidebar and NO Navbar. The root layout.tsx still wraps
// everything (QueryClient, AuthProvider, etc.) but Sidebar/Navbar
// rendering is moved here from providers.tsx.
//
// HOW ROUTE GROUPS WORK IN NEXT.JS:
// (marketing) is a "route group" — the parentheses mean it does NOT
// appear in the URL. So (marketing)/page.tsx serves "/", not "/marketing".
// The group just lets you share a layout without polluting the URL.

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No Sidebar, no Navbar — just the raw page
  return <>{children}</>;
}
