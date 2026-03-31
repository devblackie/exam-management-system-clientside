// // src/app/login/page.tsx
// "use client";

// import { useCallback, useEffect, useState } from "react";
// import Image from "next/image";
// import { useAuth } from "@/context/AuthContext";
// import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, ChevronLeft } from "lucide-react";
// import { branding } from "@/config/branding";
// import CommonButton from "@/components/ui/CommonButton";
// import { motion, AnimatePresence } from "framer-motion";
// import { forgotPassword } from "@/api/authApi";

// interface BackendError {
//   response?: {
//     data?: {
//       message?: string; // This matches your 'message' key in the rate limiter
//     };
//     status?: number;
//   };
// }

// const LOCK_KEY = "auth_lockout_ts";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [isLocked, setIsLocked] = useState(false);
//   const [countdown, setCountdown] = useState(0);
//   const [view, setView] = useState<"login" | "forgot">("login");
//   const [recoverySent, setRecoverySent] = useState(false);

//   const { loginUser } = useAuth();

//   useEffect(() => {
//     const savedLock = localStorage.getItem(LOCK_KEY);
//     if (savedLock) {
//       const expiration = parseInt(savedLock, 10);
//       const remaining = Math.floor((expiration - Date.now()) / 1000);
//       if (remaining > 0) {
//         setIsLocked(true);
//         setCountdown(remaining);
//       } else {
//         localStorage.removeItem(LOCK_KEY);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (countdown > 0) {
//       const timer = setInterval(() => {
//         setCountdown((prev) => {
//           if (prev <= 1) {
//             setIsLocked(false);
//             localStorage.removeItem(LOCK_KEY);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       return () => clearInterval(timer);
//     }
//   }, [countdown]);

//   const initiateLockout = useCallback((seconds: number) => {
//     const expirationTime = Date.now() + seconds * 1000;
//     localStorage.setItem(LOCK_KEY, expirationTime.toString());
//     setIsLocked(true);
//     setCountdown(seconds);
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isLocked) return;

//     setIsSubmitting(true);
//     setError("");

//     try {
//       await loginUser(email, password);
//     } catch (err: unknown) {
//       const errorObject = err as BackendError;
//       const serverMessage = errorObject.response?.data?.message;
//       const statusCode = errorObject.response?.status;

//       if (statusCode === 429) {
//         initiateLockout(900);
//         setError(
//           serverMessage || "TOO_MANY_REQUESTS: Access temporarily locked.",
//         );
//       } else {
//         setError(serverMessage || "AUTHENTICATION_FAILED: Invalid Credentials");
//       }

//       setIsSubmitting(false);
//     }
//   };

//   const handleRecovery = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError("");
//     try {
//       await forgotPassword(email);
//       setRecoverySent(true);
//     } catch (err: unknown) {
//       const errorObject = err as BackendError;
//       setError(
//         errorObject.response?.data?.message ||
//           "Unable to process recovery request.",
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-green-darkest overflow-hidden relative">
//       {/* BACKGROUND TEXTURE (Subtle Institutional Watermark) */}
//       <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none">
//         <div className="text-[11rem] font-black leading-none transform -rotate-24 translate-y-48 translate-x-48">
//           {branding.devName.split(" ")[0]}
//         </div>
//       </div>

//       {/* LEFT SIDE: Branding & Visuals (Visible on Desktop) */}
//       <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative z-10">
//         <div className="flex items-center gap-4">
//           <div className="h-1 w-12 bg-yellow-gold rounded-full" />
//           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
//             {branding.school}
//           </span>
//         </div>

//         <div>
//           <h1 className="text-7xl font-black text-white leading-tight tracking-tighter">
//             Exams
//             <br />
//             <span className="text-5xl text-yellow-gold font-light">
//               Management System.
//             </span>
//           </h1>
//           <p className="text-white/40 max-w-md mt-6 text-sm font-medium leading-relaxed tracking-wide">
//             Access the institutional grade synchronization and curriculum
//             management protocol. Restricted to authorized coordinators only.
//           </p>
//         </div>

//         <div className="flex items-center gap-6 text-white/20">
//           <ShieldCheck size={40} strokeWidth={1} />
//           <div className="text-[9px] font-mono tracking-widest uppercase">
//             End-to-End <br /> Encryption Active
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE: The Login Terminal */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           // layout
//           className="w-full max-w-md flex flex-col items-center "
//         >
//           <div className="relative w-32 h-32 ">
//             <motion.div
//               animate={{ rotateY: 360 }}
//               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
//               className="w-full h-full"
//             >
//               <Image
//                 src={branding.institutionLogo}
//                 alt="Logo"
//                 fill
//                 className="object-contain"
//               />
//             </motion.div>
//           </div>

//           <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
//             <div className="mb-4">
//               <h2 className="text-2xl font-black text-white tracking-tight uppercase">
//                 {/* Portal Login */}
//                 {view === "login" ? "Portal Login" : "Account Recovery"}
//               </h2>
//               <div className="h-1 w-12 bg-yellow-gold mt-2 rounded-full" />
//             </div>

