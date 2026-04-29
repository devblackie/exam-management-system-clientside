import { 
  UserPlus, Users, UsersRound, BrainCog, BookOpen, ClipboardList, BookOpenCheck, 
  CalendarDays, Upload, Search, GraduationCap, Cog, Archive, 
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
  { name: "Send Invites", icon: UserPlus, href: "/admin/admit", roles: ["admin"] },
  { name: "Manage Users", icon: Users, href: "/admin/users", roles: ["admin"] },
  { name: "Academic Year", icon: CalendarDays, href: "/coordinator/academic-years", roles: ["coordinator"] },
  { name: "Programs", icon: BookOpen, href: "/admin/programs", roles: ["admin"] },
  { name: "Curriculum", icon: BookOpenCheck, href: "/coordinator/curriculum", roles: [ "coordinator"] },
  { name: "Units", icon: ClipboardList, href: "/coordinator/unit-templates", roles: [ "coordinator"] },
  { name: "Register Students", icon: Users, href: "/coordinator/students", roles: ["coordinator"] },
  { name: "Upload Results", icon: Upload, href: "/coordinator/upload", roles: ["coordinator"] },
  { name: "Search", icon: Search, href: "/coordinator/student-search", roles: ["coordinator"] },
  { name: "Graduation List", icon: GraduationCap, href: "/coordinator/award-list", roles: ["coordinator"] },
  { name: "Lecturers", icon: UsersRound, href: "/admin/lecturers", roles: ["admin"]},
  { name: "Logs", icon: BrainCog, href: "/admin/logs", roles: ["admin"]},
//    { name: "Lecturers",icon: DocumentArrowUpIcon,href: "/coordinator/lecturers",roles: ["coordinator"]},
   { name: "Bin", icon: Archive, href: "/coordinator/maintenance", roles: ["coordinator"] },
   { name: "System Health", icon: Cog, href: "/admin/health", roles: ["admin"] },
];