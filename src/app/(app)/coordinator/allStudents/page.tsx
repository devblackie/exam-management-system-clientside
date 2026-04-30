
"use client";

import { useState, useEffect, useCallback } from "react";
import type { StudentFromAPI } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import { X, Trash2, PenLine, ChevronLeft, ChevronRight, Search, Save, Command } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { deleteStudent, getStudents, updateStudentName } from "@/api/studentsApi";

export default function StudentData() {
  const [studentData, setStudentData] = useState<StudentFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. The core fetch function
  const loadStudents = useCallback(
    async (query: string, page: number) => {
      setLoading(true);
      try {
        const data = await getStudents(query, page);
        setStudentData(data.students);
        setTotalPages(data.totalPages);
      } catch {
        addToast("Failed to load students.", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  // 2. The Debounce Effect
  useEffect(() => {
    // This timer waits for the user to stop typing for 500ms
    const handler = setTimeout(() => {
      loadStudents(searchTerm, currentPage);
    }, 500);

    // If searchTerm or currentPage changes before 500ms, clear the timer
    return () => clearTimeout(handler);
  }, [searchTerm, currentPage, loadStudents]);

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1); // Reset to page 1 on every new search
  };

  const startEdit = (student: StudentFromAPI) => {
    setEditingId(student._id!);
    setEditName(student.name);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;

    setSubmitting(true);
    try {
      await updateStudentName(editingId, editName);
      addToast("Student name updated.", "success");
      setEditingId(null);
      // Reload current state
      loadStudents(searchTerm, currentPage);
    } catch {
      addToast("Update failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, regNo: string) => {
    if (!confirm(`Permanently remove ${regNo} from registry?`)) return;
    setSubmitting(true);
    try {
      await deleteStudent(id);
      addToast("Student purged.", "success");
      loadStudents(searchTerm, currentPage);
    } catch {
      addToast("Purge failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Only show the big loading screen on initial mount
  if (loading && studentData.length === 0)
    return <LoadingState message="Loading Registry..." />;

  return (
    <div className="max-w-8xl ml-48 my-10 ">
      <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-10">
        <PageHeader
          title="Student"
          highlightedTitle="Registry"
          subtitle="Direct database management for active enrollments."
        />

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by Name or Reg.No..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-xl text-green-darkest  text-xs outline-none shadow-sm"
            />
          </div>
          <div className="px-8 py-4 bg-slate-100 rounded-xl flex items-center gap-4">
            <Command size={16} className="text-yellow-gold" />
            <span className="text-[10px] font-black text-green-darkest uppercase tracking-widest">
              Total: {studentData.length} Records
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b text-[10px] text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5 text-left font-black">Reg No</th>
                <th className="px-8 py-5 text-left font-black">Full Name</th>
                {/* <th className="px-8 py-5 text-left font-black">Program</th> */}
                <th className="px-8 py-5 font-black text-center">Year</th>
                <th className="px-8 py-5 text-center font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {studentData.map((student) => (
                <tr
                  key={student._id}
                  className="group hover:bg-slate-50/50 transition-all"
                >
                  <td className="px-8 py-4">
                    <span className="text-xs font-mono font-bold text-green-darkest bg-slate-100 px-3 py-1 rounded-md">
                      {student.regNo}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    {editingId === student._id ? (
                      <form
                        onSubmit={handleUpdate}
                        className="flex gap-2 items-center"
                      >
                        <input
                          autoFocus
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 p-2 border-2 border-yellow-gold rounded-lg font-bold text-green-darkest text-xs outline-none"
                        />
                        <button
                          type="submit"
                          disabled={submitting}
                          className="p-2 bg-green-darkest text-yellow-gold rounded-lg hover:scale-105 transition-transform"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-2 text-slate-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs font-bold text-green-darkest">
                        {student.name}
                      </span>
                    )}
                  </td>
                  {/* <td className="px-8 py-4">
                    <span className="text-[10px] text-slate-500 font-medium uppercase truncate block max-w-[200px]">
                      {typeof student.program === "object"
                        ? student.program.name
                        : "N/A"}
                    </span>
                  </td> */}
                  <td className="px-8 py-4 text-center">
                    <span className="text-xs font-black text-slate-300">
                      Y{student.currentYearOfStudy}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(student)}
                        className="p-2 text-slate-400 hover:text-green-darkest hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-100 transition-all"
                      >
                        <PenLine size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(student._id!, student.regNo)
                        }
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}