//             <AnimatePresence>
//               {error && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="bg-red-500/10 border-l-4 border-red-500 text-red-500 px-1 py-2 rounded-r-lg text-[10px] font-black uppercase tracking-widest mb-3"
//                 >
//                   {error}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <AnimatePresence mode="wait">
//               {view === "login" ? (
//                 <motion.form
//                   key="login"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   onSubmit={handleSubmit}
//                   className="space-y-6"
//                 >
//                   {/* EMAIL FIELD */}
//                   <div className="space-y-1">
//                     <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em] ml-1">
//                       Official Identifier
//                     </label>
//                     <div className="relative border-b border-white/10 focus-within:border-yellow-gold transition-all duration-500">
//                       <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
//                       <input
//                         type="email"
//                         id="auth_email_primary"
//                         name="auth_email_primary"
//                         disabled={isSubmitting}
//                         placeholder="name@institution.edu"
//                         className="w-full bg-transparent py-4 pl-8 pr-4 text-white text-sm outline-none placeholder:text-white/10"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         autoComplete="username"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* PASSWORD FIELD */}
//                   <div className="space-y-1">
//                     <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em] ml-1">
//                       Security Key
//                     </label>
//                     <div className="relative border-b border-white/10 focus-within:border-yellow-gold transition-all duration-500">
//                       <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         id="auth_password_primary"
//                         name="auth_password_primary"
//                         disabled={isSubmitting}
//                         placeholder="••••••••"
//                         className="w-full bg-transparent py-4 pl-8 pr-12 text-white text-sm outline-none placeholder:text-white/10"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         autoComplete="current-password"
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-yellow-gold transition-colors"
//                       >
//                         {showPassword ? (
//                           <EyeOff size={16} />
//                         ) : (
//                           <Eye size={16} />
//                         )}
//                       </button>
//                     </div>
//                   </div>                 

//                   {!isLocked ? (
//                     <>
//                     <div className="flex justify-end">
//                     <button
//                       type="button"
//                       onClick={() => setView("forgot")}
//                       className="text-[9px] font-black text-white/40 hover:text-yellow-gold uppercase tracking-widest transition-colors"
//                     >
//                       Forgot Credentials?
//                     </button>
//                   </div>
//                     <motion.div
//                       key="button"
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, scale: 0.95 }}
//                     >
//                       <CommonButton
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full py-5 bg-yellow-gold hover:bg-yellow-400 text-green-darkest font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
//                       >
//                         {isSubmitting ? (
//                           <span className="flex items-center justify-center gap-3">
//                             <Loader2 className="animate-spin" size={16} />{" "}
//                             Verifying...
//                           </span>
//                         ) : (
//                           "Establish Connection"
//                         )}
//                       </CommonButton>
//                     </motion.div>
//                     </>
//                   ) : (
//                     <motion.div
//                       key="locked"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       className="w-full py-2 bg-red-500/10 border border-red-500/20 rounded-2xl text-center"
//                     >
//                       <p className="text-white font-mono text-[10px] mt-1">
//                         {Math.floor(countdown / 60)}m {countdown % 60}s
//                         remaining
//                       </p>
//                     </motion.div>
//                   )}
//                 </motion.form>
//               ) : (
//                 <motion.form
//                   key="forgot"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   onSubmit={handleRecovery}
//                   className="space-y-6"
//                 >
//                   {!recoverySent ? (
//                     <>
//                       <p className="text-white/40 text-[11px] leading-relaxed">
//                         Enter your registered identifier to receive a recovery
//                         protocol link.
//                       </p>
//                       <div className="space-y-1">
//                         <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em]">
//                           Recovery Email
//                         </label>
//                         <input
//                           type="email"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           className="w-full bg-transparent border-b border-white/10 py-4 text-white text-sm outline-none"
//                           required
//                         />
//                       </div>
//                       <CommonButton
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full py-5 bg-yellow-gold text-green-darkest font-black uppercase tracking-[0.3em] rounded-2xl"
//                       >
//                         {isSubmitting ? "Processing..." : "Initiate Recovery"}
//                       </CommonButton>
//                     </>
//                   ) : (
//                     <div className="py-8 text-center bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
//                       <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">
//                         Protocol Dispatched
//                       </p>
//                       <p className="text-white/60 text-[11px] mt-2">
//                         Check your inbox for further instructions.
//                       </p>
//                     </div>
//                   )}
//                   <button
//                     type="button"
//                     onClick={() => setView("login")}
//                     className="flex items-center gap-2 mx-auto text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors"
//                   >
//                     <ChevronLeft size={12} /> Return to Terminal
//                   </button>
//                 </motion.form>
//               )}
//             </AnimatePresence>

//             <div className="mt-8 text-center">
//               <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
//                 Protected by {branding.school} Infrastructure <br />
//                 Internal Personnel Only
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }


//   ---- 2-step auth ----
// // clientside/src/app/login/page.tsx
// "use client";

// import Image from "next/image";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { branding } from "@/config/branding";
// import { motion, AnimatePresence } from "framer-motion";
// import { forgotPassword } from "@/api/authApi";
// import {
//   Lock,
//   Mail,
//   Eye,
//   EyeOff,
//   Loader2,
//   ShieldCheck,
//   ChevronLeft,
//   ArrowRight,
//   RotateCcw,
// } from "lucide-react";

