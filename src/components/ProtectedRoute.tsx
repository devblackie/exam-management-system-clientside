// src/components/ProtectedRoute.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { me } from "@/lib/api"; 

// type Role = "admin" | "lecturer" | "coordinator";

// interface Props {
//   children: React.ReactNode;
//   allowed: Role[];
// }

// export default function ProtectedRoute({ children, allowed }: Props) {
//   const [loading, setLoading] = useState(true);
//   const [authorized, setAuthorized] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     async function checkAuth() {
//       try {
//         const res = await me(); 
//         const userRole = res.data.role;

//         if (allowed.includes(userRole as Role)) {
//           setAuthorized(true);
//         } else {
//           router.replace("/login"); // redirect if wrong role
//         }
//       } catch {
//         router.replace("/login"); // not logged in
//       } finally {
//         setLoading(false);
//       }
//     }
//     checkAuth();
//   }, [allowed, router]);

//   if (loading) return <p>Loading...</p>;
//   if (!authorized) return null;

//   return <>{children}</>;
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { branding } from "@/config/branding";
import { motion } from "framer-motion";

type Role = "admin" | "lecturer" | "coordinator";

interface Props {
  children: React.ReactNode;
  allowed: Role[];
}

export default function ProtectedRoute({ children, allowed }: Props) {
  const { user, loading } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   if (loading) return;



  //   if (!user || !allowed.includes(user.role as Role)) {
  //     router.replace("/login");
  //     return;
  //   }

  //   // Small delay for smooth transitions
  //   const timer = setTimeout(() => setShowContent(true), 300);
  //   return () => clearTimeout(timer);
  // }, [user, loading, allowed, router]);

  useEffect(() => {
    if (loading) return;

    if (!user || !allowed.includes(user.role as Role)) {
      router.replace("/login");
      return;
    }

    // Small delay for smooth transition
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, [user, loading, allowed, router]);


  if (loading || !showContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-darkest">
        {/* Animated Spinning Logo */}
        <motion.div
          initial={{ rotateY: 0, opacity: 0 }}
          animate={{ rotateY: 360, opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-[140px] h-[140px]"
        >
          <Image
            src={branding.institutionLogo}
            alt={branding.logoAltText}
            width={140}
            height={140}
            priority
            style={{ height: 'auto'}}
            className="object-contain"
          />
        </motion.div>

        {/* Animated Slogan */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-yellow-gold text-sm drop-shadow"
        >
          Securing your session...
        </motion.p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

