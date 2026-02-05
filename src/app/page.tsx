// clientside/src/app/page.tsx
"use client";

import Image from "next/image";
import { branding } from "@/config/branding";
import { motion } from "framer-motion";


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
              <motion.p
        className="mt-2 text-sm text-yellow-gold/70"
         initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Initializing dashboard...       </motion.p>

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