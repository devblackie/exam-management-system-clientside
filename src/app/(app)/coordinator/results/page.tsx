"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Student {
  name: string;
  regNo: string;
  yearOfStudy?: number;
  semester?: number;
}

interface Unit {
  _id: string;
  name: string;
  code: string;
  yearOfStudy?: number;
  semester?: number;
}

interface MarkRecord {
  _id: string;
  unit: Unit;
  cat1?: number;
  cat2?: number;
  cat3?: number;
  assignment?: number;
  practical?: number;
  exam?: number;
  total: number;
}

export default function CoordinatorStudentResults() {
  const [regNo, setRegNo] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Record<string, MarkRecord[]>>({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async () => {
    if (!regNo.trim()) {
      addToast("Please enter a registration number", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/coordinator/students/${regNo}/results`);
      if (!res.ok) throw new Error("Student not found or server error");

      const data = await res.json();
      setStudent(data.student);
      setResults(data.results);
      addToast("Student results loaded", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to fetch results", "error");
      setStudent(null);
      setResults({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowed={["coordinator"]}>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          Student Results Lookup
        </h1>

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            placeholder="Enter registration number e.g. CSE/001/2024"
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results Display */}
        {student && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="p-4 bg-gray-100 rounded-lg">
              <p>
                <strong>Name:</strong> {student.name}
              </p>
              <p>
                <strong>Reg No:</strong> {student.regNo}
              </p>
              <p>
                <strong>Current Year:</strong> {student.yearOfStudy}
              </p>
              <p>
                <strong>Semester:</strong> {student.semester}
              </p>
            </div>

            {Object.keys(results).length > 0 ? (
              Object.entries(results).map(([group, marks]) => (
                <div key={group} className="bg-white shadow-md rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-yellow-700 mb-3">
                    {group}
                  </h2>
                  <table className="w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-green-darkest">
                        <th className="p-2 text-left">Unit Code</th>
                        <th className="p-2 text-left">Unit Name</th>
                        <th className="p-2 text-center">CAT 1</th>
                        <th className="p-2 text-center">CAT 2</th>
                        <th className="p-2 text-center">CAT 3</th>
                        <th className="p-2 text-center">Assignment</th>
                        <th className="p-2 text-center">Practical</th>
                        <th className="p-2 text-center">Exam</th>
                        <th className="p-2 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map((m) => (
                        <tr key={m._id} className="border-t">
                          <td className="p-2">{m.unit.code}</td>
                          <td className="p-2">{m.unit.name}</td>
                          <td className="p-2 text-center">{m.cat1 ?? "-"}</td>
                          <td className="p-2 text-center">{m.cat2 ?? "-"}</td>
                          <td className="p-2 text-center">{m.cat3 ?? "-"}</td>
                          <td className="p-2 text-center">
                            {m.assignment ?? "-"}
                          </td>
                          <td className="p-2 text-center">
                            {m.practical ?? "-"}
                          </td>
                          <td className="p-2 text-center">{m.exam ?? "-"}</td>
                          <td className="p-2 text-center font-semibold text-green-700">
                            {m.total.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No results found for this student.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
