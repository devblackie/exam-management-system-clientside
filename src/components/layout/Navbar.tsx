

// "use client";

// import Image from "next/image";
// import { useAuth } from "@/context/AuthContext";
// import { branding } from "@/config/branding";
// import { LogOut, Server, ServerOff, Loader2 } from "lucide-react";
// // import Breadcrumbs from "@/ui/Breadcrumbs";
// import { useServerHealth } from "@/hooks/useServerHealth";
// import Breadcrumbs from "@/components/ui/Breadcrumbs";

// export default function Navbar() {
//   const { user, logoutUser } = useAuth();
//   const isOnline = useServerHealth();

//   if (!user) return null;

//   // Badge styles for all three states
//   const badgeClass =
//     isOnline === null
//       ? "border-slate-500/20 bg-slate-500/5 text-slate-400"
//       : isOnline
//       ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
//       : "border-red-500/20 bg-red-500/5 text-red-500 animate-pulse";

//   const badgeIcon =
//     isOnline === null ? (
//       <Loader2 size={14} className="animate-spin" />
//     ) : isOnline ? (
//       <Server size={14} />
//     ) : (
//       <ServerOff size={14} />
//     );

//   const badgeText =
//     isOnline === null ? "Connecting" : isOnline ? "Live Server" : "Server Offline";

//   return (
//     <header className="fixed w-full z-10">
//       <div className="flex items-center justify-between px-6 py-3 bg-green-darkest border-b border-white/5 shadow-2xl">
//         <div className="flex items-center gap-x-4 md:gap-x-48">
//           {/* Mobile Spacer */}
//           <div className="w-10 md:hidden" />
//           <div className="flex items-center gap-4">
//             <Image
//               src={branding.institutionLogo}
//               alt={branding.logoAltText}
//               width={40}
//               height={40}
//               priority
//               style={{ height: "auto", width: "auto" }}
//               className="flex items-center ml- md:hidden"
//             />
//           </div>
//           <div className="mt-7">
//             <Breadcrumbs />
//           </div>
//         </div>

//         <div className="flex items-center gap-6">
//           {/* Server status badge — 3 states */}
//           <div
//             className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${badgeClass}`}
//           >
//             {badgeIcon}
//             <span className="text-[10px] font-black uppercase tracking-widest">
//               {badgeText}
//             </span>
//           </div>

//           <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

//           <div className="flex items-center gap-4">
//             <div className="text-right hidden sm:block">
//               <p className="text-sm font-bold leading-tight">{user.name}</p>
//               <p className="text-[10px] uppercase tracking-tighter text-yellow-gold opacity-80">
//                 {user.role}
//               </p>
//             </div>
//             <button
//               onClick={logoutUser}
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-gold text-green-darkest font-bold text-sm hover:scale-105 transition-transform"
//             >
//               <LogOut size={16} />
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }






// clientside/src/components/layout/Navbar.tsx
"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { branding } from "@/config/branding";
import { LogOut, Server, ServerOff, Loader2 } from "lucide-react";
import { useServerHealth } from "@/hooks/useServerHealth";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import { useMyInstitution } from "@/hooks/queries/useInstitution";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const isOnline = useServerHealth();
  const { data: settings } = useInstitutionSettings();
  const { data: institution } = useMyInstitution();

  if (!user) return null;

  // Get university name from settings docMeta or institution
  const universityName = settings?.docMeta?.universityName || institution?.name || "University";
  
  // Get user's assigned school and department (for coordinators)
  const userSchool = settings?.schools?.find(s => s.code === user.schoolCode);
  const userDepartment = userSchool?.departments?.find(d => d.code === user.departmentCode);

  // Badge styles for all three states
  const badgeClass =
    isOnline === null
      ? "border-slate-500/20 bg-slate-500/5 text-slate-400"
      : isOnline
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
      : "border-red-500/20 bg-red-500/5 text-red-500 animate-pulse";

  const badgeIcon =
    isOnline === null ? (
      <Loader2 size={14} className="animate-spin" />
    ) : isOnline ? (
      <Server size={14} />
    ) : (
      <ServerOff size={14} />
    );

  const badgeText =
    isOnline === null ? "Connecting" : isOnline ? "Live Server" : "Server Offline";

  // Determine what to show in the user info area
  const getUserInfo = () => {
    if (user.role === "admin") {
      return (
        <div className="text-right">
          <p className="text-sm font-bold leading-tight">{user.name}</p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            {/* <Building2 size={10} className="text-yellow-gold/60" /> */}
            <p className="text-[9px] uppercase tracking-tighter text-yellow-gold/80">
              {/* {universityName} */}
            </p>
          </div>
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
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <p className="text-[9px] uppercase tracking-tighter text-yellow-gold/80">
                {universityName} (Institution-wide)
              </p>
            </div>
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
            <div className="flex items-center gap-1">
              <p className="text-[9px] text-yellow-gold/80">
                {userSchool?.name || user.schoolCode || "No School"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <p className="text-[9px] text-yellow-gold/70">
                {userDepartment?.name || user.departmentCode || "No Department"}
              </p>
            </div>
          </div>
          <p className="text-[8px] uppercase tracking-tighter text-yellow-gold/50 mt-1">
            Coordinator
          </p>
        </div>
      );
    }

    // Lecturer
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
          {/* Mobile Spacer */}
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
          {/* University Info - Show for all roles */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] font-medium text-white/80">
              {universityName}
            </span>
          </div>

          {/* Server status badge */}
          <div
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${badgeClass}`}
          >
            {badgeIcon}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {badgeText}
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
