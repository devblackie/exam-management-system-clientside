// clientside/src/app/reset-password/[token]/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

import { useParams, useRouter } from "next/navigation";
import CommonButton from "@/components/ui/CommonButton";
import { branding } from "@/config/branding";

import { motion } from "framer-motion";
import { resetPassword } from "@/api/authApi";
import { EyeOff, Eye,Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
  
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match.");
    
    setIsSubmitting(true);
    setError("");
    try {
      await resetPassword(token as string, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch  {
      setError( "Reset link invalid or expired.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-darkest flex flex-col items-center justify-center p-6">
    
    <div className="relative w-32 h-32 ">
                    <motion.div
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-full h-full"
                    >
                      <Image
                        src={branding.institutionLogo}
                        alt="Logo"
                        fill
                        className="object-contain"
                      />
                    </motion.div>
                  </div>
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl"
      >
        
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
          New Security Key
        </h2>
        <div className="h-1 w-12 bg-yellow-gold mb-8 rounded-full" />

        {success ? (
          <div className="text-center py-8">
            <p className="text-emerald-400 font-bold uppercase tracking-widest">
              Key Updated
            </p>
            <p className="text-white/40 text-sm mt-2">
              Redirecting to terminal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 p-2 rounded border-l-2 border-red-500">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em]">
                New Password
              </label>
              <div className="relative border-b border-white/10 focus-within:border-yellow-gold transition-all duration-500">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  id="security_key_reset_primary" // Unique ID
                  name="security_key_reset_primary"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-transparent py-4 pl-8 pr-4 text-white text-sm outline-none placeholder:text-white/10"
                  
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-yellow-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em]">
                Confirm Password
              </label>
              <div className="relative border-b border-white/10 focus-within:border-yellow-gold transition-all duration-500">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-transparent py-4 pl-8 pr-4 text-white text-sm outline-none placeholder:text-white/10"
                  
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-yellow-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

  <motion.div
                      key="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
            <CommonButton
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-yellow-gold text-green-darkest font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl"
            >
              {isSubmitting ? "Updating Protocol..." : "Sync Credentials"}
            </CommonButton>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
}