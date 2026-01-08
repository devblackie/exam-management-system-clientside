"use client";

import {
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { branding } from "@/config/branding";


export default function Navbar() {
  const { user, logoutUser } = useAuth();

  if (!user) return null;   // hide navbar when not logged in

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-green-darkest shadow fixed w-full">

        {/* Logo */}
      <div className="flex items-center gap-4">
          <Image
            src={branding .institutionLogo}
            alt={branding.logoAltText}
            width={40}
            height={40}
            className="flex items-center ml-9 md:hidden"
          />
      </div>
      {/* Right-side buttons */}
      <div className="flex items-center space-x-4">
        <span className="text-sm capitalize">{user.name} ({user.role})</span>
        <button
          onClick={logoutUser}
          className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-gold text-green-darkest hover:bg-yellow-500 transition"
        >
        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
}
