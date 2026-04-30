// clientside/src/app/(app)/layout.tsx
//
// All authenticated app pages live inside (app)/.
// This layout adds Sidebar + Navbar.
//
// Move your coordinator/, admin/ folders inside (app)/:
//   app/(app)/coordinator/...
//   app/(app)/admin/...
//   app/(app)/login/...    ← login stays here too, but ProtectedRoute skips sidebar for it

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
