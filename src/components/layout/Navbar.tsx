// clientside/src/components/layout/Navbar.tsx
"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { branding } from "@/config/branding";
import { LogOut, ShieldCheck, WifiOff } from "lucide-react";
import Breadcrumbs from "../ui/Breadcrumbs";
import { useServerHealth } from "@/hooks/useServerHealth";


export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const isOnline = useServerHealth();

  if (!user) return null;

  return (
   <header className="fixed w-full z-10">
     

      <div className="flex items-center justify-between px-6 py-3 bg-green-darkest border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-x-4 md:gap-x-48">
        {/* Mobile Spacer (for the toggle button) */}
        <div className="w-10 md:hidden" />
        <div className="flex items-center gap-4">
          <Image
            src={branding.institutionLogo}
            alt={branding.logoAltText}
            width={40}
            height={40}
            priority
            style={{ height: 'auto', width: 'auto' }}
            className="flex items-center ml- md:hidden"
          />
        </div>
        <div className="mt-7">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-6">
          {/* 2. SYSTEM STATUS BADGE */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
            isOnline 
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500" 
              : "border-red-500/20 bg-red-500/5 text-red-500 animate-pulse"
          }`}>
            {isOnline ? <ShieldCheck size={14} /> : <WifiOff size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isOnline ? "Encrypted & Live" : "Offline"}
            </span>
          </div>

<div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold leading-tight">{user.name}</p>
          <p className="text-[10px] uppercase tracking-tighter text-yellow-gold opacity-80">{user.role}</p>
        </div>
        <button
          onClick={logoutUser}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-gold text-green-darkest font-bold text-sm hover:scale-105 transition-transform"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
      </div></div>
    </header>
  );
}
