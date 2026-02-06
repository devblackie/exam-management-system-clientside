// // src/app/login/page.tsx
// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { useAuth } from "@/context/AuthContext";
// import {
//   LockClosedIcon,
//   EnvelopeIcon,
//   EyeIcon,
//   EyeSlashIcon,
// } from "@heroicons/react/24/solid";
// import { branding } from "@/config/branding";
// import CommonButton from "@/components/ui/CommonButton";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [error, setError] = useState("");
//   const { loginUser } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       await loginUser(email, password);
//       // ✅ redirect handled inside AuthContext
//     } catch  {
//       setError("Login failed. Check credentials.");
//     }
//     finally {
//       setLoading(false);
//     }
//   };

//   const togglePasswordVisibility = () => setShowPassword(!showPassword);

//   return (
//     <div className="flex flex-col items-center justify-center bg-green-darkest min-h-screen">
//       <div className="absolute top-20 [perspective:1000px] w-[200px] h-[40px] ">
//         <div className="w-full h-full animate-spinLateral [transform-style:preserve-3d]">
//           {/* Front side */}
//           <Image
//             src={branding.institutionLogo}
//             alt={branding.logoAltText}
//             width={200}
//             height={200}
//               priority
//               style={{ height: 'auto', width: 'auto' }}
//             className="absolute inset-0 [backface-visibility:hidden]"
//           />
//           {/* Back side (mirrored) */}
//           <Image
//             src={branding.institutionLogo}
//             alt={`${branding.logoAltText} back`}
//             width={200}
//             height={200}
//               priority
//               style={{ height: 'auto', width: 'auto' }}
//             className="absolute inset-0 rotate-y-180 [backface-visibility:hidden]"
//           />
//         </div>
//       </div>
//       <h4 className="mb-7 font-bold text-foreground dark:text-white-pure sm:text-5xl ">
//         {branding.appName}
//       </h4>
//       {/* <h1 className="text-2xl font-bold mb-4">Login</h1> */}
//       {error && <p className="text-red-500">{error}</p>}
//       <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64 mt-7">
//         <div className="flex items-center  rounded-md">
//           <EnvelopeIcon className="w-5 h-5 m-2 text-yellow-gold" />
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="p-2 px-3 border-yellow-gold/40 text-yellow-gold border-b-[2px] focus:border-lime-bright w-full outline-0 bg-transparent transition duration-300"
//             required
//           />
//         </div>
//         <div className="flex items-center relative rounded-md">
//           <LockClosedIcon className="w-5 h-5 m-2 text-yellow-gold" />
//           <input
//             type={showPassword ? "text" : "password"}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="p-2 px-3 border-yellow-gold/40 text-yellow-gold border-b-[2px] focus:border-lime-bright w-full outline-0 bg-transparent transition duration-300"
//             required
//           />
//           <button
//             type="button"
//             onClick={togglePasswordVisibility}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-green-base dark:text-yellow-gold/50 hover:text-green-darkest dark:hover:text-lime-bright focus:outline-none rounded-full p-1"
//           >
//             {showPassword ? (
//               <EyeSlashIcon className="h-5 w-5" />
//             ) : (
//               <EyeIcon className="h-5 w-5" />
//             )}
//           </button>
//         </div>

//         <CommonButton
//           type="submit"
//           disabled={loading}
//           className="mt-5 font-bold  w-full max-w-[250px]"
//           textColor="text-green-darkest"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </CommonButton>
//       </form>
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ChevronLeft } from "lucide-react";
import { branding } from "@/config/branding";
import CommonButton from "@/components/ui/CommonButton";
import { motion, AnimatePresence } from "framer-motion";
import { forgotPassword } from "@/api/authApi";

interface BackendError {
  response?: {
    data?: {
      message?: string; // This matches your 'message' key in the rate limiter
    };
    status?: number;
  };
}

