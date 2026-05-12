// clientside/src/app/admin/admit/page.tsx — COMPLETE, FINAL, ERROR-FREE
"use client";

import { useState, useEffect } from "react";
import ProtectedRoute           from "@/components/ProtectedRoute";
import { getErrorMessage }      from "@/lib/api";
import { useToast }             from "@/context/ToastContext";
import PageHeader               from "@/components/ui/PageHeader";
import {
  MailPlus, UserPlus, ShieldCheck, Fingerprint,
  Loader2, SendHorizontal, ChevronRight, Building2, Info,
} from "lucide-react";
import { sendInvite }               from "@/api/adminApi";
import { useInstitutionSettings }   from "@/hooks/queries/useInstitutionSettings";
import type { School, Department }  from "@/api/types";

type Role = "lecturer" | "coordinator";

export default function InviteFormPage() {
  // ── Form state ────────────────────────────────────────────────────────────
  const [email,           setEmail]           = useState<string>("");
  const [name,            setName]            = useState<string>("");
  const [role,            setRole]            = useState<Role>("coordinator");
  const [schoolCode,      setSchoolCode]      = useState<string>("");
  const [departmentCode,  setDepartmentCode]  = useState<string>("");
  const [institutionWide, setInstitutionWide] = useState<boolean>(false);
  const [loading,         setLoading]         = useState<boolean>(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { addToast }        = useToast();
  const { data: settings }  = useInstitutionSettings();

  // Schools and departments from institution settings
  const schools: School[]     = settings?.schools ?? [];
  const selectedSchool        = schools.find((s: School) => s.code === schoolCode);
  const departments: Department[] = selectedSchool?.departments ?? [];

  // Whether there are any departments configured at all
  const hasDepartments = schools.some(
    (s: School) => (s.departments?.length ?? 0) > 0,
  );

  // ── Effects ───────────────────────────────────────────────────────────────
  // Clear department when school changes
  useEffect(() => { setDepartmentCode(""); }, [schoolCode]);

  // For lecturers, always institution-wide — clear school/dept
  useEffect(() => {
    if (role === "lecturer") {
      setInstitutionWide(true);
      setSchoolCode("");
      setDepartmentCode("");
    } else {
      setInstitutionWide(false);
    }
  }, [role]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEmailChange = (value: string): void => {
    setEmail(value);
    // Auto-fill name from email prefix if name is empty
    if (value.includes("@") && !name) {
      const derived = value
        .split("@")[0]
        .split(".")
        .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
      setName(derived);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email.trim()) {
      addToast("Email is required.", "error"); return;
    }
    if (!name.trim()) {
      addToast("Name is required.", "error"); return;
    }

    // Coordinators must have a department, unless:
    // - institution-wide is checked, OR
    // - no departments have been configured yet (allow creation pending setup)
    if (role === "coordinator" && !institutionWide && hasDepartments && !departmentCode) {
      addToast(
        "Please assign this coordinator to a department, or enable institution-wide access.",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      await sendInvite(email.trim(), role, name.trim(), {
        schoolCode:      role === "coordinator" ? (schoolCode || undefined) : undefined,
        departmentCode:  role === "coordinator" ? (departmentCode || undefined) : undefined,
        // Lecturers are always institution-wide.
        // Coordinators are institution-wide if explicitly checked OR no departments exist.
        institutionWide: role === "lecturer" ? true : (institutionWide || !hasDepartments),
      });

      addToast(
        `Invitation dispatched to ${name} as ${
          role === "coordinator" ? "Coordinator" : "Lecturer"
        }${departmentCode ? ` — ${selectedSchool?.name ?? ""} / ${departments.find(d => d.code === departmentCode)?.name ?? departmentCode}` : ""}`,
        "success",
      );

      // Reset form
      setEmail("");
      setName("");
      setRole("coordinator");
      setSchoolCode("");
      setDepartmentCode("");
      setInstitutionWide(false);

    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputBase =
    "w-full bg-white border border-green-darkest/10 rounded-lg py-3 pl-11 pr-4 " +
    "text-xs font-mono text-green-darkest placeholder:text-slate-300 outline-none " +
    "focus:ring-2 focus:ring-yellow-gold/20 focus:border-yellow-gold/50 transition-all shadow-sm";

  const selectBase =
    `${inputBase} appearance-none cursor-pointer`;

  const labelStyle =
    "text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40 ml-1 flex items-center gap-2";

  const iconStyle =
    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 " +
    "group-focus-within:text-yellow-gold transition-colors";

  // ── Assignment preview (shown below the form) ─────────────────────────────
  const universityName =
    settings?.docMeta?.universityName ??
    "University (set in Institution Settings)";

  const schoolName   = selectedSchool?.name ?? "";
  const deptName     = departments.find(d => d.code === departmentCode)?.name ?? "";

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="max-w-8xl min-h-screen lg:ml-48 my-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#F8F9FA] min-h-[100vh] rounded-xl shadow-2xl p-10 relative overflow-hidden">

          {/* Watermark */}
          <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none">
            <MailPlus size={400} className="text-green-darkest" />
          </div>

          <PageHeader
            title="Credential"
            highlightedTitle="Issuance"
            systemLabel="Identity Provisioning Portal"
          />

          <div className="grid grid-cols-12 gap-12 mt-12">

            {/* ── Left: Context & Info ──────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-5 space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                    Provisioning Protocol
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
                </div>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  Authorize new academic personnel by issuing a secure registration link.
                  Coordinators are scoped to their assigned department and can only access
                  programs and students within it. Lecturers get institution-wide read access.
                </p>
              </div>

              {/* Info cards */}
              {([
                {
                  title: "Verification",
                  desc:  "Identity is validated upon registration via secure invite link",
                  icon:  <Fingerprint size={16} />,
                },
                {
                  title: "Department Scoping",
                  desc:  "Coordinators see only their department's programs, students, and reports",
                  icon:  <ShieldCheck size={16} />,
                },
                {
                  title: "Invitation Email",
                  desc:  "Recipient receives an email showing the university, school, and department they are invited to",
                  icon:  <MailPlus size={16} />,
                },
              ]).map(item => (
                <div key={item.title}
                  className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-green-darkest/5">
                  <div className="text-yellow-gold mt-1 shrink-0">{item.icon}</div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-green-darkest">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}

              {/* Assignment preview */}
              {(schoolCode || departmentCode || institutionWide) && (
                <div className="p-4 bg-green-darkest/5 border border-green-darkest/10 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-darkest/40 mb-2">
                    Invitation will say:
                  </p>
                  <p className="text-xs text-green-darkest font-semibold">
                    University: {universityName}
                  </p>
                  {!institutionWide && schoolCode && (
                    <p className="text-xs text-green-darkest mt-1">
                      School: {schoolName}
                    </p>
                  )}
                  {!institutionWide && departmentCode && (
                    <p className="text-xs text-green-darkest mt-1">
                      Department: {deptName}
                    </p>
                  )}
                  {institutionWide && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      Institution-wide access
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: Invite Form ────────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-green-darkest/5 rounded-xl p-10 shadow-xl space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Email */}
                  <div className="group space-y-2 col-span-2">
                    <label className={labelStyle}>
                      Target Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MailPlus className={iconStyle} />
                      <input
                        type="email"
                        placeholder="identity@institution.edu"
                        className={inputBase}
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleEmailChange(e.target.value)
                        }
                        required
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="group space-y-2">
                    <label className={labelStyle}>
                      Legal Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <UserPlus className={iconStyle} />
                      <input
                        type="text"
                        placeholder="Dr. Jane Smith"
                        className={inputBase}
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setName(e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="group space-y-2">
                    <label className={labelStyle}>
                      Role <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <ShieldCheck className={iconStyle} />
                      <select
                        className={selectBase}
                        value={role}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setRole(e.target.value as Role)
                        }
                      >
                        <option value="coordinator">Coordinator</option>
                        <option value="lecturer">Lecturer</option>
                      </select>
                      <ChevronRight
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 ml-1">
                      {role === "coordinator"
                        ? "Coordinators are scoped to a school/department"
                        : "Lecturers get institution-wide access by default"}
                    </p>
                  </div>

                  {/* School — only shown for coordinator */}
                  {role === "coordinator" && (
                    <div className="group space-y-2">
                      <label className={labelStyle}>
                        School
                        {hasDepartments && !institutionWide && (
                          <span className="text-red-400"> *</span>
                        )}
                      </label>
                      <div className="relative">
                        <Building2 className={iconStyle} />
                        <select
                          className={selectBase}
                          value={schoolCode}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setSchoolCode(e.target.value)
                          }
                          disabled={institutionWide}
                        >
                          <option value="">— Select School —</option>
                          {schools.map((s: School) => (
                            <option key={s.code} value={s.code}>{s.name}</option>
                          ))}
                        </select>
                        <ChevronRight
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none"
                        />
                      </div>
                      {schools.length === 0 && (
                        <p className="text-[10px] text-amber-600 ml-1">
                          No schools configured — coordinator will get institution-wide access
                        </p>
                      )}
                    </div>
                  )}

                  {/* Department — only shown for coordinator */}
                  {role === "coordinator" && (
                    <div className="group space-y-2">
                      <label className={labelStyle}>
                        Department
                        {hasDepartments && !institutionWide && (
                          <span className="text-red-400"> *</span>
                        )}
                      </label>
                      <div className="relative">
                        <Building2 className={iconStyle} />
                        <select
                          className={selectBase}
                          value={departmentCode}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setDepartmentCode(e.target.value)
                          }
                          disabled={institutionWide || !schoolCode}
                        >
                          <option value="">— Select Department —</option>
                          {departments.map((d: Department) => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                          ))}
                        </select>
                        <ChevronRight
                          size={14}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none"
                        />
                      </div>
                      {schoolCode && departments.length === 0 && (
                        <p className="text-[10px] text-amber-600 ml-1">
                          No departments in this school yet
                        </p>
                      )}
                    </div>
                  )}

                  {/* Institution-wide toggle — coordinator only */}
                  {role === "coordinator" && (
                    <div className="col-span-2">
                      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          id="institutionWide"
                          checked={institutionWide}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setInstitutionWide(e.target.checked);
                            if (e.target.checked) {
                              setSchoolCode("");
                              setDepartmentCode("");
                            }
                          }}
                          className="mt-0.5 rounded border-slate-300"
                        />
                        <div>
                          <span className="text-[11px] font-bold text-green-darkest block">
                            Institution-wide access
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Coordinator sees all schools and departments — suitable for
                            senior coordinators or registry staff. Leave unchecked for
                            department-specific coordinators.
                          </span>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Info when no departments exist */}
                  {role === "coordinator" && !hasDepartments && !institutionWide && (
                    <div className="col-span-2 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-blue-600 leading-relaxed">
                        No schools/departments configured yet. This coordinator will receive
                        institution-wide access until you configure schools in
                        <span className="font-bold"> Admin → Institution Settings</span>.
                        You can restrict access later by editing their profile.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !email.trim() || !name.trim()}
                  className="w-full bg-green-darkest hover:bg-green-800 text-white py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Transmitting...</>
                  ) : (
                    <>Send Invitation <SendHorizontal size={16} className="text-yellow-gold" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[9px] font-mono text-slate-300 uppercase tracking-[0.4em]">
              Authorized Use Only · Audit Log Active · 7-day link expiry
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}