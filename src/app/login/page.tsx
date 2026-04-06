
// clientside/src/app/login/page.tsx
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

type View = "email" | "password" | "otp" | "forgot";

interface BackendError {
  response?: { data?: { message?: string }; status?: number };
}

const LOCK_KEY = "auth_lockout_ts";

const StepDots = ({ current }: { current: number }) => (
  <div className="flex items-center gap-2 justify-center mb-6">
    {[1, 2, 3].map((step) => (
      <div key={step} className="flex items-center gap-2">
        <motion.div
          animate={{
            width: step <= current ? 24 : 8,
            background: step <= current ? "#c9a227" : "rgba(255,255,255,0.15)",
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="h-2 rounded-full"
        />
        {step < 3 && (
          <div
            className="h-px w-4 rounded-full transition-all duration-500"
            style={{
              background: step < current ? "#c9a227" : "rgba(255,255,255,0.1)",
            }}
          />
        )}
      </div>
    ))}
  </div>
);

const VIEW_META: Record<
  View,
  { step: number; cardTitle: string; subtitle: string }
> = {
  email: {
    step: 1,
    cardTitle: "Portal Login",
    subtitle: "Enter your registered email",
  },
  password: {
    step: 2,
    cardTitle: "Portal Login",
    subtitle: "Enter your security key",
  },
  otp: {
    step: 3,
    cardTitle: "Verify Identity",
    subtitle: "Enter the code from your email",
  },
  forgot: {
    step: 0,
    cardTitle: "Account Recovery",
    subtitle: "Reset your access credentials",
  },
};

export default function LoginPage() {
  const { checkEmail, verifyPassword, verifyOTP } = useAuth();

  const [view, setView] = useState<View>("email");
  const [maskedName, setMaskedName] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // ── NEW: success overlay state ─────────────────────────────────────────────
  // When OTP succeeds we immediately cover the page with this overlay so the
  // user sees "Logging in..." rather than a frozen login form.
  const [loginSuccess, setLoginSuccess] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ── Lockout persistence ───────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(LOCK_KEY);
    if (!saved) return;
    const remaining = Math.floor((parseInt(saved) - Date.now()) / 1000);
    if (remaining > 0) {
      setIsLocked(true);
      setCountdown(remaining);
    } else localStorage.removeItem(LOCK_KEY);
  }, []);

  useEffect(() => {
    if (!countdown) return;
    const t = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) {
          setIsLocked(false);
          localStorage.removeItem(LOCK_KEY);
          return 0;
        }
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

  const handleError = (err: unknown, defaultMsg: string) => {
    const e = err as BackendError;
    const status = e.response?.status;
    const msg = e.response?.data?.message || defaultMsg;
    if (status === 429 || status === 423)
      lockout(status === 423 ? 15 * 60 : 900);
    setError(msg);
  };

  const goTo = (v: View) => {
    setView(v);
    setError("");
  };

  // ── Step 1 ────────────────────────────────────────────────────────────────
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

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const result = await verifyPassword(password);
      setMaskedEmail(result.maskedEmail);
      setPassword("");
      goTo("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 350);
    } catch (err) {
      handleError(err, "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 3 ────────────────────────────────────────────────────────────────
  // On success: immediately show the full-screen overlay, THEN let the
  // AuthContext do the hard navigation. The overlay appears in < 16 ms.
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6 || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      // Show overlay immediately — before navigation fires
      setLoginSuccess(true);
      // verifyOTP does window.location.href internally — page unloads after this
      await verifyOTP(code);
    } catch (err) {
      // If OTP fails, hide the overlay and show the error
      setLoginSuccess(false);
      setIsSubmitting(false);
      handleError(err, "Invalid or expired code.");
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
    // Note: setIsSubmitting(false) is intentionally NOT in finally here.
    // On success the page will unload (window.location.href), so we don't
    // need to reset it. Resetting it would briefly flash the form before
    // the page leaves, which looks wrong.
  };

  // ── OTP digit helpers ─────────────────────────────────────────────────────
  const handleDigit = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[i] = d;
    setOtpDigits(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
    if (d && i === 5 && next.every((x) => x)) {
      setTimeout(
        () =>
          (
            document.getElementById("otp-form") as HTMLFormElement
          )?.requestSubmit(),
        80,
      );
    }
  };

  const handleDigitKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otpDigits[i]) {
        const n = [...otpDigits];
        n[i] = "";
        setOtpDigits(n);
      } else if (i > 0) otpRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((ch, idx) => {
      next[idx] = ch;
    });
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = () => {
    if (isSubmitting) return;
    setOtpDigits(["", "", "", "", "", ""]);
    setError("");
    goTo("password");
  };

  // ── Forgot password ───────────────────────────────────────────────────────
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

  const meta = VIEW_META[view];
  const otpComplete = otpDigits.every((d) => d !== "");
  const showSteps = view !== "forgot";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-green-darkest overflow-hidden relative font-sans">
      {/* ── SUCCESS OVERLAY ─────────────────────────────────────────────────
          Appears immediately when OTP is verified. Sits above everything.
          The page will unload via window.location.href while this is showing.
      ──────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] bg-green-darkest flex flex-col items-center justify-center gap-6"
          >
            {/* Spinning logo */}
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="relative w-24 h-24"
            >
              <Image
                src={branding.institutionLogo}
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Pulse ring */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute w-16 h-16 rounded-full bg-yellow-gold/20"
              />
              <ShieldCheck
                size={32}
                className="text-yellow-gold relative z-10"
              />
            </div>

            <div className="text-center">
              <p className="text-white font-black text-lg uppercase tracking-widest">
                Identity Verified
              </p>
              <p className="text-white/30 text-[11px] uppercase tracking-widest mt-1">
                Preparing your dashboard...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none">
        <div className="text-[11rem] font-black leading-none transform -rotate-24 translate-y-48 translate-x-48">
          {branding.devName.split(" ")[0]}
        </div>
      </div>

      {/* ── Left branding panel ──────────────────────────────────────────── */}
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

      {/* ── Right auth panel ─────────────────────────────────────────────── */}
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
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-gold/40 to-transparent" />

            <div className="p-8">
              {/* Card heading */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={view + "-header"}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                >
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                    {meta.cardTitle}
                  </h2>
                  <div className="h-1 w-12 bg-yellow-gold mt-2 rounded-full" />
                </motion.div>
              </AnimatePresence>

              {showSteps && <StepDots current={meta.step} />}

              <AnimatePresence mode="wait">
                <motion.div
                  key={view + "-title"}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6 text-center"
                >
                  <p className="text-[11px] text-white/30 mt-1 uppercase tracking-widest">
                    {meta.subtitle}
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
                        <span className="text-white font-bold">
                          {maskedName}
                        </span>
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error banner */}
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

              {/* ── Forms ──────────────────────────────────────────────── */}
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
                        onChange={(e) => setEmailValue(e.target.value)}
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
                          Locked · {Math.floor(countdown / 60)}m{" "}
                          {countdown % 60}s
                        </p>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || !emailValue}
                        className="w-full py-3.5 bg-yellow-gold hover:bg-yellow-300 text-green-darkest font-black text-[11px] uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={15} />{" "}
                            Checking...
                          </>
                        ) : (
                          <>
                            Continue <ArrowRight size={15} />
                          </>
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
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••"
                        autoComplete="current-password"
                        autoFocus
                        required
                        disabled={isSubmitting}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-white text-sm placeholder:text-white/20 outline-none focus:border-yellow-gold/40 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-yellow-gold transition-colors"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {isLocked ? (
                      <div className="w-full py-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                          Locked · {Math.floor(countdown / 60)}m{" "}
                          {countdown % 60}s
                        </p>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || !password}
                        className="w-full py-3.5 bg-yellow-gold hover:bg-yellow-300 text-green-darkest font-black text-[11px] uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={15} />{" "}
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify &amp; Send Code <ShieldCheck size={15} />
                          </>
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        goTo("email");
                        setPassword("");
                      }}
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
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="w-14 h-14 rounded-2xl bg-yellow-gold/10 border border-yellow-gold/20 flex items-center justify-center"
                      >
                        <ShieldCheck
                          size={28}
                          className="text-yellow-gold"
                          strokeWidth={1.5}
                        />
                      </motion.div>
                    </div>
                    <div
                      className="flex gap-2 justify-center"
                      onPaste={handlePaste}
                    >
                      {otpDigits.map((d, i) => (
                        <motion.input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleDigit(i, e.target.value)}
                          onKeyDown={(e) => handleDigitKey(i, e)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.2 }}
                          className={`w-11 h-14 text-center text-lg font-black rounded-xl border outline-none transition-all duration-200 text-white caret-yellow-gold ${
                            d
                              ? "border-yellow-gold bg-yellow-gold/10 shadow-[0_0_16px_rgba(201,162,39,0.12)]"
                              : "bg-white/[0.04] border-white/10 focus:border-yellow-gold/40"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={!otpComplete || isSubmitting}
                      className="w-full py-3.5 bg-yellow-gold hover:bg-yellow-300 text-green-darkest font-black text-[11px] uppercase tracking-[0.25em] rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={15} />{" "}
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={15} /> Confirm Identity
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          goTo("password");
                          setOtpDigits(["", "", "", "", "", ""]);
                        }}
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
                          Enter your email to receive a secure password reset
                          link.
                        </p>
                        <div className="relative">
                          <Mail
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                          />
                          <input
                            type="email"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
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
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin" size={15} />{" "}
                              Sending...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
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
                      onClick={() => {
                        goTo("email");
                        setRecoverySent(false);
                      }}
                      className="flex items-center gap-1.5 mx-auto text-[10px] text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors"
                    >
                      <ChevronLeft size={12} /> Back to login
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

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