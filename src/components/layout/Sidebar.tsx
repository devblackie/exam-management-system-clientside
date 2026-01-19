// clientside/src/components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  UserPlusIcon,
  UsersIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarSquareIcon, 
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Home, BookOpenText,BookOpenCheck,CalendarDays,Cog, Users, Upload, UserRoundSearch,FileText } from "lucide-react";
import { branding } from "@/config/branding";
import type { SVGProps } from "react";

interface MenuItem {
  name: string;
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  roles: Array<"admin" | "lecturer" | "coordinator">;
}

const menuItems: MenuItem[] = [
  {
    name: "Send Invites",
    icon: UserPlusIcon,
    href: "/admin/invite",
    roles: ["admin"],
  },
  {
    name: "Manage Invites",
    icon: UsersIcon,
    href: "/admin/invites",
    roles: ["admin"],
  },
  {
    name: "Manage Users",
    icon: UserGroupIcon,
    href: "/admin/users",
    roles: ["admin"],
  },
  {
    name: "Programs",
    icon: BookOpenIcon,
    href: "/admin/programs",
    roles: ["admin", "coordinator"],
  },
    {
    name: "Units",
    icon: BookOpenText,
    href: "/coordinator/unit-templates",
    roles: ["admin", "coordinator"],
  },
  {
    name: "Curriculum",
    icon: BookOpenCheck,
    href: "/coordinator/curriculum",
    roles: ["admin", "coordinator"],
  },
  {
    name: "Lecturers",
    icon: UserGroupIcon,
    href: "/admin/lecturers",
    roles: ["admin"],
  },
  {
    name: "Logs",
    icon: ChartBarSquareIcon,
    href: "/admin/logs",
    roles: ["admin"],
  },
   {
    name: "Academic Year",
    icon: CalendarDays,
    href: "/coordinator/academic-years",
    roles: ["coordinator"],
  },

  // {
  //   name: "Lecturers",
  //   icon: DocumentArrowUpIcon,
  //   href: "/coordinator/lecturers",
  //   roles: ["coordinator"],
  // },
    {
    name: "Register Students",
    icon: Users,
    href: "/coordinator/students",
    roles: ["coordinator"],
  },
    {
    name: "Upload Results",
    icon: Upload,
    href: "/coordinator/upload",
    roles: ["coordinator"],
  },
  {
    name: "Search",
    icon: UserRoundSearch,
    href: "/coordinator/student-search",
    roles: ["coordinator"],
  },
  {
    name: "Reports",
    icon: FileText,
    href: "/coordinator/reports",
    roles: ["coordinator"],
  },
   {
    name: "Settings",
    icon: Cog,
    href: "/coordinator/institution-settings",
    roles: ["coordinator"],
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Determine dashboard link dynamically
  // const dashboardLink = {
  //   admin: "/admin",
  //   lecturer: "/lecturer",
  //   coordinator: "/coordinator",
  // }[user.role];

const dashboardLink = (() => {
  const role = user.role?.toLowerCase().trim();
  if (role === "admin") return "/admin";
  if (role === "lecturer") return "/lecturer";
  if (role === "coordinator") return "/coordinator";
  return "/"; // safe fallback
})();

  // Combine dashboard + other menu items filtered by role
  const filteredMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      href: dashboardLink,
      roles: [user.role],
    },
    ...menuItems.filter((item) => item.roles.includes(user.role)),
  ];

  // const filteredMenu = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col min-h-screen bg-green-darkest p-3 fixed z-20">
        <div className="flex items-center justify-center h-16">
          <Image
            src={branding.institutionLogo}
            alt={branding.logoAltText}
            width={40}
            height={40}
              priority            
  style={{ height: 'auto', width: 'auto' }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2  ">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center mt-2 p-2 rounded-lg text-white hover:bg-green-dark/90 transition ${
                    pathname === item.href
                      ? "bg-yellow-gold/50 text-green-darkest"
                      : ""
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: open ? "0%" : "-100%" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0  bg-green-darkest shadow-lg z-50 p-4 md:hidden"
      >
        <div className="flex justify-end mb-4">
          <button onClick={() => setOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        <nav className="space-y-2">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center mt-2 p-2 rounded-lg text-white hover:bg-green-dark/90 transition ${
                    pathname === item.href
                      ? "bg-yellow-gold/50 text-green-500"
                      : ""
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </motion.div>

      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-4 z-40 p-1 rounded-md bg-green-dark shadow"
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>
    </>
  );
}
