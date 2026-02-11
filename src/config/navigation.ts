import { 
  Home, 
  UserPlus, 
  Users, 
  BookOpen, 
  BookOpenCheck, 
  CalendarDays, 
  Upload, 
  Search, 
  LayoutDashboard,
  GraduationCap,
  FileCog,
  Cog,
  FileText
} from "lucide-react";
import { SVGProps } from "react";

export type UserRole = "admin" | "lecturer" | "coordinator";

export interface MenuItem {
  name: string;
  icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  roles: UserRole[];
}

export const MENU_ITEMS: MenuItem[] = [
  { name: "Send Invites", icon: UserPlus, href: "/admin/invite", roles: ["admin"] },
  { name: "Manage Invites", icon: Users, href: "/admin/invites", roles: ["admin"] },
  { name: "Manage Users", icon: Users, href: "/admin/users", roles: ["admin"] },
  { name: "Academic Year", icon: CalendarDays, href: "/coordinator/academic-years", roles: ["coordinator"] },
  { name: "Programs", icon: BookOpen, href: "/admin/programs", roles: ["admin", "coordinator"] },
  { name: "Curriculum", icon: BookOpenCheck, href: "/coordinator/curriculum", roles: ["admin", "coordinator"] },
  { name: "Units", icon: GraduationCap, href: "/coordinator/unit-templates", roles: ["admin", "coordinator"] },
  { name: "Register Students", icon: Users, href: "/coordinator/students", roles: ["coordinator"] },
  { name: "Upload Results", icon: Upload, href: "/coordinator/upload", roles: ["coordinator"] },
  { name: "Search", icon: Search, href: "/coordinator/student-search", roles: ["coordinator"] },
//   { name: "Lecturers", icon: UserGroup, href: "/admin/lecturers", roles: ["admin"]},
//   { name: "Logs", icon: ChartBarSquare, href: "/admin/logs", roles: ["admin"]},
//    { name: "Lecturers",icon: DocumentArrowUpIcon,href: "/coordinator/lecturers",roles: ["coordinator"]},
//    { name: "Reports", icon: FileText, href: "/coordinator/reports",roles: ["coordinator"] },
   { name: "Settings", icon: FileCog, href: "/coordinator/institution-settings", roles: ["coordinator"] },
  //  { name: "System Health", icon: Cog, href: "/admin/health", roles: ["coordinator"] },
];