// // clientside/src/app/page.tsx
// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import Image from "next/image";
// import { branding } from "@/config/branding";
// import { motion } from "framer-motion";

// export default function Home() {
//   const { user, loading } = useAuth();
//   const router = useRouter();

//   // Redirect authenticated user automatically
//   useEffect(() => {
//     if (loading) return;

//     if (user) {
//       const role = user.role?.toLowerCase();
//       if (role === "admin") return router.replace("/admin/invite");
//       if (role === "lecturer") return router.replace("/lecturer/upload");
//       if (role === "coordinator") return router.replace("/coordinator/students");
//     }

//     // Not logged in? Go to login
//     router.replace("/login");
//   }, [user, loading, router]);

//   // Splash Loader while checking session state
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-green-dark">
//       {/* Spinning Logo */}
//       <motion.div
//         initial={{ rotateY: 0 }}
//         animate={{ rotateY: 360 }}
//         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//         className="w-[180px] h-[180px]"
//       >
//         <Image
//           src={branding.institutionLogo}
//           alt={branding.logoAltText}
//           width={180}
//           height={180}
//           priority            
//   style={{ height: 'auto', width: 'auto' }}
//           className="object-contain"
//         />
//       </motion.div>

//       {/* Branding Name */}
//       <motion.h1
//         className="mt-8 text-3xl font-bold text-yellow-gold drop-shadow-lg"
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//       >
//         {branding.appName}
//       </motion.h1>

//       {/* Sub text */}
//       <motion.p
//         className="mt-2 text-sm text-yellow-gold/70"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.5 }}
//       >
//         Initializing dashboard...
//       </motion.p>
//     </div>
//   );
// }

// clientside/src/app/page.tsx
"use client";

import Image from "next/image";
import { branding } from "@/config/branding";
import { motion } from "framer-motion";

/**
 * OPINIONATED CHANGE: 
 * We removed the useEffect redirect logic. 
 * The Middleware now handles the 307 redirect server-side.
 * This page only shows if the Middleware 'NextResponse.next()' is called,
 * acting as a beautiful splash screen during initial session hydration.
 */
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-darkest">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src={branding.institutionLogo}
            alt="Logo"
            width={120}
            height={120}
            priority
          />
        </motion.div>
        
        <h1 className="mt-6 text-2xl font-bold text-yellow-gold tracking-widest uppercase">
          {branding.appName}
        </h1>
        <div className="mt-4 w-12 h-1 bg-yellow-gold/30 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-yellow-gold"
            animate={{ x: [-50, 50] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}