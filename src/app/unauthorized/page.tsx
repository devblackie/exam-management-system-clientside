"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";
import CommonButton from "@/components/ui/CommonButton";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  // Determine where to send them back based on their role
  const getSafePath = () => {
    const role = user?.role?.toLowerCase();
    if (role === "admin") return "/admin/invite";
    if (role === "lecturer") return "/lecturer/upload";
    if (role === "coordinator") return "/coordinator/students";
    return "/login";
  };

  return (
    <div className="min-h-screen bg-green-darkest flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-yellow-gold/20 blur-3xl rounded-full" />
          <ShieldAlert size={80} className="text-yellow-gold relative z-10 mx-auto" />
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2"
          >
            <Lock size={24} className="text-yellow-gold" />
          </motion.div>
        </div>

        <h1 className="text-4xl font-black text-white-pure mb-4 tracking-tight">
          ACCESS DENIED
        </h1>
        
        <p className="text-white/60 mb-8 leading-relaxed">
          Your account <span className="text-yellow-gold font-mono">({user?.email})</span> 
          does not have the required permissions to view this administrative section.
        </p>

        <div className="flex flex-col gap-4">
          <Link href={getSafePath()}>
            <CommonButton className="w-full bg-yellow-gold text-green-darkest font-bold flex items-center justify-center gap-2">
              <ArrowLeft size={18} />
              Return to your Dashboard
            </CommonButton>
          </Link>
          
          <Link href="/support" className="text-sm text-yellow-gold/50 hover:text-yellow-gold transition-colors underline underline-offset-4">
            Request higher access level
          </Link>
        </div>
      </motion.div>

      <footer className="absolute bottom-8 text-[10px] text-white/20 uppercase tracking-[0.2em]">
        Security Protocol Error 403 • Restricted Access
      </footer>
    </div>
  );
}