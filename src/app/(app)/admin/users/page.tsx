
"use client";

import { useEffect, useState } from "react";
// import { getUsers, updateUserRole, updateUserStatus, deleteUser, User, Role, Status } from "@/lib/api";
import {  User, Role, Status } from "@/lib/api";
// import { getUsers, updateUserRole, updateUserStatus, deleteUser, User, Role, Status } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Users,
  ShieldCheck,
  Fingerprint,
  MoreHorizontal,
  ShieldAlert
} from "lucide-react";
import { deleteUser, getUsers, updateUserRole, updateUserStatus } from "@/api/adminApi";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const pageSize = 8;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res);
    } catch (err) {
      addToast("Access Denied: Could not reach User Registry", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateUserRole(id, role);
      fetchUsers();
      addToast(`Privileges Elevated: ${role.toUpperCase()}`, "success");
    } catch {
      addToast("Authorization Override Failed", "error");
    }
  };

  const handleStatusChange = async (id: string, status: Status) => {
    try {
      await updateUserStatus(id, status);
      fetchUsers();
      addToast(`Account Status: ${status.toUpperCase()}`, "success");
    } catch {
      addToast("Status Toggle Protocol Failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("CRITICAL: Purge this identity from the central registry?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
      addToast("Identity Purged", "success");
    } catch {
      addToast("Purge Protocol Interrupted", "error");
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats for the "Executive Ribbon"
  const adminCount = users.filter(u => u.role === "admin").length;
  const activeCount = users.filter(u => u.status === "active").length;

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="max-w-9xl ml-40 my-10 animate-in fade-in duration-700">
        {/* <div className="bg-[#F8F9FA] "> */}
        <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-10">

          <PageHeader
            title="Identity & Access"
            highlightedTitle="Management"
            systemLabel="Security Operations Center"
          />

          {/* EXECUTIVE DATA RIBBON */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                Security Infrastructure Summary
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Registered Identities", val: users.length, icon: <Users />, color: "text-green-darkest" },
                { label: "Active Sessions", val: activeCount, icon: <UserCheck />, color: "text-emerald-600" },
                { label: "System Administrators", val: adminCount, icon: <ShieldCheck />, color: "text-yellow-gold" },
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

          {/* SEARCH & FILTER AREA */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Fingerprint size={14} className="text-yellow-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
                  Global Registry Search
                </span>
              </div>
              <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-green-darkest transition-colors" />
                <input
                  type="text"
                  placeholder="Query by Name or Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border-0 shadow-md rounded-lg py-3 pl-12 pr-4 text-xs font-mono text-green-darkest outline-none ring-1 ring-transparent focus:ring-yellow-gold/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* THE MAIN CONSOLE (TABLE) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-gold/10 to-green-darkest/5 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-white border border-green-darkest/5 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-green-darkest/5 bg-gradient-to-br from-black/20 to-transparent bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Security Level</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Date</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-darkest/5">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-xs font-mono text-slate-400 animate-pulse">Initializing Data Stream...</td></tr>
                  ) : paginated.map((user) => {
                    const isSelf = currentUser?._id === user._id;
                    const isLastAdmin = user.role === "admin" && adminCount === 1;

                    return (
                      <tr key={user._id} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-1">
                          <div className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-black/20 to-transparent flex items-center justify-center border border-green-darkest/5 group-hover:border-lime-500 transition-all font-black text-green-darkest text-[10px]">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-green-darkest uppercase tracking-tight">{user.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-1">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value as Role)}
                            disabled={isSelf || isLastAdmin}
                            className="bg-transparent text-[9px] font-black uppercase tracking-widest text-green-darkest outline-none cursor-pointer disabled:opacity-30"
                          >
                            <option value="admin">Admin</option>
                            <option value="lecturer">Lecturer</option>
                            <option value="coordinator">Coordinator</option>
                          </select>
                        </td>
                        <td className="px-6 py-1">
                          <button
                            onClick={() => handleStatusChange(user._id, user.status === "active" ? "suspended" : "active")}
                            disabled={isSelf}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${
                              user.status === "active"
                                ? "text-emerald-600 "
                                : "text-red-500 "
                            } disabled:opacity-30`}
                          >
                            {user.status}
                          </button>
                        </td>
                        <td className="px-6 py-1 text-[10px] font-mono text-slate-400 uppercase">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-1 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDelete(user._id)}
                              disabled={isSelf || isLastAdmin}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-10"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button className="p-2 text-slate-300 hover:text-green-darkest transition-all">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  Registry Page <span className="text-green-darkest font-bold">{currentPage}</span> / {totalPages}
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
             <p className="text-[9px] font-black uppercase tracking-[0.2em]">Restricted Access Control Console</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