// // ─── Types ─────────────────────────────────────────────────────────────────────

// type View = "login" | "otp" | "forgot";

// interface BackendError {
//   response?: { data?: { message?: string }; status?: number };
// }

// const LOCK_KEY = "auth_lockout_ts";

// // ─── Helpers ───────────────────────────────────────────────────────────────────

// const maskEmail = (email: string) =>
//   email.replace(/(.{2})[^@]+(@.+)/, "$1***$2");

// // ─── Component ─────────────────────────────────────────────────────────────────

// export default function LoginPage() {
//   const { loginUser, verifyOTP } = useAuth();

//   // View state
//   const [view,         setView]         = useState<View>("login");
//   const [maskedEmail,  setMaskedEmail]  = useState("");
//   const [recoverySent, setRecoverySent] = useState(false);

//   // Form state
//   const [email,    setEmail]    = useState("");
//   const [password, setPassword] = useState("");
//   const [showPw,   setShowPw]   = useState(false);
//   const [otpDigits, setOtpDigits] = useState<string[]>(["","","","","",""]);

//   // UI state
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error,        setError]        = useState("");
//   const [isLocked,     setIsLocked]     = useState(false);
//   const [countdown,    setCountdown]    = useState(0);

//   // OTP input refs for auto-focus
//   const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

//   // ── Lockout logic ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     const saved = localStorage.getItem(LOCK_KEY);
//     if (saved) {
//       const remaining = Math.floor((parseInt(saved, 10) - Date.now()) / 1000);
//       if (remaining > 0) { setIsLocked(true); setCountdown(remaining); }
//       else localStorage.removeItem(LOCK_KEY);
//     }
//   }, []);

//   useEffect(() => {
//     if (countdown <= 0) return;
//     const t = setInterval(() => {
//       setCountdown((p) => {
//         if (p <= 1) { setIsLocked(false); localStorage.removeItem(LOCK_KEY); return 0; }
//         return p - 1;
//       });
//     }, 1000);
//     return () => clearInterval(t);
//   }, [countdown]);

//   const initiateLockout = useCallback((seconds: number) => {
//     const exp = Date.now() + seconds * 1000;
//     localStorage.setItem(LOCK_KEY, exp.toString());
//     setIsLocked(true);
//     setCountdown(seconds);
//   }, []);

//   // ── Step 1: Submit credentials ────────────────────────────────────────────
//   const handleCredentials = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isLocked || isSubmitting) return;

//     setIsSubmitting(true);
//     setError("");

//     try {
//       // loginUser lives in AuthContext — no api call here
//       const result = await loginUser(email, password);

//       if (result.requiresOTP) {
//         setMaskedEmail(result.maskedEmail);
//         setView("otp");
//         // Focus first OTP box after transition
//         setTimeout(() => otpRefs.current[0]?.focus(), 350);
//       }
//     } catch (err) {
//       const e = err as BackendError;
//       const msg    = e.response?.data?.message;
//       const status = e.response?.status;

//       if (status === 429) {
//         initiateLockout(900);
//         setError(msg || "Too many attempts. Access locked for 15 minutes.");
//       } else {
//         setError(msg || "Invalid credentials.");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ── Step 2: Submit OTP ────────────────────────────────────────────────────
//   // verifyOTP lives in AuthContext — zero api calls here
//   const handleOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const code = otpDigits.join("");
//     if (code.length !== 6 || isSubmitting) return;

//     setIsSubmitting(true);
//     setError("");

//     try {
//       // Context handles POST /auth/verify-otp + /auth/me + redirect
//       await verifyOTP(code);
//       // If we reach here without redirect, context handles it
//     } catch (err) {
//       const e = err as BackendError;
//       setError(e.response?.data?.message || "Invalid or expired code.");
//       // Clear the digits so they can retry
//       setOtpDigits(["","","","","",""]);
//       setTimeout(() => otpRefs.current[0]?.focus(), 50);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ── OTP digit handlers ────────────────────────────────────────────────────
//   const handleDigitChange = (index: number, value: string) => {
//     const digit = value.replace(/\D/g, "").slice(-1);
//     const next  = [...otpDigits];
//     next[index] = digit;
//     setOtpDigits(next);

//     if (digit && index < 5) {
//       otpRefs.current[index + 1]?.focus();
//     }

//     // Auto-submit when all 6 filled
//     if (digit && index === 5 && next.every(d => d !== "")) {
//       const syntheticForm = document.getElementById("otp-form") as HTMLFormElement;
//       // Small delay so state settles
//       setTimeout(() => syntheticForm?.requestSubmit(), 80);
//     }
//   };

//   const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
//     if (e.key === "Backspace") {
//       if (otpDigits[index]) {
//         const next = [...otpDigits];
//         next[index] = "";
//         setOtpDigits(next);
//       } else if (index > 0) {
//         otpRefs.current[index - 1]?.focus();
//       }
//     }
//     if (e.key === "ArrowLeft"  && index > 0) otpRefs.current[index - 1]?.focus();
//     if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
//   };

