// clientside/src/components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Home } from "lucide-react";
import { branding } from "@/config/branding";
import { MENU_ITEMS, UserRole } from "@/config/navigation";


export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const role = user.role?.toLowerCase() as UserRole;

  const dashboardLink = {
    admin: "/admin/invite",
    lecturer: "/lecturer/upload",
    coordinator: "/coordinator",
  }[role] || "/";

// const dashboardLink = (() => {
//   const role = user.role?.toLowerCase().trim();
//   if (role === "admin") return "/admin";
//   if (role === "lecturer") return "/lecturer";
//   if (role === "coordinator") return "/coordinator";
//   return "/"; // safe fallback
// })();

  // Combine dashboard + other menu items filtered by role
  const filteredMenu = [
    { name: "Dashboard", icon: Home, href: dashboardLink, roles: [role] },
    ...MENU_ITEMS.filter((item) => item.roles.includes(role)),
  ];

  const NavContent = () => (
    <nav className="flex-1 px-3 py-4 space-y-2">
      {filteredMenu.map((item) => {
        const Icon = item.icon;
        // Use startsWith to keep parent links active during sub-routing
        const isActive = pathname.startsWith(item.href);
        
        return (
          <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
            <div className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
              isActive 
                ? "bg-yellow-gold text-green-darkest shadow-lg" 
                : "text-white/80 hover:bg-green-dark hover:text-white"
            }`}>
              <Icon className={`h-5 w-5 mr-3 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
     <aside className="hidden md:flex md:flex-col min-h-screen bg-green-darkest  fixed left-0 top-0 z-30">
        <div className="p-6 flex justify-center ">
          <Image src={branding.institutionLogo} alt="Logo" width={50} height={50} priority />
        </div>
        <NavContent />
      </aside>

      {/* Mobile Toggle */}
      <button onClick={() => setOpen(true)} className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-green-dark text-white shadow-xl">
        <Menu size={24} />
      </button>

 {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-72 bg-green-darkest z-50 p-6 md:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <Image src={branding.institutionLogo} alt="Logo" width={40} height={40} />
                <button onClick={() => setOpen(false)} className="text-white hover:text-yellow-gold"><X /></button>
              </div>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
