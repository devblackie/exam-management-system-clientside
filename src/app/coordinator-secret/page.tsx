// clientside/src/app/coordinator-secret/page.tsx


"use client";

// clientside/src/app/coordinator-secret/page.tsx
//
// ── STANDALONE PUBLIC PAGE ────────────────────────────────────────────────
// This page is intentionally auth-free. It must work on a fresh database
// with zero registered users. Do NOT wrap it in ProtectedRoute.
// Do NOT call useAuth() here.
//
// The layout for this route (app/coordinator-secret/layout.tsx) should be
// a simple pass-through:
//
//   export default function Layout({ children }: { children: React.ReactNode }) {
//     return <>{children}</>;
//   }
//
// If you do not have that layout file, create it. Any parent layout that
// uses ProtectedRoute will cause this page to redirect.

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/config/axiosInstance";
import { getErrorMessage } from "@/lib/api";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  User,
  Building2,
  KeyRound,
  Loader2,
} from "lucide-react";
import { getPublicInstitutions } from "@/api/institutionsApi";

interface Institution {
  _id: string;
  name: string;
  code: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CoordinatorSecretRegisterPage() {
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchInstitutions = async () => {
      setFetching(true);
      try {
        const data = await getPublicInstitutions();
        setInstitutions(data);
        if (data.length === 1) setInstitutionId(data[0]._id);
      } catch (err) {
        setMessage("Service unavailable. Please try again later.");
      } finally {
        setFetching(false);
      }
    };
    fetchInstitutions();
  }, []);

  // ── Form submission ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!institutionId.trim()) {
      setIsError(true);
      setMessage("Please select or enter an institution.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      await api.post("/coordinator/secret-register", {
        secret,
        name,
        email: email.toLowerCase().trim(),
        password,
        institutionId: institutionId.trim(),
      });
      setIsError(false);
      setMessage("Account created successfully. Redirecting to login...");
      
      
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setIsError(true);
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full bg-white/[0.02] border border-white/10 rounded py-2 pl-11 pr-4 " +
    "text-white placeholder:text-slate-600 outline-none " +
    "focus:border-lime-500/50 focus:bg-white/[0.05] transition-all";

  const labelStyle =
    "text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold ml-1";

  const iconStyle =
    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 " +
    "group-focus-within:text-lime-400 transition-colors";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050a02] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lime-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[480px] z-10">
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded p-10 shadow-2xl">
          {/* Header */}
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-lime-500/10 rounded-2xl mb-4 border border-lime-500/20">
              <ShieldCheck className="w-8 h-8 text-lime-400" />
            </div>
            <h1 className="text-3xl font-light tracking-tight text-white">
              Coordinator{" "}
              <span className="font-semibold text-lime-400">Portal</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-light italic">
              Secure registration for departmental coordinators
            </p>
          </header>

          {/* Message banner */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm text-center border ${
                isError
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-green-500/10 border-green-500/20 text-green-400"
              }`}
            >
              {message}
            </div>
          )}

          {/* Loading institutions */}
          {fetching ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
              <p className="text-slate-500 text-sm">Loading institutions...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Secret key */}
              <div className="group space-y-2">
                <label className={labelStyle}>Registration Key</label>
                <div className="relative">
                  <KeyRound className={iconStyle} />
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Provided by system administrator"
                    className={inputBase}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Full name */}
              <div className="group space-y-2">
                <label className={labelStyle}>Full Name</label>
                <div className="relative">
                  <User className={iconStyle} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Jane Doe"
                    className={inputBase}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="group space-y-2">
                <label className={labelStyle}>Official Email</label>
                <div className="relative">
                  <Mail className={iconStyle} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.edu"
                    className={inputBase}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group space-y-2">
                <label className={labelStyle}>Secure Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputBase}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Institution — dropdown if available, text input as fallback */}
              <div className="group space-y-2">
                <label className={labelStyle}>Institution / Department</label>
                <div className="relative">
                  <Building2 className={iconStyle} />

                  {institutions.length > 0 ? (
                    <select
                      value={institutionId}
                      onChange={(e) => setInstitutionId(e.target.value)}
                      className="w-full bg-[#0a1205] border border-white/10 rounded py-2 pl-11 pr-10 text-white outline-none focus:border-lime-500/50 appearance-none transition-all cursor-pointer"
                      required
                    >
                      <option value="" className="text-slate-800">
                        Select Department
                      </option>
                      {institutions.map((inst) => (
                        <option
                          key={inst._id}
                          value={inst._id}
                          className="bg-[#0a1205] text-white"
                        >
                          {inst.name}
                          {/* {inst.code ? ` (${inst.code})` : ""} */}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // Fallback: paste the institution ObjectId manually
                    <input
                      type="text"
                      value={institutionId}
                      onChange={(e) => setInstitutionId(e.target.value)}
                      placeholder="Institution"
                      className={inputBase}
                      required
                      pattern="[0-9a-fA-F]{24}"
                      title="Must be a valid 24-character MongoDB ObjectId"
                    />
                  )}

                  {institutions.length > 0 && (
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-r border-b border-slate-500 w-2 h-2 rotate-45 -mt-1" />
                  )}
                </div>

                {institutions.length === 0 && (
                  <p className="text-[10px] text-slate-500 ml-1">
                    Could not load institutions automatically. Enter the
                    institution ObjectId from your database.
                  </p>
                )}
              </div>


              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(163,230,53,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 font-light tracking-wide">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-lime-500/80 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