//   // Handle paste into any OTP box
//   const handleDigitPaste = (e: React.ClipboardEvent) => {
//     e.preventDefault();
//     const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
//     if (!pasted) return;
//     const next = ["","","","","",""];
//     pasted.split("").forEach((ch, i) => { next[i] = ch; });
//     setOtpDigits(next);
//     otpRefs.current[Math.min(pasted.length, 5)]?.focus();
//   };

//   // ── Forgot password ───────────────────────────────────────────────────────
//   const handleRecovery = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError("");
//     try {
//       await forgotPassword(email);
//       setRecoverySent(true);
//     } catch (err) {
//       const e = err as BackendError;
//       setError(e.response?.data?.message || "Unable to process recovery request.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const resetToLogin = () => {
//     setView("login");
//     setOtpDigits(["","","","","",""]);
//     setError("");
//     setRecoverySent(false);
//   };

//   // ── Derived ───────────────────────────────────────────────────────────────
//   const otpComplete = otpDigits.every(d => d !== "");

//   // ─────────────────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="flex min-h-screen bg-green-darkest overflow-hidden relative">
//       {/* Background texture */}
//       <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none">
//         <div className="text-[11rem] font-black leading-none transform -rotate-24 translate-y-48 translate-x-48 text-white">
//           {branding.devName?.split(" ")[0]}
//         </div>
//       </div>

//       {/* ── Left: Branding ──────────────────────────────────────────────── */}
//       <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative z-10">
//         <div className="flex items-center gap-4">
//           <div className="h-1 w-12 bg-yellow-gold rounded-full" />
//           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
//             {branding.school}
//           </span>
//         </div>

//         <div>
//           <h1 className="text-7xl font-black text-white leading-tight tracking-tighter">
//             Exams
//             <br />
//             <span className="text-5xl text-yellow-gold font-light">
//               Management System.
//             </span>
//           </h1>
//           <p className="text-white/40 max-w-md mt-6 text-sm font-medium leading-relaxed">
//             Access the institutional grade synchronization and curriculum
//             management protocol. Restricted to authorized personnel only.
//           </p>
//         </div>

//         <div className="flex items-center gap-6 text-white/20">
//           <ShieldCheck size={40} strokeWidth={1} />
//           <div className="text-[9px] font-mono tracking-widest uppercase">
//             End-to-End <br /> Encryption Active
//           </div>
//         </div>
//       </div>

//       {/* ── Right: Auth Panel ────────────────────────────────────────────── */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="w-full max-w-md flex flex-col items-center"
//         >
//           {/* Logo */}
//           <div className="relative w-28 h-28 mb-2">
//             <motion.div
//               animate={{ rotateY: 360 }}
//               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
//               className="w-full h-full"
//             >
//               <Image
//                 src={branding.institutionLogo}
//                 alt="Logo"
//                 fill
//                 className="object-contain"
//                 priority
//               />
//             </motion.div>
//           </div>

//           {/* Card */}
//           <div className="w-full bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">

//             {/* Card header — changes per view */}
//             <div className="mb-6">
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={view}
//                   initial={{ opacity: 0, y: -8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 8 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   <h2 className="text-2xl font-black text-white tracking-tight uppercase">
//                     {view === "login" && "Portal Login"}
//                     {view === "otp"   && "Verify Identity"}
//                     {view === "forgot" && "Account Recovery"}
//                   </h2>
//                   <div className="h-1 w-12 bg-yellow-gold mt-2 rounded-full" />
//                   {view === "otp" && (
//                     <p className="text-[10px] text-white/40 uppercase tracking-widest mt-3">
//                       Code sent to{" "}
//                       <span className="text-yellow-gold/70">{maskedEmail}</span>
//                     </p>
//                   )}
//                 </motion.div>
//               </AnimatePresence>
//             </div>

//             {/* Error banner */}
//             <AnimatePresence>
//               {error && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-3 py-2 rounded-r-lg text-[10px] font-black uppercase tracking-widest mb-4"
//                 >
//                   {error}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* ── Forms ──────────────────────────────────────────────────── */}
//             <AnimatePresence mode="wait">

//               {/* ── VIEW: Login ──────────────────────────────────────────── */}
//               {view === "login" && (
//                 <motion.form
//                   key="login"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: 20 }}
//                   transition={{ duration: 0.25 }}
//                   onSubmit={handleCredentials}
//                   className="space-y-6"
//                 >
//                   {/* Email */}
//                   <div className="space-y-1">
//                     <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em] ml-1">
//                       Official Identifier
//                     </label>
//                     <div className="relative border-b border-white/10 focus-within:border-yellow-gold transition-all duration-500">
//                       <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
//                       <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="name@institution.edu"
//                         disabled={isSubmitting}
//                         autoComplete="username"
//                         required
//                         className="w-full bg-transparent py-4 pl-8 pr-4 text-white text-sm outline-none placeholder:text-white/10"
//                       />
//                     </div>
//                   </div>

