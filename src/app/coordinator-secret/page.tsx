// clientside/src/app/coordinator-secret/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPublicInstitutions } from "@/api/institutionsApi";
import api from "@/config/axiosInstance";
import { getErrorMessage } from "@/lib/api";
import CommonButton from "@/components/ui/CommonButton";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  User,
  Building2,
  KeyRound,
} from "lucide-react";

interface Institution {
  _id: string;
  name: string;
  code: string;
}

export default function CoordinatorSecretRegisterPage() {
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [message, setMessage] = useState("");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!institutionId) {
      setMessage("Please select an institution");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      await api.post("/coordinator/secret-register", {
        secret,
        name,
        email: email.toLowerCase(),
        password,
        institutionId,
      });
      setMessage("Account created. Redirecting...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputBase = "w-full bg-white/[0.02] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none focus:border-lime-500/50 focus:bg-white/[0.05] transition-all";
  const labelStyle = "text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold ml-1";
  const iconStyle = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-lime-400 transition-colors";

  return (
    <div className="min-h-screen bg-[#050a02] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lime-900/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-[480px] z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-2xl">
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-lime-500/10 rounded-2xl mb-4 border border-lime-500/20">
              <ShieldCheck className="w-8 h-8 text-lime-400" />
            </div>
            <h1 className="text-3xl font-light tracking-tight text-white">
              Coordinator{" "}
              <span className="font-semibold text-lime-400">Portal</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-light italic">
              Secure registration for departmental leads
            </p>
          </header>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm text-center border animate-in slide-in-from-top-2 ${
                message.includes("Account")
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          {fetching ? (
            <div className="flex flex-col items-center py-12">
              <div className="w-10 h-10 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group space-y-2">
                <label className={labelStyle}>
                  Registration Key
                </label>
                <div className="relative">
                  <KeyRound className={iconStyle} />
                  <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter key"
                    className={inputBase}
                    required
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <label className={labelStyle}>
                  Full Identity
                </label>
                <div className="relative">
                  <User className={iconStyle} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={inputBase}
                    required
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <label className={labelStyle}>
                  Official Email
                </label>
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

              <div className="group space-y-2 relative">
                <label className={labelStyle}>
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputBase}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="group space-y-2">
                <label className={labelStyle}>
                  Assigned Department
                </label>
                <div className="relative">
                  <Building2 className={iconStyle} />
                  <select
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="w-full bg-[#0a1205] border border-white/10 rounded-xl py-3.5 pl-11 pr-10 text-white outline-none focus:border-lime-500/50 appearance-none transition-all cursor-pointer"
                    // className={inputBase}
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
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-r border-b border-slate-500 rotate-45 transform origin-center -translate-x-1 -mt-1" />
                </div>
              </div>

              <div className="pt-4">
                <CommonButton
                  type="submit"
                  disabled={loading || !institutionId}
                  className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(163,230,53,0.2)] disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? "Initializing..." : "Complete Registration"}
                </CommonButton>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 font-light tracking-wide">
              Technical issues?{" "}
              <span className="text-lime-500/80 cursor-pointer hover:underline">
                Contact System Admin
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
