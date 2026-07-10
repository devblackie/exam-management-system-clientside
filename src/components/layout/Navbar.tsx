
// clientside/src/components/layout/Navbar.tsx
"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { branding } from "@/config/branding";
import { LogOut, Server, Unplug, Loader2, WifiOff } from "lucide-react";
import { useServerHealth } from "@/hooks/useServerHealth";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import { useMyInstitution } from "@/hooks/queries/useInstitution";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { status } = useServerHealth();
  const { data: settings } = useInstitutionSettings();
  const { data: institution } = useMyInstitution();

  if (!user) return null;

  const universityName =
    settings?.docMeta?.universityName || institution?.name || "University";

  const userSchool = settings?.schools?.find(
    (s: { code: string }) => s.code === user.schoolCode,
  );
  const userDepartment = userSchool?.departments?.find(
    (d: { code: string }) => d.code === user.departmentCode,
  );

  // ── Badge config per status ──────────────────────────────────────────────────
  const badge = {
    checking: {
      className: "border-slate-500/20 bg-slate-500/5 text-slate-400",
      icon: <Loader2 size={14} className="animate-spin" />,
      label: "Connecting",
    },
    online: {
      className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-500",
      icon: <Server size={14} />,
      label: "Live Server",
    },
    "network-down": {
      className:
        "border-orange-500/20 bg-orange-500/5 text-orange-400 animate-pulse",
      icon: <WifiOff size={14} />,
      label: "No Internet",
    },
    "server-down": {
      className: "border-red-500/20 bg-red-500/5 text-red-500 animate-pulse",
      icon: <Unplug size={14} />,
      label: "Server Offline",
    },
  }[status];

  // ── User info block (unchanged) ──────────────────────────────────────────────
  const getUserInfo = () => {
    if (user.role === "admin") {
      return (
        <div className="text-right">
          <p className="text-sm font-bold leading-tight">{user.name}</p>
          <p className="text-[8px] uppercase tracking-tighter text-yellow-gold/70 mt-0.5">
            {user.role}
          </p>
        </div>
      );
    }

    if (user.role === "coordinator") {
      if (user.institutionWide) {
        return (
          <div className="text-right">
            <p className="text-sm font-bold leading-tight">{user.name}</p>
            <p className="text-[9px] uppercase tracking-tighter text-yellow-gold/80 mt-0.5">
              {universityName} (Institution-wide)
            </p>
            <p className="text-[8px] uppercase tracking-tighter text-yellow-gold/70 mt-0.5">
              Coordinator
            </p>
          </div>
        );
      }

      return (
        <div className="text-right">
          <p className="text-sm font-bold leading-tight">{user.name}</p>
          <div className="flex flex-col items-end gap-0.5 mt-0.5">
            <p className="text-[9px] text-yellow-gold/80">
              {userSchool?.name || user.schoolCode || "No School"}
            </p>
            <p className="text-[9px] text-yellow-gold/70">
              {userDepartment?.name || user.departmentCode || "No Department"}
            </p>
          </div>
          <p className="text-[8px] uppercase tracking-tighter text-yellow-gold/50 mt-1">
            Coordinator
          </p>
        </div>
      );
    }

    return (
      <div className="text-right">
        <p className="text-sm font-bold leading-tight">{user.name}</p>
        <p className="text-[9px] uppercase tracking-tighter text-yellow-gold/80 mt-0.5">
          {universityName}
        </p>
        <p className="text-[8px] uppercase tracking-tighter text-yellow-gold/50 mt-0.5">
          {user.role}
        </p>
      </div>
    );
  };

  return (
    <header className="fixed w-full z-10">
      <div className="flex items-center justify-between px-6 py-3 bg-green-darkest border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-x-4 md:gap-x-48">
          <div className="w-10 md:hidden" />
          <div className="flex items-center gap-4">
            <Image
              src={branding.institutionLogo}
              alt={branding.logoAltText}
              width={40}
              height={40}
              priority
              style={{ height: "auto", width: "auto" }}
              className="flex items-center ml- md:hidden"
            />
          </div>
          <div className="mt-7">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Status badge */}
          <div
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${badge.className}`}
          >
            {badge.icon}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {badge.label}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-4">
            {getUserInfo()}
            <button
              onClick={logoutUser}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-gold text-green-darkest font-bold text-sm hover:scale-105 transition-transform"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