//                   {/* Password */}
//                   <div className="space-y-1">
//                     <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em] ml-1">
//                       Security Key
//                     </label>
//                     <div className="relative border-b border-white/10 focus-within:border-yellow-gold transition-all duration-500">
//                       <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
//                       <input
//                         type={showPw ? "text" : "password"}
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="••••••••"
//                         disabled={isSubmitting}
//                         autoComplete="current-password"
//                         required
//                         className="w-full bg-transparent py-4 pl-8 pr-12 text-white text-sm outline-none placeholder:text-white/10"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPw(!showPw)}
//                         className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-yellow-gold transition-colors"
//                       >
//                         {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex justify-end">
//                     <button
//                       type="button"
//                       onClick={() => { setView("forgot"); setError(""); }}
//                       className="text-[9px] font-black text-white/40 hover:text-yellow-gold uppercase tracking-widest transition-colors"
//                     >
//                       Forgot Credentials?
//                     </button>
//                   </div>

//                   {/* Submit / Lockout */}
//                   {isLocked ? (
//                     <div className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
//                       <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
//                         Locked
//                       </p>
//                       <p className="text-white font-mono text-sm mt-1">
//                         {Math.floor(countdown / 60)}m {countdown % 60}s remaining
//                       </p>
//                     </div>
//                   ) : (
//                     <button
//                       type="submit"
//                       disabled={isSubmitting}
//                       className="w-full py-5 bg-yellow-gold hover:bg-yellow-400 text-green-darkest font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
//                     >
//                       {isSubmitting ? (
//                         <>
//                           <Loader2 className="animate-spin" size={16} />
//                           Verifying...
//                         </>
//                       ) : (
//                         <>
//                           Establish Connection
//                           <ArrowRight size={16} />
//                         </>
//                       )}
//                     </button>
//                   )}
//                 </motion.form>
//               )}

//               {/* ── VIEW: OTP ────────────────────────────────────────────── */}
//               {view === "otp" && (
//                 <motion.form
//                   key="otp"
//                   id="otp-form"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   transition={{ duration: 0.25 }}
//                   onSubmit={handleOTP}
//                   className="space-y-8"
//                 >
//                   {/* Shield icon */}
//                   <div className="flex justify-center">
//                     <motion.div
//                       initial={{ scale: 0.8 }}
//                       animate={{ scale: 1 }}
//                       className="w-16 h-16 rounded-2xl bg-yellow-gold/10 border border-yellow-gold/20 flex items-center justify-center"
//                     >
//                       <ShieldCheck size={32} className="text-yellow-gold" strokeWidth={1.5} />
//                     </motion.div>
//                   </div>

//                   <p className="text-white/50 text-[11px] text-center leading-relaxed">
//                     Enter the 6-digit code from your email to complete login.
//                   </p>

//                   {/* 6 individual digit boxes */}
//                   <div className="flex gap-2 justify-center" onPaste={handleDigitPaste}>
//                     {otpDigits.map((digit, i) => (
//                       <motion.input
//                         key={i}
//                         ref={(el) => { otpRefs.current[i] = el; }}
//                         type="text"
//                         inputMode="numeric"
//                         maxLength={1}
//                         value={digit}
//                         onChange={(e) => handleDigitChange(i, e.target.value)}
//                         onKeyDown={(e) => handleDigitKeyDown(i, e)}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: i * 0.05 }}
//                         className={`
//                           w-11 h-14 text-center text-white text-xl font-black rounded-xl
//                           border transition-all duration-200 outline-none
//                           bg-white/5 caret-yellow-gold
//                           ${digit
//                             ? "border-yellow-gold bg-yellow-gold/10 shadow-[0_0_12px_rgba(201,162,39,0.15)]"
//                             : "border-white/10 focus:border-yellow-gold/50"
//                           }
//                         `}
//                       />
//                     ))}
//                   </div>

//                   {/* Submit */}
//                   <button
//                     type="submit"
//                     disabled={!otpComplete || isSubmitting}
//                     className="w-full py-5 bg-yellow-gold hover:bg-yellow-400 text-green-darkest font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="animate-spin" size={16} />
//                         Confirming...
//                       </>
//                     ) : (
//                       <>
//                         <ShieldCheck size={16} />
//                         Confirm Identity
//                       </>
//                     )}
//                   </button>

//                   {/* Resend + back */}
//                   <div className="flex items-center justify-between">
//                     <button
//                       type="button"
//                       onClick={resetToLogin}
//                       className="flex items-center gap-2 text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors"
//                     >
//                       <ChevronLeft size={12} />
//                       Back to login
//                     </button>
//                     <button
//                       type="button"
//                       disabled={isSubmitting}
//                       onClick={async () => {
//                         // Resend — just go back to step 1 and resubmit
//                         // which triggers a new OTP send
//                         setOtpDigits(["","","","","",""]);
//                         setError("");
//                         setIsSubmitting(true);
//                         try {
//                           await loginUser(email, password);
//                         } catch {
//                           setError("Could not resend code. Please log in again.");
//                           setView("login");
//                         } finally {
//                           setIsSubmitting(false);
//                           setTimeout(() => otpRefs.current[0]?.focus(), 100);
//                         }
//                       }}
//                       className="flex items-center gap-2 text-[9px] font-black text-white/20 hover:text-yellow-gold uppercase tracking-widest transition-colors disabled:opacity-30"
//                     >
//                       <RotateCcw size={12} />
//                       Resend code
//                     </button>
//                   </div>
//                 </motion.form>
//               )}

