"use client";

import { useEffect, useState } from "react";
import { getUsers, updateUserRole, updateUserStatus, deleteUser, User, Role, Status } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/context/ToastContext";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const { user: currentUser } = useAuth();
  const pageSize = 5;

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch users", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Role change
  const handleRoleChange = async (id: string, role: Role) => {
    try {
      await updateUserRole(id, role);
      fetchUsers();
      addToast("Role updated", "success");
    } catch {
      addToast("Failed to update role", "error");
    }
  };

  // Status toggle
  const handleStatusChange = async (id: string, status: Status) => {
    try {
      await updateUserStatus(id, status);
      fetchUsers();
      addToast(`User ${status}`, "success");
    } catch {
      addToast("Failed to update status", "error");
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
      addToast("User deleted", "success");
    } catch {
      addToast("Failed to delete user", "error");
    }
  };

  // Pagination + search
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="p-6 min-h-screen bg-yellow-gold">
        <h1 className="text-2xl font-bold mb-4 text-green-darkest">Manage Users</h1>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-green-darkest rounded-md focus:outline-none focus:ring-0 text-green-darkest mb-4"
          
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-green-dark text-left">
            <thead className="bg-green-darkest text-white">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(user => {
                const isSelf = currentUser?._id === user._id;
                const isLastAdmin = user.role === "admin" && adminCount === 1;

                return (
                  <tr key={user._id} className="border-t border-green-dark text-sm text-green-darkest">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>

                    {/* Role */}
                    <td className="px-4 py-2">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user._id, e.target.value as Role)}
                        className="border p-1 rounded"
                        disabled={isSelf || isLastAdmin}
                      >
                        <option value="admin">Admin</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="coordinator">Coordinator</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2">
                      <button
                        onClick={() =>
                          handleStatusChange(user._id, user.status === "active" ? "suspended" : "active")
                        }
                        className={`px-3 py-1 rounded ${user.status === "active" ? "bg-green-600 text-white" : "bg-yellow-500 text-white"}`}
                        disabled={isSelf}
                      >
                        {user.status === "active" ? "Active" : "Suspended"}
                      </button>
                    </td>

                    <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>

                    {/* Delete */}
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                        disabled={isSelf || isLastAdmin}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
                        className="flex items-center px-3 py-1 bg-green-darkest rounded disabled:opacity-50"

          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Previous
          </button>
         <span className="text-green-darkest font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
                        className="flex items-center px-3 py-1 bg-green-darkest rounded disabled:opacity-50"

          >
            Next
            <ChevronRightIcon className="h-5 w-5 ml-1" />
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
