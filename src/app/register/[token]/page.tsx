// src/app/register/[token]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { registerWithInvite } from "@/api/authApi";
import {
  Eye, EyeOff, ShieldCheck, LockKeyhole, Loader2, ChevronRight
} from "lucide-react";

export default function InviteRegisterPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await registerWithInvite(token, password);
      setIsError(false);
      setMessage(res.message || "Account activated successfully!");
      
      // Short delay for the user to read the success message
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setIsError(true);
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full bg-white/[0.02] border border-white/10 rounded py-2 pl-11 pr-12 " +
    "text-white placeholder:text-slate-600 outline-none " +
    "focus:border-lime-500/50 focus:bg-white/[0.05] transition-all font-mono text-sm";

  const labelStyle =
    "text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold ml-1";

  const iconStyle =
    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 " +
    "group-focus-within:text-lime-400 transition-colors";

  return (
    <div className="min-h-screen bg-[#050a02] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Ambient Background Radiance */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-green-900/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-lime-900/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[460px] z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded p-10 shadow-2xl">
          
          {/* Visual Header */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-lime-500/10 rounded-2xl mb-4 border border-lime-500/20">
              <ShieldCheck className="w-8 h-8 text-lime-400" />
            </div>
            <h1 className="text-3xl font-light tracking-tight text-white">
              Activate <span className="font-semibold text-lime-400">Account</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-light italic">
              Finalize your security credentials
            </p>
          </header>

          {/* Status Notifications */}
          {message && (
            <div
              className={`mb-8 p-4 rounded-lg text-xs text-center border animate-in slide-in-from-top-2 ${
                isError
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-green-500/10 border-green-500/20 text-green-400"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div className="group space-y-2">
              <label className={labelStyle}>Secure Password</label>
              <div className="relative">
                <LockKeyhole className={iconStyle} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputBase}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="group space-y-2">
              <label className={labelStyle}>Verify Password</label>
              <div className="relative">
                <LockKeyhole className={iconStyle} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputBase}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-black font-black uppercase tracking-widest text-[11px] rounded transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(163,230,53,0.15)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    Initialize Identity
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-600 font-medium tracking-[0.1em] uppercase">
              Secure Link Verification Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
