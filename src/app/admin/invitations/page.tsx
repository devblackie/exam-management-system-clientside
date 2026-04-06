// clientside/src/app/admin/invitations.page.tsx
"use client";

import { useEffect, useState, Fragment } from "react";
// import { getInvites, Invite, revokeInvite, getInviteLink } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Menu, Transition } from "@headlessui/react";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/ui/PageHeader";
import {
  Search, Trash2, ChevronLeft, ChevronRight, Clipboard, Link as LinkIcon,
  Mail, Clock, ShieldAlert, Fingerprint, MoreVertical, CheckCircle2,
} from "lucide-react";
import { getInviteLink, getInvites, revokeInvite } from "@/api/adminApi";
import { Invite } from "@/api/types";

export default function InvitesTablePage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const pageSize = 8;

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await getInvites();
      setInvites(res);
    } catch (err) {
      addToast("Failed to sync invite registry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("CRITICAL: Invalidate this access token immediately?")) return;
    try {
      await revokeInvite(id);
      fetchInvites();
      addToast("Access Token Revoked", "success");
    } catch {
      addToast("Revocation Protocol Failed", "error");
    }
  };

  const handleCopyLink = (token: string) => {
    const link = getInviteLink(token);
    navigator.clipboard.writeText(link);
    addToast(`Protocol Link Copied: ${token.substring(0, 8)}...`, "success");
  };

  // RE-ACTIVE SEARCH LOGIC
  const filteredInvites = invites.filter((invite) =>
    invite.email.toLowerCase().includes(search.toLowerCase()) ||
    invite.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvites.length / pageSize) || 1;
  const paginatedInvites = filteredInvites.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats for Executive Ribbon
  const pendingCount = invites.filter(i => !i.used).length;
  const usedCount = invites.filter(i => i.used).length;

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="max-w-9xl ml-40 my-10  animate-in fade-in duration-700">
        <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-10">
          
          <PageHeader
            title="Access Protection"
            highlightedTitle="Registry"
            systemLabel="Invitation Control Plane"
          />

          {/* EXECUTIVE DATA RIBBON */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                Token Lifecycle Summary
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Issued", val: invites.length, icon: <LinkIcon />, color: "text-green-darkest" },
                { label: "Pending Activation", val: pendingCount, icon: <Clock />, color: "text-yellow-gold" },
                { label: "Successful Onboards", val: usedCount, icon: <CheckCircle2 />, color: "text-emerald-600" },
              ].map((stat, index) => (
                <div key={stat.label} className="flex-1 px-10 relative group border-r border-green-darkest/[0.06] last:border-r-0">
                  <div className="relative ">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-green-darkest/20 group-hover:text-yellow-gold transition-all duration-500 transform group-hover:-translate-y-1">
                        {stat.icon}
                      </div>
                      <span className="text-[9px] font-mono text-slate-300 group-hover:text-green-darkest transition-colors">
                        0{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {stat.label}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-light text-green-darkest tracking-tighter group-hover:tracking-normal transition-all duration-500">
                        {stat.val}
                      </span>
                    </div>
                    <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEARCH AREA */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Fingerprint size={14} className="text-yellow-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
                  Target Identity Search
                </span>
              </div>
              <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-green-darkest transition-colors" />
                <input
                  type="text"
                  placeholder="Query by destination email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                  className="w-full bg-white border-0 shadow-md rounded-lg py-3 pl-12 pr-4 text-xs font-mono text-green-darkest outline-none ring-1 ring-transparent focus:ring-yellow-gold/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* TABLE CONSOLE */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-gold/10 to-green-darkest/5 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-white border border-green-darkest/5 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-green-darkest/5 bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Target User</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Designated Role</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Expiration Threshold</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-darkest/5">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-xs font-mono text-slate-400 animate-pulse">Scanning Token Frequencies...</td></tr>
                  ) : paginatedInvites.map((invite) => (
                    <tr key={invite._id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-green-darkest/5 text-green-darkest">
                            <Mail size={14} />
                          </div>
                          <span className="text-[11px] font-bold text-green-darkest uppercase tracking-tight">{invite.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {invite.role}
                        </span>
                      </td>
                      <td className="px-6 py-2">
                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter ${invite.used ? 'text-emerald-600' : 'text-yellow-600'}`}>
                          {invite.used ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {invite.used ? "Activated" : "Pending"}
                        </div>
                      </td>
                      <td className="px-6 py-2 text-[10px] font-mono text-slate-400 uppercase">
                        {new Date(invite.expiresAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-2 text-right">
                        <Menu as="div" className="relative inline-block text-left">
                          <Menu.Button className="p-2 text-slate-300 hover:text-green-darkest transition-all">
                            <MoreVertical size={16} />
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-green-darkest/10 rounded-lg shadow-xl focus:outline-none z-50 overflow-hidden">
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleCopyLink(invite._id)}
                                      className={`${active ? "bg-slate-50 text-green-darkest" : "text-slate-600"} flex w-full items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest`}
                                    >
                                      <Clipboard className="h-4 w-4 mr-3 text-yellow-gold" />
                                      Copy Protocol Link
                                    </button>
                                  )}
                                </Menu.Item>
                                {!invite.used && (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleRevoke(invite._id)}
                                        className={`${active ? "bg-red-50 text-red-600" : "text-red-500"} flex w-full items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest border-t border-slate-50`}
                                      >
                                        <Trash2 className="h-4 w-4 mr-3" />
                                        Revoke Token
                                      </button>
                                    )}
                                  </Menu.Item>
                                )}
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="p-6 bg-slate-50/50 border-t border-green-darkest/5 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-darkest disabled:opacity-20 hover:text-yellow-gold transition-colors"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <span className="text-[10px] font-mono text-slate-400">
                   Page <span className="text-green-darkest font-bold">{currentPage}</span> / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-darkest disabled:opacity-20 hover:text-yellow-gold transition-colors"
                >
                  Forward <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-red-400/40">
             <ShieldAlert size={12} />
             <p className="text-[9px] font-black uppercase tracking-[0.2em]">Token Authorization Console</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}