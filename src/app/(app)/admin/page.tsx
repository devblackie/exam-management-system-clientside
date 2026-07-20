


// src/app/admin/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link           from "next/link";
import { useEffect, useState } from "react";
import { getUsers, getInvites }       from "@/api/adminApi";
import { getStudentStats }            from "@/api/studentsApi";
import { getInstitutionSettings }     from "@/api/institutionSettingsApi";
import { useServerHealth }            from "@/hooks/useServerHealth";
import { getErrorMessage }            from "@/lib/api";
import { useToast }                   from "@/context/ToastContext";
import type { User, Invite, StudentStats, InstitutionSettings } from "@/api/types";
import {
  Users, Mail, ShieldCheck, ArrowUpRight, Settings,
  UserCheck, UserX, CheckCircle2, XCircle,
  BookOpen, GraduationCap, Wallet, Building2, Activity,
  Gauge,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

// ── Helpers ───────────────────────────────────────────────────────────────────
type InviteStatus = "registered" | "pending" | "expired";

function inviteStatus(invite: Invite): InviteStatus {
  if (invite.used) return "registered";
  if (new Date(invite.expiresAt) < new Date()) return "expired";
  return "pending";
}

function daysUntil(dateStr: string): string {
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  if (diff === 0) return "Today";
  return `${diff}d`;
}

const PILL_CLASSES: Record<InviteStatus, string> = {
  registered: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  pending:    "bg-amber-50  text-amber-700  border border-amber-200",
  expired:    "bg-red-50    text-red-700    border border-red-200",
};

function StatusPill({ status }: { status: InviteStatus }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${PILL_CLASSES[status]}`}>
      {status}
    </span>
  );
}

function HealthDot({ online }: { online: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${online ? "bg-emerald-500" : "bg-red-500"}`}
      style={online ? { animation: "pulse 2s ease-in-out infinite" } : {}} />
  );
}