//               {/* ── VIEW: Forgot Password ─────────────────────────────────── */}
//               {view === "forgot" && (
//                 <motion.form
//                   key="forgot"
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   transition={{ duration: 0.25 }}
//                   onSubmit={handleRecovery}
//                   className="space-y-6"
//                 >
//                   {!recoverySent ? (
//                     <>
//                       <p className="text-white/40 text-[11px] leading-relaxed">
//                         Enter your registered email to receive a password reset link.
//                       </p>
//                       <div className="space-y-1">
//                         <label className="text-[9px] font-black text-yellow-gold uppercase tracking-[0.3em]">
//                           Recovery Email
//                         </label>
//                         <input
//                           type="email"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           required
//                           className="w-full bg-transparent border-b border-white/10 focus:border-yellow-gold py-4 text-white text-sm outline-none transition-colors"
//                         />
//                       </div>
//                       <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full py-5 bg-yellow-gold text-green-darkest font-black uppercase tracking-[0.3em] rounded-2xl disabled:opacity-50"
//                       >
//                         {isSubmitting ? "Processing..." : "Initiate Recovery"}
//                       </button>
//                     </>
//                   ) : (
//                     <div className="py-8 text-center bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
//                       <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">
//                         Recovery Link Sent
//                       </p>
//                       <p className="text-white/60 text-[11px] mt-2">
//                         Check your inbox for further instructions.
//                       </p>
//                     </div>
//                   )}

//                   <button
//                     type="button"
//                     onClick={resetToLogin}
//                     className="flex items-center gap-2 mx-auto text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors"
//                   >
//                     <ChevronLeft size={12} />
//                     Return to login
//                   </button>
//                 </motion.form>
//               )}

//             </AnimatePresence>

//             {/* Footer */}
//             <div className="mt-8 text-center">
//               <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
//                 Protected by {branding.school} Infrastructure <br />
//                 Internal Personnel Only
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// ---------- 3-step auth ---

// clientside/src/app/login/page.tsx
// 3-Step login: Email → Password → OTP
// All API calls via AuthContext. Zero direct api imports.
"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { branding } from "@/config/branding";
import { motion, AnimatePresence } from "framer-motion";
import { forgotPassword } from "@/api/authApi";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  RotateCcw,
  User,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type View = "email" | "password" | "otp" | "forgot";

interface BackendError {
  response?: { data?: { message?: string }; status?: number };
}

const LOCK_KEY = "auth_lockout_ts";

// ─── Step indicator ─────────────────────────────────────────────────────────────

