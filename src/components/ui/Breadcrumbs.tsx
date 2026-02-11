// clientside/src/components/ui/Breadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Split path and remove empty strings
  const pathSegments = pathname.split("/").filter((item) => item !== "");

  return (
    <nav className="flex items-center space-x-1 text-sm text-white/60">
      <Link href="/" className="hover:text-yellow-gold transition-colors">
        <Home size={16} />
      </Link>

      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;
        
        // Clean up labels: "unit-templates" -> "Unit Templates"
        const label = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // Skip rendering IDs (e.g., 24-char hex strings) in the breadcrumb trail
        if (segment.length > 20) return null;

        return (
          <div key={href} className="flex items-center space-x-1">
            <ChevronRight size={14} className="opacity-40" />
            {isLast ? (
              <span className="text-yellow-gold font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-white transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}