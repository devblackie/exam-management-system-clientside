
"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { getCoordinatorLecturers, createLecturer } from "@/api/coordinatorApi";
import type { User } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";

export default function CoordinatorLecturersPage() {
  const { addToast } = useToast();
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newLecturer, setNewLecturer] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [adding, setAdding] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  // Sorting
  const [sortBy, setSortBy] = useState<keyof User>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Fetch lecturers
  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const data = await getCoordinatorLecturers();
      setLecturers(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load lecturers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  // Add lecturer
  const handleAddLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecturer.name || !newLecturer.email) {
      addToast("Name and email are required", "error");
      return;
    }

    try {
      setAdding(true);
      await createLecturer(newLecturer);
      addToast("Lecturer added successfully");
      setNewLecturer({ name: "", email: "", password: "" });
      setIsOpen(false);
      fetchLecturers();
    } catch (err) {
      console.error(err);
      addToast("Failed to add lecturer", "error");
    } finally {
      setAdding(false);
    }
  };

  // Search & Filter
  const filtered = lecturers.filter(
    (lec) =>
      lec.name.toLowerCase().includes(search.toLowerCase()) ||
      lec.email.toLowerCase().includes(search.toLowerCase())
  );

  // Sorting (multi-column)
  const sorted = [...filtered].sort((a, b) => {
    const fields: (keyof User)[] = ["name", "email", "status"];
    for (const field of fields) {
      let comp = 0;
      if (a[field]! < b[field]!) comp = -1;
      if (a[field]! > b[field]!) comp = 1;
      if (comp !== 0) {
        return sortOrder === "asc" ? comp : -comp;
      }
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / perPage);
  const displayed = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Manage Lecturers</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Lecturer
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                {["Name", "Email", "Status", "Role", "Created"].map((header, i) => (
                  <th
                    key={i}
                    onClick={() => {
                      const key = header.toLowerCase() as keyof User;
                      if (sortBy === key) {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy(key);
                        setSortOrder("asc");
                      }
                    }}
                    className="p-2 border cursor-pointer select-none"
                  >
                    {header}{" "}
                    {sortBy === header.toLowerCase() && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.length > 0 ? (
                displayed.map((lec) => (
                  <tr key={lec._id} className="hover:bg-gray-50 text-sm">
                    <td className="p-2 border">{lec.name}</td>
                    <td className="p-2 border">{lec.email}</td>
                    <td className="p-2 border capitalize">{lec.status}</td>
                    <td className="p-2 border capitalize">{lec.role}</td>
                    <td className="p-2 border">
                      {new Date(lec.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No lecturers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <div className="space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Lecturer Dialog */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
          >
            <Dialog.Title className="text-lg font-semibold mb-3">
              Add Lecturer
            </Dialog.Title>
            <form onSubmit={handleAddLecturer} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newLecturer.name}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, name: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={newLecturer.email}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, email: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="password"
                placeholder="Password (optional)"
                value={newLecturer.password}
                onChange={(e) =>
                  setNewLecturer({ ...newLecturer, password: e.target.value })
                }
                className="border p-2 rounded w-full"
              />

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </Dialog>
    </div>
  );
}
