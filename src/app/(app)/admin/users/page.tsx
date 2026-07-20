
// clientside/src/app/admin/users/page.tsx
"use client";

import { useState } from "react";
import { User, Role, Status } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import { useUsers, useUpdateUserRole, useUpdateUserStatus, useUpdateUserDetails, useDeleteUser } from "@/hooks/queries/useAdmin";
import PageHeader from "@/components/ui/PageHeader";
import {
  Search, Trash2, ChevronLeft, ChevronRight, UserCheck, Users, ShieldCheck,
  Fingerprint, MoreHorizontal, ShieldAlert, Edit2, X, Check, Loader2, Globe, Building2,
} from "lucide-react";
import type { School, Department } from "@/api/types";

type EditingUser = { id: string; name: string; schoolCode: string; departmentCode: string; institutionWide: boolean } | null;

export default function ManageUsersPage() {
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const { data: settings } = useInstitutionSettings();
  const schools: School[] = settings?.schools ?? [];

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<EditingUser>(null);

  // React Query hooks
  const { data: users = [], isLoading, refetch } = useUsers();
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const updateDetailsMutation = useUpdateUserDetails();
  const deleteUserMutation = useDeleteUser();

  const pageSize = 8;

  // Filter users based on search
  const filtered = users.filter(
    (u: User) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const adminCount = users.filter((u: User) => u.role === "admin").length;
  const activeCount = users.filter((u: User) => u.status === "active").length;
  const coordinatorCount = users.filter((u: User) => u.role === "coordinator").length;

  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateRoleMutation.mutateAsync({ id, role });
      addToast(`Privileges Elevated: ${role.toUpperCase()}`, "success");
    } catch {
      addToast("Authorization Override Failed", "error");
    }
  };

  const handleStatusChange = async (id: string, status: Status) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      addToast(`Account Status: ${status.toUpperCase()}`, "success");
    } catch {
      addToast("Status Toggle Protocol Failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("CRITICAL: Purge this identity from the central registry?")) return;
    try {
      await deleteUserMutation.mutateAsync(id);
      addToast("Identity Purged", "success");
    } catch {
      addToast("Purge Protocol Interrupted", "error");
    }
  };

  const startEdit = (user: User) => {
    if (user.role !== "coordinator") {
      addToast("Only coordinators can be assigned to schools/departments", "warning");
      return;
    }
    setEditingUser({
      id: user._id,
      name: user.name,
      schoolCode: user.schoolCode || "",
      departmentCode: user.departmentCode || "",
      institutionWide: user.institutionWide || false,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      await updateDetailsMutation.mutateAsync({
        id: editingUser.id,
        data: {
          name: editingUser.name,
          schoolCode: editingUser.schoolCode || undefined,
          departmentCode: editingUser.departmentCode || undefined,
          institutionWide: editingUser.institutionWide,
        },
      });
      addToast("Coordinator details updated successfully", "success");
      setEditingUser(null);
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      addToast(error.response?.data?.message || "Failed to update coordinator details", "error");
    }
  };

  const selectedSchool = schools.find((s) => s.code === editingUser?.schoolCode);
  const departments: Department[] = selectedSchool?.departments ?? [];

  const isSaving = updateDetailsMutation.isPending;

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="max-w-9xl lg:ml-48 mt-10 animate-in fade-in duration-700">
        <div className="bg-[#F8F9FA] min-h-screen rounded shadow-2xl p-10">
          <PageHeader
            title="Identity & Access"
            highlightedTitle="Management"
            systemLabel="Security Operations Center"
          />

          {/* Edit Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Edit Coordinator</h3>
                    <p className="text-[10px] text-slate-400">Update assignment and scope</p>
                  </div>
                  <button onClick={cancelEdit} className="p-1 hover:bg-slate-100 rounded">
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Institution-wide Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-slate-400" />
                      <div>
                        <p className="text-xs font-medium text-slate-700">Institution-wide Access</p>
                        <p className="text-[9px] text-slate-400">See all schools and departments</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...editingUser, institutionWide: !editingUser.institutionWide })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        editingUser.institutionWide ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          editingUser.institutionWide ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {!editingUser.institutionWide && (
                    <>
                      {/* School */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                          School
                        </label>
                        <select
                          value={editingUser.schoolCode}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              schoolCode: e.target.value,
                              departmentCode: "",
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">Select school</option>
                          {schools.map((s) => (
                            <option key={s.code} value={s.code}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                          Department
                        </label>
                        <select
                          value={editingUser.departmentCode}
                          onChange={(e) =>
                            setEditingUser({ ...editingUser, departmentCode: e.target.value })
                          }
                          disabled={!editingUser.schoolCode}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                        >
                          <option value="">Select department</option>
                          {departments.map((d) => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={isSaving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Ribbon */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                Security Infrastructure Summary
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Registered Identities", val: users.length, icon: <Users />, color: "text-green-darkest" },
                { label: "Active Sessions", val: activeCount, icon: <UserCheck />, color: "text-emerald-600" },
                { label: "Coordinators", val: coordinatorCount, icon: <Building2 />, color: "text-blue-600" },
                { label: "System Administrators", val: adminCount, icon: <ShieldCheck />, color: "text-yellow-gold" },
              ].map((stat, index) => (
                <div key={stat.label} className="flex-1 px-6 relative group border-r border-green-darkest/[0.06] last:border-r-0">
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

          {/* Search */}
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

          {/* Users Table */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-gold/10 to-green-darkest/5 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-white border border-green-darkest/5 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-green-darkest/5 bg-gradient-to-br from-black/20 to-transparent bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Security Level</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Assignment</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Date</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-darkest/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-xs font-mono text-slate-400 animate-pulse">
                        Initializing Data Stream...
                       </td>
                    </tr>
                  ) : (
                    paginated.map((user: User) => {
                      const isSelf = currentUser?._id === user._id;
                      const isLastAdmin = user.role === "admin" && adminCount === 1;
                      const schoolInfo = schools.find((s) => s.code === user.schoolCode);
                      const deptInfo = schoolInfo?.departments?.find((d) => d.code === user.departmentCode);

                      return (
                        <tr key={user._id} className="group hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-4">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-black/20 to-transparent flex items-center justify-center border border-green-darkest/5 group-hover:border-lime-500 transition-all font-black text-green-darkest text-[10px]">
                                {user.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-green-darkest uppercase tracking-tight">
                                  {user.name}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400">{user.email}</p>
                              </div>
                            </div>
                           </td>
                          <td className="px-6 py-3">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value as Role)}
                              disabled={isSelf || isLastAdmin || updateRoleMutation.isPending}
                              className="bg-transparent text-[9px] font-black uppercase tracking-widest text-green-darkest outline-none cursor-pointer disabled:opacity-30"
                            >
                              <option value="admin">Admin</option>
                              <option value="lecturer">Lecturer</option>
                              <option value="coordinator">Coordinator</option>
                            </select>
                            {updateRoleMutation.isPending && updateRoleMutation.variables?.id === user._id && (
                              <Loader2 size={10} className="inline ml-1 animate-spin text-slate-400" />
                            )}
                           </td>
                          <td className="px-6 py-3">
                            {user.role === "coordinator" ? (
                              <div className="flex flex-col gap-0.5">
                                {user.institutionWide ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-600">
                                    <Globe size={10} /> Institution-wide
                                  </span>
                                ) : (
                                  <>
                                    <span className="text-[10px] text-slate-500">
                                      {schoolInfo?.name || user.schoolCode || "—"}
                                    </span>
                                    <span className="text-[9px] text-slate-400">
                                      {deptInfo?.name || user.departmentCode || "—"}
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">—</span>
                            )}
                           </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => handleStatusChange(user._id, user.status === "active" ? "suspended" : "active")}
                              disabled={isSelf || updateStatusMutation.isPending}
                              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all ${
                                user.status === "active" ? "text-emerald-600" : "text-red-500"
                              } disabled:opacity-30`}
                            >
                              {user.status}
                            </button>
                            {updateStatusMutation.isPending && updateStatusMutation.variables?.id === user._id && (
                              <Loader2 size={10} className="inline ml-1 animate-spin text-slate-400" />
                            )}
                           </td>
                          <td className="px-6 py-3 text-[10px] font-mono text-slate-400 uppercase">
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                           </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {user.role === "coordinator" && (
                                <button
                                  onClick={() => startEdit(user)}
                                  className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  title="Edit coordinator assignment"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(user._id)}
                                disabled={isSelf || isLastAdmin || deleteUserMutation.isPending}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-10"
                              >
                                {deleteUserMutation.isPending && deleteUserMutation.variables === user._id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                              <button className="p-2 text-slate-300 hover:text-green-darkest transition-all">
                                <MoreHorizontal size={14} />
                              </button>
                            </div>
                           </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="p-6 bg-slate-50/50 border-t border-green-darkest/5 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-darkest disabled:opacity-20 hover:text-yellow-gold transition-colors"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <span className="text-[10px] font-mono text-slate-400">
                  Registry Page <span className="text-green-darkest font-bold">{currentPage}</span> / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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