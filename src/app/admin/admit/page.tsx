// clientside/src/app/admin/admit/page.tsx
"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getErrorMessage } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/ui/PageHeader";
import { 
  MailPlus, UserPlus, ShieldCheck, Fingerprint, 
  Loader2, SendHorizontal, ChevronRight, 
} from "lucide-react";
import { sendInvite } from "@/api/adminApi";

export default function InviteFormPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"lecturer" | "coordinator">("lecturer");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.includes("@") && !name) {
      const defaultName = value
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      setName(defaultName);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !name.trim() || !role) {
      addToast("Validation Error: All registry fields are mandatory.", "error");
      return;
    }
    setLoading(true);
    try {
      await sendInvite(email, role, name);
      addToast(`Protocol Success: Invite dispatched to ${name}`, "success");
      setEmail("");
      setName("");
    } catch (err) {
      addToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 
    "w-full bg-white border border-green-darkest/10 rounded-lg py-3 pl-11 pr-4 " +
    "text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none " +
    "focus:ring-2 focus:ring-yellow-gold/20 focus:border-yellow-gold/50 transition-all shadow-sm";

  const labelStyle = 
    "text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40 ml-1 flex items-center gap-2";

  const iconStyle = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-yellow-gold transition-colors";

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="max-w-8xl ml-40 my-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#F8F9FA] min-h-[100vh] rounded-xl shadow-2xl p-10 relative overflow-hidden">
          
          {/* Decorative Watermark */}
          <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none">
            <MailPlus size={400} className="text-green-darkest" />
          </div>

          <PageHeader 
            title="Credential" 
            highlightedTitle="Issuance" 
            systemLabel="Identity Provisioning Portal" 
          />

          <div className="grid grid-cols-12 gap-12 mt-12">
            {/* Left Side: Context & Instructions */}
            <div className="col-span-12 lg:col-span-5 space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                    Provisioning Protocol
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
                </div>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  Authorize new administrative or academic personnel by issuing a secure 
                  registration link.                  
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Verification", desc: "Identity is validated upon registration", icon: <Fingerprint size={16}/> },
                  { title: "Role-Based Access", desc: "Permissions are scoped to selected tier", icon: <ShieldCheck size={16}/> }
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-green-darkest/5">
                    <div className="text-yellow-gold mt-1">{item.icon}</div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-green-darkest">{item.title}</h4>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: The Invite Console */}
            <div className="col-span-12 lg:col-span-7">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-gold/20 to-green-darkest/5 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                
                <form 
                  onSubmit={handleSubmit}
                  className="relative bg-white border border-green-darkest/5 rounded-xl p-10 shadow-xl space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email Input */}
                    <div className="group space-y-2 col-span-2">
                      <label className={labelStyle}>
                        Target Email Address
                      </label>
                      <div className="relative">
                        <MailPlus className={iconStyle} />
                        <input
                          type="email"
                          placeholder="identity@institution.edu"
                          className={inputBase}
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Name Input */}
                    <div className="group space-y-2">
                      <label className={labelStyle}>Legal Full Name</label>
                      <div className="relative">
                        <UserPlus className={iconStyle} />
                        <input
                          type="text"
                          placeholder="Authorized Personnel"
                          className={inputBase}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="group space-y-2">
                      <label className={labelStyle}>Access Authorization</label>
                      <div className="relative">
                        <ShieldCheck className={iconStyle} />
                        <select
                          className={`${inputBase} appearance-none cursor-pointer`}
                          value={role}
                          onChange={(e) => setRole(e.target.value as "lecturer" | "coordinator")}
                        >
                          <option value="lecturer">Lecturer</option>
                          <option value="coordinator">Coordinator</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronRight size={14} className="text-slate-300 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || !email || !name}
                      className="w-full group/btn relative bg-green-darkest hover:bg-green-800 text-white py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Transmitting...
                        </>
                      ) : (
                        <>
                          Send Invitation
                          <SendHorizontal size={16} className="text-yellow-gold group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[9px] font-mono text-slate-300 uppercase tracking-[0.4em]">
              Authorized Use Only • Audit Log Active
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}