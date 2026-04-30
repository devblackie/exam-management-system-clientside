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
    admin: "/admin",
    lecturer: "/lecturer/upload",
    coordinator: "/coordinator",
   }[role] || "/";

  const filteredMenu = [
    { name: "Dashboard", icon: Home, href: dashboardLink, roles: [role] },
    ...MENU_ITEMS.filter((item) => item.roles.includes(role)),
  ];

  const NavContent = () => (
    <nav className="flex-1 px-6 py-10 space-y-6">
      {filteredMenu.map((item) => {
        const Icon = item.icon;
        const isActive = item.name === "Dashboard" ? pathname === item.href  : pathname.startsWith(item.href);

        return (
          <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className="group block relative">
            <div className="flex items-center relative transition-colors duration-300">
              {/* Minimalist Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="minimalDot"
                  className="absolute -left-4 w-1.5 h-1.5 rounded-full bg-yellow-gold shadow-[0_0_8px_rgba(234,179,8,0.8)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <Icon className={`h-5 w-5 mr-4 transition-all duration-300 ${
                isActive ? "text-yellow-gold" : "text-white/40 group-hover:text-white group-hover:scale-110"
              }`} />
              
              <div className="flex flex-col">
                <span className={`text-sm font-medium tracking-tight transition-colors duration-300 ${
                  isActive ? "text-yellow-gold" : "text-white/60 group-hover:text-white/75"
                }`}>
                  {item.name}
                </span>
                
                {/* Minimalist Underline */}
                <span className={`h-[1px] bg-yellow-gold/50 transition-all duration-500 ${
                  isActive ? "w-4 mt-1" : "w-0 mt-1 group-hover:w-full"
                }`} />
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );

    const SidebarFooter = () => (
      <div className="p-4 mt-auto opacity-20 hover:opacity-100 transition-opacity duration-500 z-30">

          <div className="flex items-center space-x-3  p-3 ">
            {/* <Image src={branding.devComLogo} alt={branding.devCom} width={28} height={28} className="grayscale brightness-200" /> */}
             <div className="flex flex-col space-y-1">
            <span className="text-[8px] uppercase tracking-[0.4em] text-white font-bold">Powered By</span>
            <span className="text-[10px] text-yellow-gold uppercase font-medium tracking-widest">{branding.devCom || "NEWTSOLHUB"}</span>
          </div>
          </div>
        </div>
      );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col min-h-screen bg-green-darkest fixed left-0 top-0 z-30 ">
        <div className="p-6 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="transition-all duration-500"
          >
            <Image src={branding.institutionLogo} alt="Logo" width={42} height={42} priority />
          </motion.div>
        </div>

        <NavContent />
        <SidebarFooter />
      </aside>

      {/* Mobile Toggle - Floating Minimalist */}
      {!open && (
        <button 
          onClick={() => setOpen(true)} 
          className="md:hidden fixed top-6 left-6 z-40 text-white/60 hover:text-yellow-gold transition-colors"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-green-darkest/95 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 w-full max-w-xs bg-green-darkest z-50 flex flex-col p-10"
            >
              <div className="flex justify-between items-center mb-12">
                <Image src={branding.institutionLogo} alt="Logo" width={40} height={40} />
                <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                  <X size={20} strokeWidth={1} />
                </button>
              </div>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