const LOCK_KEY = "auth_lockout_ts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [view, setView] = useState<"login" | "forgot">("login");
  const [recoverySent, setRecoverySent] = useState(false);

  const { loginUser } = useAuth();

  useEffect(() => {
    const savedLock = localStorage.getItem(LOCK_KEY);
    if (savedLock) {
      const expiration = parseInt(savedLock, 10);
      const remaining = Math.floor((expiration - Date.now()) / 1000);
      if (remaining > 0) {
        setIsLocked(true);
        setCountdown(remaining);
      } else {
        localStorage.removeItem(LOCK_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            localStorage.removeItem(LOCK_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const initiateLockout = useCallback((seconds: number) => {
    const expirationTime = Date.now() + seconds * 1000;
    localStorage.setItem(LOCK_KEY, expirationTime.toString());
    setIsLocked(true);
    setCountdown(seconds);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsSubmitting(true);
    setError("");

    try {
      await loginUser(email, password);
    } catch (err: unknown) {
      const errorObject = err as BackendError;
      const serverMessage = errorObject.response?.data?.message;
      const statusCode = errorObject.response?.status;

      if (statusCode === 429) {
        initiateLockout(900);
        setError(
          serverMessage || "TOO_MANY_REQUESTS: Access temporarily locked.",
        );
      } else {
        setError(serverMessage || "AUTHENTICATION_FAILED: Invalid Credentials");
      }

      setIsSubmitting(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await forgotPassword(email);
      setRecoverySent(true);
    } catch (err: unknown) {
      const errorObject = err as BackendError;
      setError(
        errorObject.response?.data?.message ||
          "Unable to process recovery request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-green-darkest overflow-hidden relative">
      {/* BACKGROUND TEXTURE (Subtle Institutional Watermark) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none">
        <div className="text-[11rem] font-black leading-none transform -rotate-24 translate-y-48 translate-x-48">
          {branding.devName.split(" ")[0]}
        </div>
      </div>

      {/* LEFT SIDE: Branding & Visuals (Visible on Desktop) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-1 w-12 bg-yellow-gold rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
            {branding.school}
          </span>
        </div>

        <div>
          <h1 className="text-7xl font-black text-white leading-tight tracking-tighter">
            Exams
            <br />
            <span className="text-5xl text-yellow-gold font-light">
              Management System.
            </span>
          </h1>
          <p className="text-white/40 max-w-md mt-6 text-sm font-medium leading-relaxed tracking-wide">
            Access the institutional grade synchronization and curriculum
            management protocol. Restricted to authorized coordinators only.
          </p>
        </div>

        <div className="flex items-center gap-6 text-white/20">
          <ShieldCheck size={40} strokeWidth={1} />
          <div className="text-[9px] font-mono tracking-widest uppercase">
            End-to-End <br /> Encryption Active
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Login Terminal */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          // layout
          className="w-full max-w-md flex flex-col items-center "
        >
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

          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                {/* Portal Login */}
                {view === "login" ? "Portal Login" : "Account Recovery"}
              </h2>
              <div className="h-1 w-12 bg-yellow-gold mt-2 rounded-full" />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border-l-4 border-red-500 text-red-500 px-1 py-2 rounded-r-lg text-[10px] font-black uppercase tracking-widest mb-3"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {view === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* EMAIL FIELD */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em] ml-1">
                      Official Identifier
                    </label>
                    <div className="relative border-b border-white/10 focus-within:border-yellow-gold transition-all duration-500">
                      <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type="email"
                        id="auth_email_primary"
                        name="auth_email_primary"
                        disabled={isSubmitting}
                        placeholder="name@institution.edu"
                        className="w-full bg-transparent py-4 pl-8 pr-4 text-white text-sm outline-none placeholder:text-white/10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD FIELD */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em] ml-1">
                      Security Key
                    </label>
                    <div className="relative border-b border-white/10 focus-within:border-yellow-gold transition-all duration-500">
                      <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="auth_password_primary"
                        name="auth_password_primary"
                        disabled={isSubmitting}
                        placeholder="••••••••"
                        className="w-full bg-transparent py-4 pl-8 pr-12 text-white text-sm outline-none placeholder:text-white/10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-yellow-gold transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                 

                  {!isLocked ? (
                    <>
                    <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-[9px] font-black text-white/40 hover:text-yellow-gold uppercase tracking-widest transition-colors"
                    >
                      Forgot Credentials?
                    </button>
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
                        className="w-full py-5 bg-yellow-gold hover:bg-yellow-400 text-green-darkest font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-3">
                            <Loader2 className="animate-spin" size={16} />{" "}
                            Verifying...
                          </span>
                        ) : (
                          "Establish Connection"
                        )}
                      </CommonButton>
                    </motion.div>
                    </>
                  ) : (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full py-2 bg-red-500/10 border border-red-500/20 rounded-2xl text-center"
                    >
                      <p className="text-white font-mono text-[10px] mt-1">
                        {Math.floor(countdown / 60)}m {countdown % 60}s
                        remaining
                      </p>
                    </motion.div>
                  )}
                </motion.form>
              ) : (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRecovery}
                  className="space-y-6"
                >
                  {!recoverySent ? (
                    <>
                      <p className="text-white/40 text-[11px] leading-relaxed">
                        Enter your registered identifier to receive a recovery
                        protocol link.
                      </p>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em]">
                          Recovery Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent border-b border-white/10 py-4 text-white text-sm outline-none"
                          required
                        />
                      </div>
                      <CommonButton
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-yellow-gold text-green-darkest font-black uppercase tracking-[0.3em] rounded-2xl"
                      >
                        {isSubmitting ? "Processing..." : "Initiate Recovery"}
                      </CommonButton>
                    </>
                  ) : (
                    <div className="py-8 text-center bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        Protocol Dispatched
                      </p>
                      <p className="text-white/60 text-[11px] mt-2">
                        Check your inbox for further instructions.
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setView("login")}
                    className="flex items-center gap-2 mx-auto text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    <ChevronLeft size={12} /> Return to Terminal
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                Protected by {branding.school} Infrastructure <br />
                Internal Personnel Only
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