const StepDots = ({ current }: { current: number }) => (
  <div className="flex items-center gap-2 justify-center mb-6">
    {[1, 2, 3].map((step) => (
      <div key={step} className="flex items-center gap-2">
        <motion.div
          animate={{
            width:      step <= current ? 24 : 8,
            background: step < current
              ? "#c9a227"
              : step === current
              ? "#c9a227"
              : "rgba(255,255,255,0.15)",
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="h-2 rounded-full"
        />
        {step < 3 && (
          <div
            className="h-px w-4 rounded-full transition-all duration-500"
            style={{
              background: step < current
                ? "#c9a227"
                : "rgba(255,255,255,0.1)",
            }}
          />
        )}
      </div>
    ))}
  </div>
);

// ─── View titles ────────────────────────────────────────────────────────────────

const VIEW_META: Record<View, { step: number; title: string; sub: string }> = {
  email:    { step: 1, title: "Sign In",        sub: "Enter your registered email" },
  password: { step: 2, title: "Authenticate",   sub: "Enter your password"         },
  otp:      { step: 3, title: "Verify Identity",sub: "Enter the code from your email" },
  forgot:   { step: 0, title: "Recovery",       sub: "Reset your access credentials" },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { checkEmail, verifyPassword, verifyOTP } = useAuth();

  // View
  const [view,         setView]         = useState<View>("email");
  const [maskedName,   setMaskedName]   = useState("");
  const [maskedEmail,  setMaskedEmail]  = useState("");
  const [emailValue,   setEmailValue]   = useState(""); // carry email across steps
  const [recoverySent, setRecoverySent] = useState(false);

  // Form
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [otpDigits,  setOtpDigits]  = useState(["","","","","",""]);

  // UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState("");
  const [isLocked,     setIsLocked]     = useState(false);
  const [countdown,    setCountdown]    = useState(0);

  // OTP refs
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ── Lockout ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(LOCK_KEY);
    if (!saved) return;
    const remaining = Math.floor((parseInt(saved) - Date.now()) / 1000);
    if (remaining > 0) { setIsLocked(true); setCountdown(remaining); }
    else localStorage.removeItem(LOCK_KEY);
  }, []);

  useEffect(() => {
    if (!countdown) return;
    const t = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { setIsLocked(false); localStorage.removeItem(LOCK_KEY); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const lockout = useCallback((secs: number) => {
    localStorage.setItem(LOCK_KEY, (Date.now() + secs * 1000).toString());
    setIsLocked(true);
    setCountdown(secs);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const handleError = (err: unknown, defaultMsg: string) => {
    const e = err as BackendError;
    const status = e.response?.status;
    const msg    = e.response?.data?.message || defaultMsg;

    if (status === 429 || status === 423) {
      lockout(status === 423 ? 15 * 60 : 900);
    }
    setError(msg);
  };

  const goTo = (v: View) => { setView(v); setError(""); };

  // ── STEP 1: Email ─────────────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const result = await checkEmail(emailValue);
      setMaskedName(result.maskedName || "");
      goTo("password");
    } catch (err) {
      handleError(err, "Unable to process request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── STEP 2: Password ──────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const result = await verifyPassword(password);
      setMaskedEmail(result.maskedEmail);
      setPassword(""); // clear password from memory
      goTo("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 350);
    } catch (err) {
      handleError(err, "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── STEP 3: OTP ───────────────────────────────────────────────────────────
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6 || isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      // verifyOTP handles /verify-otp + /me + redirect
      await verifyOTP(code);
    } catch (err) {
      handleError(err, "Invalid or expired code.");
      setOtpDigits(["","","","","",""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP digit helpers
  const handleDigit = (i: number, val: string) => {
    const d    = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[i]    = d;
    setOtpDigits(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
    if (d && i === 5 && next.every(x => x)) {
      setTimeout(() => (document.getElementById("otp-form") as HTMLFormElement)?.requestSubmit(), 80);
    }
  };

  const handleDigitKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otpDigits[i]) { const n = [...otpDigits]; n[i] = ""; setOtpDigits(n); }
      else if (i > 0)    otpRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft"  && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["","","","","",""];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // Resend OTP — restart from password step
  const handleResend = async () => {
    if (isSubmitting) return;
    setOtpDigits(["","","","","",""]);
    setError("");
    setIsSubmitting(true);
    try {
      // We need to re-run step1 + step2 — but we don't have the password anymore
      // (we cleared it for security). Send user back to password step.
      goTo("password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot password
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await forgotPassword(emailValue);
      setRecoverySent(true);
    } catch (err) {
      handleError(err, "Unable to process recovery request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const meta        = VIEW_META[view];
  const otpComplete = otpDigits.every(d => d !== "");
  const showSteps   = view !== "forgot";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-green-darkest overflow-hidden relative font-sans">

       {/* BACKGROUND TEXTURE (Subtle Institutional Watermark) */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none">
         <div className="text-[11rem] font-black leading-none transform -rotate-24 translate-y-48 translate-x-48">
          {branding.devName.split(" ")[0]}
         </div>
      </div>

      {/* ── Left: Branding ────────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-px w-10 bg-yellow-gold" />
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">
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

      {/* ── Right: Auth Panel ──────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[420px]">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="relative w-20 h-20">
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="w-full h-full"
              >
                <Image
                  src={branding.institutionLogo}
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/[0.08] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Card top bar */}
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-gold/40 to-transparent" />

            <div className="p-8">

              {/* Step dots */}
              {showSteps && <StepDots current={meta.step} />}

              {/* Title */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={view + "-title"}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6 text-center"
                >
                  <h2 className="text-xl font-black text-white tracking-tight">
                    {meta.title}
                  </h2>
                  <p className="text-[11px] text-white/30 mt-1 uppercase tracking-widest">
                    {meta.sub}
                  </p>
                  {view === "otp" && (
                    <p className="text-[10px] text-yellow-gold/60 mt-2">
                      Code sent to{" "}
                      <span className="font-bold">{maskedEmail}</span>
                    </p>
                  )}
                  {view === "password" && maskedName && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className="w-7 h-7 rounded-full bg-yellow-gold/10 border border-yellow-gold/20 flex items-center justify-center">
                        <User size={14} className="text-yellow-gold" />
                      </div>
                      <span className="text-[11px] text-white/50">
                        Welcome back,{" "}
                        <span className="text-white font-bold">{maskedName}</span>
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-[11px] text-red-400 font-bold"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Forms ────────────────────────────────────────────────── */}
              <AnimatePresence mode="wait">

                {/* STEP 1: Email */}
                {view === "email" && (
                  <motion.form
                    key="email-form"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleEmailSubmit}
                    className="space-y-5"
                  >
                    {/* Honeypot — hidden from real users, attracts bots */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      className="absolute -left-[9999px] opacity-0 pointer-events-none"
                      aria-hidden="true"
                    />

                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                      />
                      <input
                        type="email"
                        value={emailValue}
                        onChange={e => setEmailValue(e.target.value)}
                        placeholder="your@institution.edu"
                        autoComplete="username"
                        required
                        disabled={isSubmitting}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-white/20 outline-none focus:border-yellow-gold/40 transition-all"
                      />
                    </div>

                    {isLocked ? (
                      <div className="w-full py-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                          Locked · {Math.floor(countdown / 60)}m {countdown % 60}s
                        </p>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || !emailValue}
                        className="w-full py-3.5 bg-yellow-gold hover:bg-yellow-300 text-green-darkest font-black text-[11px] uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="animate-spin" size={15} /> Checking...</>
                        ) : (
                          <>Continue <ArrowRight size={15} /></>
                        )}
                      </button>
                    )}

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => goTo("forgot")}
                        className="text-[10px] text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors"
                      >
                        Forgot credentials?
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* STEP 2: Password */}
                {view === "password" && (
                  <motion.form
                    key="password-form"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handlePasswordSubmit}
                    className="space-y-5"
                  >
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                      />
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••"
                        autoComplete="current-password"
                        autoFocus
                        required
                        disabled={isSubmitting}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white text-sm placeholder:text-white/20 outline-none focus:border-yellow-gold/40 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-yellow-gold transition-colors"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {isLocked ? (
                      <div className="w-full py-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                          Locked · {Math.floor(countdown / 60)}m {countdown % 60}s
                        </p>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || !password}
                        className="w-full py-3.5 bg-yellow-gold hover:bg-yellow-300 text-green-darkest font-black text-[11px] uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="animate-spin" size={15} /> Verifying...</>
                        ) : (
                          <>Verify &amp; Send Code <ShieldCheck size={15} /></>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => { goTo("email"); setPassword(""); }}
                      className="flex items-center gap-1.5 mx-auto text-[10px] text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors"
                    >
                      <ChevronLeft size={12} /> Back
                    </button>
                  </motion.form>
                )}

                {/* STEP 3: OTP */}
                {view === "otp" && (
                  <motion.form
                    key="otp-form"
                    id="otp-form"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleOTPSubmit}
                    className="space-y-6"
                  >
                    {/* Shield */}
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-14 h-14 rounded-2xl bg-yellow-gold/10 border border-yellow-gold/20 flex items-center justify-center"
                      >
                        <ShieldCheck size={28} className="text-yellow-gold" strokeWidth={1.5} />
                      </motion.div>
                    </div>

                    {/* 6-digit boxes */}
                    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                      {otpDigits.map((d, i) => (
                        <motion.input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={e => handleDigit(i, e.target.value)}
                          onKeyDown={e => handleDigitKey(i, e)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.2 }}
                          className={`
                            w-11 h-14 text-center text-lg font-black rounded-xl border
                            outline-none transition-all duration-200 text-white caret-yellow-gold
                            ${d
                              ? "border-yellow-gold bg-yellow-gold/10 shadow-[0_0_16px_rgba(201,162,39,0.12)]"
                              : "bg-white/[0.04] border-white/10 focus:border-yellow-gold/40"
                            }
                          `}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={!otpComplete || isSubmitting}
                      className="w-full py-3.5 bg-yellow-gold hover:bg-yellow-300 text-green-darkest font-black text-[11px] uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin" size={15} /> Confirming...</>
                      ) : (
                        <><ShieldCheck size={15} /> Confirm Identity</>
                      )}
                    </button>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => { goTo("password"); setOtpDigits(["","","","","",""]); }}
                        className="flex items-center gap-1.5 text-[10px] text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors"
                      >
                        <ChevronLeft size={12} /> Back
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleResend}
                        className="flex items-center gap-1.5 text-[10px] text-white/20 hover:text-yellow-gold uppercase tracking-widest transition-colors disabled:opacity-30"
                      >
                        <RotateCcw size={11} /> Resend
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Forgot Password */}
                {view === "forgot" && (
                  <motion.form
                    key="forgot-form"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleForgot}
                    className="space-y-5"
                  >
                    {!recoverySent ? (
                      <>
                        <p className="text-[11px] text-white/30 text-center leading-relaxed">
                          Enter your email to receive a secure password reset link.
                        </p>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                          <input
                            type="email"
                            value={emailValue}
                            onChange={e => setEmailValue(e.target.value)}
                            placeholder="your@institution.edu"
                            required
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-white/20 outline-none focus:border-yellow-gold/40 transition-all"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3.5 bg-yellow-gold hover:bg-yellow-300 text-green-darkest font-black text-[11px] uppercase tracking-[0.25em] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? <><Loader2 className="animate-spin" size={15} /> Sending...</> : "Send Reset Link"}
                        </button>
                      </>
                    ) : (
                      <div className="py-8 text-center bg-emerald-500/[0.08] rounded-2xl border border-emerald-500/20">
                        <div className="text-2xl mb-3">📬</div>
                        <p className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                          Link Sent
                        </p>
                        <p className="text-white/40 text-[11px] mt-2">
                          Check your inbox for the reset link.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => { goTo("email"); setRecoverySent(false); }}
                      className="flex items-center gap-1.5 mx-auto text-[10px] text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors"
                    >
                      <ChevronLeft size={12} /> Back to login
                    </button>
                  </motion.form>
                )}

              </AnimatePresence>
            </div>

            {/* Card bottom bar */}
            <div className="px-8 py-4 border-t border-white/[0.05] text-center">
              <p className="text-[9px] text-white/15 uppercase tracking-[0.25em]">
                {branding.school} · Internal Personnel Only
              </p>
            </div>
          </motion.div>

          
        </div>
      </div>
    </div>
  );
}