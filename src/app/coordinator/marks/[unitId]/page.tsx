// src/app/coordinator/marks/[unitId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getUnitDetails, getStudentsInUnit, submitMarks } from "@/api/marksApi";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";

interface Student {
  _id: string;
  regNo: string;
  name: string;
}

interface Unit {
  _id: string;
  name: string;
  code: string;
  yearOfStudy?: number;
  semester?: number;
}

interface MarkInput {
  cat1: number;
  cat2: number;
  cat3?: number;
  assignment?: number;
  practical?: number;
  exam: number;
}

export default function CoordinatorMarksPage() {
  const { addToast } = useToast();
  const params = useParams();
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, MarkInput>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [unitData, studentsData] = await Promise.all([
          getUnitDetails(unitId),
          getStudentsInUnit(unitId),
        ]);
        setUnit(unitData);
        setStudents(studentsData);
      } catch (err) {
        console.error(err);
        addToast("Failed to load unit or students", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [unitId, addToast]);

  function handleChange(studentId: string, field: keyof MarkInput, value: string) {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Number(value),
      },
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitMarks(unitId, marks);
      addToast("Marks submitted successfully");
      setMarks({});
    } catch (err) {
      console.error(err);
      addToast("Failed to submit marks", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow rounded-lg p-5"
      >
        <h1 className="text-2xl font-semibold mb-2">{unit?.name}</h1>
        <p className="text-gray-600">Code: {unit?.code}</p>
        <p className="text-gray-600">
          Year {unit?.yearOfStudy} • Semester {unit?.semester}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow rounded-lg overflow-x-auto"
      >
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border-b">Reg No</th>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">CAT 1</th>
              <th className="px-4 py-2 border-b">CAT 2</th>
              <th className="px-4 py-2 border-b">CAT 3</th>
              <th className="px-4 py-2 border-b">Assignment</th>
              <th className="px-4 py-2 border-b">Practical</th>
              <th className="px-4 py-2 border-b">Exam</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{student.regNo}</td>
                <td className="px-4 py-2 border-b">{student.name}</td>
                {["cat1", "cat2", "cat3", "assignment", "practical", "exam"].map(
                  (field) => (
                    <td key={field} className="px-2 py-1 border-b">
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1 text-sm"
                        onChange={(e) =>
                          handleChange(student._id, field as keyof MarkInput, e.target.value)
                        }
                        value={marks[student._id]?.[field as keyof MarkInput] ?? ""}
                      />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md"
      >
        {submitting ? "Submitting..." : "Submit Marks"}
      </button>
    </div>
  );
}
