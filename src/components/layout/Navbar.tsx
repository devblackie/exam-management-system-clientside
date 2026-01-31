"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { branding } from "@/config/branding";
import { LogOut } from "lucide-react";
import Breadcrumbs from "../ui/Breadcrumbs";


export default function Navbar() {
  const { user, logoutUser } = useAuth();
  if (!user) return null;
  return (


    <header className="flex items-center justify-between px-4 py-3 bg-green-darkest shadow fixed w-full">
      <div className="flex items-center gap-x-4 md:gap-x-48 ">
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
    </header>
  );
}
