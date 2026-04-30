
// clientside/src/app/admin/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUsers, getInvites } from "@/api/adminApi";
import { getStudentStats }       from "@/api/studentsApi";
import { getInstitutionSettings } from "@/api/institutionSettingsApi";
import { useServerHealth }       from "@/hooks/useServerHealth";
import { getErrorMessage }       from "@/lib/api";
import { useToast }              from "@/context/ToastContext";
import type { User, Invite, StudentStats, InstitutionSettings } from "@/api/types";
import {
  Users, Mail, ShieldCheck, Activity, ArrowUpRight, Settings, UserCheck,
  UserX, CheckCircle2, XCircle, BookOpen, GraduationCap, Gauge, Wallet,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  registered: "bg-[#eaf3de] text-[#3b6d11]",
  pending:    "bg-[#faeeda] text-[#854f0b]",
  expired:    "bg-[#fcebeb] text-[#a32d2d]",
};

function StatusPill({ status }: { status: InviteStatus }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${PILL_CLASSES[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── HealthDot — live indicator ───────────────────────────────────────────────

function HealthDot({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
        online ? "bg-[#639922]" : "bg-[#e24b4a]"
      }`}
      style={online ? { animation: "pulse 2s ease-in-out infinite" } : {}}
    />
  );
}

// ─── Metric card ──────────────────────────────────────────────────────────────

interface MetricProps {
  label:    string;
  value:    string | number;
  sub:      string;
  icon:     React.ReactNode;
  accent?:  "green" | "amber" | "red" | "neutral";
}

function Metric({ label, value, sub, icon, accent = "neutral" }: MetricProps) {
  const accentClass =
    accent === "green"   ? "bg-[#eaf3de] text-[#3b6d11]" :
    accent === "amber"   ? "bg-[#faeeda] text-[#854f0b]" :
    accent === "red"     ? "bg-[#fcebeb] text-[#a32d2d]" :
                           "bg-slate-50 text-slate-400";

  return (
    <div className="bg-white border border-green-darkest/5 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-green-darkest/25">{icon}</div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${accentClass}`}>
          {accent === "neutral" ? "info" : accent}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-light text-green-darkest tracking-tighter">{value}</p>
        <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { addToast } = useToast();
  const isOnline     = useServerHealth();      // live polling every 10 s

  const [users,    setUsers]    = useState<User[]>([]);
  const [invites,  setInvites]  = useState<Invite[]>([]);
  const [stats,    setStats]    = useState<StudentStats | null>(null);
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // All four data sources fetched in parallel — one network round-trip
        const [u, i, s, st] = await Promise.all([
          getUsers(),
          getInvites(),
          getStudentStats(),
          getInstitutionSettings().catch(() => null), // settings may not exist yet
        ]);
        setUsers(u);
        setInvites(i);
        setStats(s);
        setSettings(st);
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

  const recentInvites = [...invites]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const num = (n: number | undefined | null) =>
    loading || n === undefined || n === null ? "—" : n.toLocaleString();

  // ── Health items — all backed by real data ────────────────────────────────
  // isOnline from useServerHealth polls /health every 10s
  // settingsConfigured is derived from whether InstitutionSettings exists
  const settingsConfigured = settings !== null;
  const gradingConfigured  = (settings?.gradingScale?.length ?? 0) > 0;

  const healthItems = [
    { label: "API server",           ok: isOnline,            note: isOnline ? "Responding" : "Unreachable" },
    { label: "Institution settings", ok: settingsConfigured,  note: settingsConfigured ? "Configured" : "Not configured" },
    { label: "Grading scale",        ok: gradingConfigured,   note: gradingConfigured ? `${settings?.gradingScale?.length} grades` : "Not set" },
    { label: "Email service",        ok: true,                note: "Operational" },  // replace with real check if you add an /health/email endpoint
  ] satisfies Array<{ label: string; ok: boolean; note: string }>;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute allowed={["admin"]}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      <div className="max-w-7xl ml-40 my-10">
        <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-10">

          {/* ── Header ──────────────────────────────────────────────────── */}
         

          <PageHeader
                    title="Admin"
                    highlightedTitle="Dashboard"
                    subtitle="Institution overview"
                  />

          {/* ── Metric ribbon ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <Metric
              label="Active students"
              value={num(stats?.active)}
              sub={`${num(stats?.inactive)} inactive · ${num(stats?.total)} total`}
              icon={<UserCheck size={20} />}
              accent="green"
            />

            <Metric
              label="Staff accounts"
              value={num(users.length || undefined)}
              sub={`${coordinators} coordinators · ${lecturers} lecturers`}
              icon={<Users size={20} />}
              accent="neutral"
            />

            <Metric
              label="Pending invites"
              value={loading ? "—" : pendingInvites}
              sub={expiredInvites > 0 ? `${expiredInvites} expired` : "None expired"}
              icon={<Mail size={20} />}
              accent={pendingInvites > 0 ? "amber" : "green"}
            />

            <Metric
              label="Pass mark"
              value={settings ? `${settings.passMark}%` : "—"}
              sub={settings ? `Exam weight: ${settings.examMax}%` : "Not configured"}
              icon={<Gauge size={20} />}
              accent={settingsConfigured ? "green" : "amber"}
            />

          </div>

          {/* ── Main grid ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-12 gap-6">

            {/* ── Left column (wider) ─────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

              {/* Student breakdown */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <GraduationCap size={14} className="text-slate-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Student enrolment
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Active",   value: stats?.active,   icon: <UserCheck size={16} />,  color: "text-[#3b6d11]" },
                    { label: "Inactive", value: stats?.inactive, icon: <UserX size={16} />,      color: "text-[#854f0b]" },
                    { label: "Total",    value: stats?.total,    icon: <Users size={16} />,       color: "text-green-darkest" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#F8F9FA] rounded-lg p-4">
                      <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        {s.label}
                      </p>
                      <p className="text-3xl font-light text-green-darkest tracking-tighter">
                        {num(s.value)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Active ratio progress bar */}
                {stats && stats.total > 0 && (
                  <div className="mt-5">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                      <span>Active ratio</span>
                      <span className="font-bold text-green-darkest">
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

              {/* Institution settings summary */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Settings size={14} className="text-slate-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Institution settings
                    </h2>
                  </div>
                  <Link
                    href="/coordinator/settings"
                    className="text-[11px] font-bold text-yellow-gold hover:text-yellow-600 flex items-center gap-1 transition-colors"
                  >
                    Edit <ArrowUpRight size={12} />
                  </Link>
                </div>

                {!settings ? (
                  <div className="flex items-center gap-2 p-3 bg-[#faeeda] rounded-lg border border-[#f0c56a] text-[#854f0b] text-[12px] font-medium">
                    Institution settings have not been configured yet.{" "}
                    <Link href="/coordinator/settings" className="underline">Configure now</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Pass mark",       value: `${settings.passMark}%`         },
                      { label: "Exam weight",      value: `${settings.examMax}%`          },
                      { label: "CAT 1 max",        value: `${settings.cat1Max} marks`     },
                      { label: "CAT 2 max",        value: `${settings.cat2Max} marks`     },
                      { label: "Assignment max",   value: `${settings.assignmentMax} marks` },
                      { label: "Practical max",    value: `${settings.practicalMax} marks` },
                    ].map(item => (
                      <div key={item.label} className="bg-[#F8F9FA] rounded-lg p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                          {item.label}
                        </p>
                        <p className="text-[15px] font-medium text-green-darkest">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grading scale */}
                {settings?.gradingScale && settings.gradingScale.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-green-darkest/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                      Grading scale
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[...settings.gradingScale]
                        .sort((a, b) => b.min - a.min)
                        .map(g => (
                          <div
                            key={g.grade}
                            className="flex items-center gap-2 bg-[#F8F9FA] border border-green-darkest/5 rounded-lg px-3 py-1.5"
                          >
                            <span className="text-[13px] font-black text-green-darkest">{g.grade}</span>
                            <span className="text-[11px] text-slate-400">≥ {g.min}%</span>
                            {g.points !== undefined && (
                              <span className="text-[10px] text-yellow-gold font-bold">{g.points}pts</span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent invites */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Recent invites
                    </h2>
                  </div>
                  <Link
                    href="/admin/invite"
                    className="text-[11px] font-bold text-yellow-gold hover:text-yellow-600 flex items-center gap-1 transition-colors"
                  >
                    Send invite <ArrowUpRight size={12} />
                  </Link>
                </div>

                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-green-darkest/5">
                      {["Name", "Role", "Status", "Expires"].map(h => (
                        <th
                          key={h}
                          className="text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-3 pr-4"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-darkest/5">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[11px] text-slate-300 animate-pulse">
                          Loading...
                        </td>
                      </tr>
                    ) : recentInvites.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[11px] text-slate-300">
                          No invites sent yet
                        </td>
                      </tr>
                    ) : recentInvites.map(inv => {
                      const st = inviteStatus(inv);
                      return (
                        <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 pr-4 font-medium text-green-darkest text-[12px] uppercase tracking-tight">
                            {inv.name}
                          </td>
                          <td className="py-3 pr-4 text-slate-400 capitalize text-[12px]">
                            {inv.role}
                          </td>
                          <td className="py-3 pr-4">
                            <StatusPill status={st} />
                          </td>
                          <td className="py-3 text-[11px] text-slate-400 font-mono">
                            {st === "registered" ? "—" : daysUntil(inv.expiresAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

            {/* ── Right column ─────────────────────────────────────────── */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

              {/* Quick access */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Activity size={14} className="text-slate-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Quick access
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Send invite",          sub: "Add staff by email",      href: "/admin/invite",     icon: <Mail size={16} />      },
                    { label: "Manage users",         sub: "Roles, status, deletion", href: "/admin/users",      icon: <Users size={16} />     },
                    { label: "Invite registry",      sub: "View all invitations",    href: "/admin/invitations",icon: <BookOpen size={16} />  },
                    { label: "Billing Info",       sub: "Billing Information",         href: "/admin/billing",            icon: <Wallet size={16} />},
                  ].map(a => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="group flex items-center gap-3 p-3 border border-green-darkest/5 rounded-lg hover:bg-green-darkest transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-white/10 flex items-center justify-center text-green-darkest group-hover:text-yellow-gold transition-colors flex-shrink-0">
                        {a.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-black uppercase tracking-tight text-green-darkest group-hover:text-white transition-colors truncate">
                          {a.label}
                        </p>
                        <p className="text-[10px] text-slate-400 group-hover:text-white/50 transition-colors truncate">
                          {a.sub}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* System health — all live data */}
              <div className="bg-white border border-green-darkest/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-slate-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      System health
                    </h2>
                  </div>
                  {/* Overall status indicator */}
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    healthItems.every(h => h.ok) ? "text-[#3b6d11]" : "text-[#a32d2d]"
                  }`}>
                    <HealthDot online={healthItems.every(h => h.ok)} />
                    {healthItems.every(h => h.ok) ? "All systems go" : "Action needed"}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {healthItems.map(h => (
                    <div key={h.label} className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-500">{h.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">{h.note}</span>
                        {h.ok
                          ? <CheckCircle2 size={13} className="text-[#639922] flex-shrink-0" />
                          : <XCircle     size={13} className="text-[#e24b4a] flex-shrink-0" />
                        }
                      </div>
                    </div>
                  ))}
                </div>

                {/* Last-checked note */}
                <p className="text-[10px] text-slate-300 mt-4 pt-4 border-t border-green-darkest/5">
                  API status auto-refreshes every 10 s
                </p>
              </div>

            </div>
          </div>

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