// ── Shared tokens — matching coordinator page exactly ─────────────────────────
const labelCls = "text-[10px] font-black uppercase tracking-[0.25em] text-green-darkest/50 block mb-1.5";

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { addToast } = useToast();
  const isOnline     = useServerHealth();

  const [users,    setUsers]    = useState<User[]>([]);
  const [invites,  setInvites]  = useState<Invite[]>([]);
  const [stats,    setStats]    = useState<StudentStats | null>(null);
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, i, s, st] = await Promise.all([
          getUsers(),
          getInvites(),
          getStudentStats(),
          getInstitutionSettings().catch(() => null),
        ]);
        setUsers(u); setInvites(i); setStats(s); setSettings(st);
      } catch (err) {
        addToast(getErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  // ── Derived values ────────────────────────────────────────────────────────
  const coordinators   = users.filter(u => u.role === "coordinator").length;
  const lecturers      = users.filter(u => u.role === "lecturer").length;
  const pendingInvites = invites.filter(i => inviteStatus(i) === "pending").length;
  const expiredInvites = invites.filter(i => inviteStatus(i) === "expired").length;
  const recentInvites  = [...invites]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const num = (n: number | undefined | null) =>
    loading || n === undefined || n === null ? "..." : n.toLocaleString();

  const settingsConfigured = settings !== null;
  const gradingConfigured  = (settings?.gradingScale?.length ?? 0) > 0;
  const passMark           = settings?.ruleSet?.passMark            ?? 40;
  const examWeight         = settings?.ruleSet?.examWeight          ?? 70;
  const catMax             = settings?.ruleSet?.catMax              ?? 20;
  const assignmentMax      = settings?.ruleSet?.assignmentMax       ?? 10;
  const practicalMax       = settings?.ruleSet?.practicalMax        ?? 10;
  const supplementaryThreshold = settings?.ruleSet?.supplementaryThreshold ?? 0.333;

  const healthItems = [
    { label: "API server",           ok: isOnline,           note: isOnline ? "Responding"    : "Unreachable"    },
    { label: "Institution settings", ok: settingsConfigured, note: settingsConfigured ? "Configured" : "Not configured" },
    { label: "Grading scale",        ok: gradingConfigured,  note: gradingConfigured  ? `${settings?.gradingScale?.length} grades` : "Not set" },
    { label: "Email service",        ok: true,               note: "Operational" },
  ];

  // ── Ribbon stats ──────────────────────────────────────────────────────────
  const ribbonStats = [
    { title: "Active Students",  value: num(stats?.active),             icon: <UserCheck size={24} /> },
    { title: "Staff Accounts",   value: num(users.length || undefined),  icon: <Users size={24} /> },
    { title: "Pending Invites",  value: loading ? "..." : pendingInvites.toString(), icon: <Mail size={24} /> },
    { title: "Pass Mark",        value: loading ? "..." : `${passMark}%`,            icon: <Gauge size={24} /> },
    { title: "Exam Weight",      value: loading ? "..." : `${examWeight}%`,          icon: <GraduationCap size={24} /> },
  ];

  return (
    <ProtectedRoute allowed={["admin"]}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      <div className="max-w-8xl lg:ml-48 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#F8F9FA] min-h-screen rounded shadow-2xl p-10 relative overflow-hidden">

          {/* Watermark — matching coordinator page */}
          <ShieldCheck size={400} className="absolute -right-20 -bottom-20 opacity-[0.02] text-green-darkest pointer-events-none" />

          {/* ── Header ──────────────────────────────────────────────────── */}
          <PageHeader
            title="Admin"
            highlightedTitle="Dashboard"
            subtitle="Institution overview"
          />

          {/* ── EXECUTIVE RIBBON — identical layout to coordinator page ─── */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                Institution Intelligence Summary
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>

            <div className="bg-white border-y border-green-darkest/5 py-10 relative overflow-hidden">
              
              <div className="max-w-[1600px] mx-auto flex flex-wrap lg:flex-nowrap items-center">
                {ribbonStats.map((stat, index) => (
                  <div key={stat.title} className="flex-1 px-10 relative group border-r border-green-darkest/[0.06] last:border-r-0">
                    <div className="relative">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-green-darkest/20 group-hover:text-yellow-gold transition-all duration-500 transform group-hover:-translate-y-1">
                          {stat.icon}
                        </div>
                        <span className="text-[9px] font-mono text-slate-300 group-hover:text-green-darkest transition-colors">
                          0{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        {stat.value === "..." ? (
                          <span className="h-10 w-20 bg-slate-200 animate-pulse rounded-lg inline-block" />
                        ) : (
                          <>
                            <span className="text-5xl font-light text-green-darkest tracking-tighter group-hover:tracking-normal transition-all duration-500">
                              {stat.value.split(".")[0]}
                            </span>
                            {stat.value.includes(".") && (
                              <span className="text-xl font-black text-yellow-gold">.{stat.value.split(".")[1]}</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-6">

            {/* ── Left column ──────────────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

              {/* Student breakdown */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <GraduationCap size={14} className="text-slate-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Enrolment</h2>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Active",   value: stats?.active,   icon: <UserCheck size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Inactive", value: stats?.inactive, icon: <UserX size={18} />,     color: "text-amber-600",   bg: "bg-amber-50"   },
                    { label: "Total",    value: stats?.total,    icon: <Users size={18} />,      color: "text-green-darkest", bg: "bg-slate-50" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#F8F9FA] border border-green-darkest/5 rounded-xl p-5 hover:shadow-sm transition-shadow">
                      <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                        <span className={s.color}>{s.icon}</span>
                      </div>
                      <p className={labelCls}>{s.label}</p>
                      <p className="text-4xl font-light text-green-darkest tracking-tighter">{num(s.value)}</p>
                    </div>
                  ))}
                </div>

                {stats && stats.total > 0 && (
                  <div className="mt-6 pt-5 border-t border-green-darkest/5">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-2">
                      <span className="font-black uppercase tracking-widest">Active Ratio</span>
                      <span className="font-black text-green-darkest">
                        {Math.round((stats.active / stats.total) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-green-darkest/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-gold rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((stats.active / stats.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Staff breakdown */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Users size={14} className="text-slate-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Accounts</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Staff",   value: users.length,  bg: "bg-slate-50",    color: "text-green-darkest" },
                    { label: "Coordinators",  value: coordinators,  bg: "bg-blue-50",     color: "text-blue-700"      },
                    { label: "Lecturers",     value: lecturers,     bg: "bg-purple-50",   color: "text-purple-700"    },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} border border-green-darkest/5 rounded-xl p-5`}>
                      <p className={labelCls}>{s.label}</p>
                      <p className={`text-4xl font-light tracking-tighter ${s.color}`}>
                        {loading ? "..." : s.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institution settings summary */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-7 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Settings size={14} className="text-slate-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institution Settings</h2>
                  </div>
                  <Link href="/coordinator/institution-settings"
                    className="flex items-center gap-1 text-[10px] font-bold text-yellow-gold hover:text-yellow-600 transition-colors">
                    Edit <ArrowUpRight size={11} />
                  </Link>
                </div>

                {!settings ? (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <Settings size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-700 font-bold">
                      Institution settings not configured.{" "}
                      <Link href="/coordinator/institution-settings" className="underline">Configure now →</Link>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Pass Mark",          value: `${passMark}%`                          },
                      { label: "Exam Weight",        value: `${examWeight}%`                        },
                      { label: "CAT Max",            value: `${catMax} marks`                       },
                      { label: "Assignment Max",     value: `${assignmentMax} marks`                },
                      { label: "Practical Max",      value: `${practicalMax} marks`                 },
                      { label: "Supp Threshold",     value: `${Math.round(supplementaryThreshold * 100)}%` },
                    ].map(item => (
                      <div key={item.label} className="bg-[#F8F9FA] border border-green-darkest/5 rounded-xl p-4">
                        <p className={labelCls}>{item.label}</p>
                        <p className="text-base font-bold text-green-darkest font-mono">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {settings?.gradingScale && settings.gradingScale.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-green-darkest/5">
                    <p className={labelCls + " mb-3"}>Grading Scale</p>
                    <div className="flex flex-wrap gap-2">
                      {[...settings.gradingScale]
                        .sort((a, b) => b.min - a.min)
                        .map(g => (
                          <div key={g.grade}
                            className="flex items-center gap-2 bg-white border border-green-darkest/5 rounded-lg px-3 py-2 shadow-sm">
                            <span className="text-sm font-black text-green-darkest">{g.grade}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{g.min}–{g.max}%</span>
                            <span className="text-[9px] text-yellow-gold font-black uppercase tracking-wider">{g.label}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent invites */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-7 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Invites</h2>
                  </div>
                  <Link href="/admin/admit"
                    className="flex items-center gap-1 text-[10px] font-bold text-yellow-gold hover:text-yellow-600 transition-colors">
                    Send invite <ArrowUpRight size={11} />
                  </Link>
                </div>

                <div className="bg-white border border-green-darkest/5 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-green-darkest/5">
                        {["Name", "Role", "Status", "Expires"].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-darkest/5">
                      {loading ? (
                        <tr><td colSpan={4} className="py-10 text-center text-[10px] font-mono text-slate-300 animate-pulse">Loading…</td></tr>
                      ) : recentInvites.length === 0 ? (
                        <tr><td colSpan={4} className="py-10 text-center text-[10px] font-mono text-slate-300 uppercase tracking-widest">No invites sent yet</td></tr>
                      ) : recentInvites.map(inv => {
                        const st = inviteStatus(inv);
                        return (
                          <tr key={inv._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-3 text-[11px] font-bold text-green-darkest uppercase tracking-tight">{inv.name}</td>
                            <td className="px-5 py-3 text-[10px] font-mono text-slate-500 capitalize">{inv.role}</td>
                            <td className="px-5 py-3"><StatusPill status={st} /></td>
                            <td className="px-5 py-3 text-[10px] font-mono text-slate-400">{st === "registered" ? "—" : daysUntil(inv.expiresAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Invite summary row */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-green-darkest/5">
                  <span className="text-[10px] font-mono text-slate-400">
                    {pendingInvites} pending
                    {expiredInvites > 0 && <> · <span className="text-red-500">{expiredInvites} expired</span></>}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right column ─────────────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

              {/* Quick access — matching coordinator quick-access card */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Activity size={14} className="text-slate-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Access</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Send Invite",          sub: "Add staff by email",          href: "/admin/admit",        icon: <Mail size={16} />       },
                    { label: "Manage Users",         sub: "Roles, status, deletion",     href: "/admin/users",         icon: <Users size={16} />      },
                    { label: "Invite Registry",      sub: "View all invitations",        href: "/admin/invitations",   icon: <BookOpen size={16} />   },
                    { label: "Institution Settings", sub: "University name and details", href: "/admin/settings",      icon: <Building2 size={16} />  },
                    { label: "Billing",              sub: "Invoices & subscription",     href: "/admin/billing",       icon: <Wallet size={16} />     },
                  ].map(a => (
                    <Link key={a.label} href={a.href}
                      className="group flex items-center gap-4 p-3 border border-green-darkest/5 rounded-lg hover:bg-green-darkest transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-green-darkest/20">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-white/10 flex items-center justify-center text-green-darkest group-hover:text-yellow-gold transition-colors flex-shrink-0">
                        {a.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-tight text-green-darkest group-hover:text-white transition-colors truncate">{a.label}</p>
                        <p className="text-[10px] text-slate-400 group-hover:text-white/50 transition-colors truncate">{a.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* System health */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-slate-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Health</h2>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${
                    healthItems.every(h => h.ok) ? "text-emerald-600" : "text-red-600"
                  }`}>
                    <HealthDot online={healthItems.every(h => h.ok)} />
                    {healthItems.every(h => h.ok) ? "All Go" : "Action Needed"}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {healthItems.map(h => (
                    <div key={h.label} className="flex items-center justify-between py-1.5 border-b border-green-darkest/5 last:border-0">
                      <span className="text-[11px] font-bold text-slate-500">{h.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">{h.note}</span>
                        {h.ok
                          ? <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                          : <XCircle      size={13} className="text-red-500    flex-shrink-0" />
                        }
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] font-mono text-slate-300 mt-4 pt-4 border-t border-green-darkest/5">
                  API status auto-refreshes every 10 s
                </p>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-[9px] font-mono text-slate-300 uppercase tracking-[0.4em]">
              Authorized use only · Audit log active
            </p>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}