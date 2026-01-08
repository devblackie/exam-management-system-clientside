// src/app/coordinator/marks/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { getUnits } from "@/api/unitsApii";
import { getUnitMarks } from "@/api/marksApi";
import MarksInputForm from "@/components/coordinator/MarksInputForm";
import { generateSenateReport } from "@/lib/generateSenateReport";
import type { Unit } from "@/api/types";
import type { StudentMarkRecord } from "@/types/marks";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CoordinatorMarksPage() {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [studentData, setStudentData] = useState<StudentMarkRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 📦 Fetch all units on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getUnits();
        setUnits(data);
      } catch (err) {
        addToast("Failed to fetch units", "error");
      }
    })();
  }, [addToast]);

  // 📦 Fetch marks for the selected unit
  useEffect(() => {
    if (!selectedUnit) return;

    async function fetchMarks() {
      try {
        setLoading(true);
        const data = await getUnitMarks(selectedUnit);

        const mappedData: StudentMarkRecord[] = data.map((m: any) => ({
          regNo: m.student?.regNo ?? "N/A",
          name: `${m.student?.firstName ?? ""} ${
            m.student?.lastName ?? ""
          }`.trim(),
          program: m.student?.programName ?? "Unknown",
          unitCode: m.unit?.code ?? "",
          unitName: m.unit?.name ?? "",
          cat1: m.cat1 ?? 0,
          cat2: m.cat2 ?? 0,
          cat3: m.cat3 ?? 0,
          assignment: m.assignment ?? 0,
          practical: m.practical ?? 0,
          exam: m.exam ?? 0,
          total: m.total ?? 0,
          status: m.status ?? "Pending",
        }));

        setStudentData(mappedData);
      } catch (err) {
        console.error(err);
        addToast("Failed to fetch student marks", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchMarks();
  }, [selectedUnit, addToast]);

  return (
    <ProtectedRoute allowed={["coordinator"]}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Coordinator Marks Management
            </h1>

            <div className="flex gap-4">
              {/* 🧾 Export Senate Report */}
              <button
                disabled={studentData.length === 0}
                onClick={() =>
                  generateSenateReport({
                    institutionName: "Kenya Institute of Technology",
                    programName: "BSc Computer Science",
                    year: "Year 2",
                    semester: "Semester 1",
                    coordinatorName: "John Doe",
                    students: studentData,
                  })
                }
                className={`px-4 py-2 rounded-lg transition ${
                  studentData.length === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-darkest text-white hover:bg-green-700"
                }`}
              >
                Export Senate Report PDF
              </button>

              {/* ➕ Add Marks */}
              <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-yellow-500 text-green-darkest rounded-lg hover:bg-yellow-400 transition"
              >
                Add Marks
              </button>
            </div>
          </div>

          {/* 📘 Unit Selector */}
          <div className="mb-6">
            <label className="block text-green-darkest font-medium mb-2">
              Select Unit
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-yellow-400"
            >
              <option value="">-- Choose a Unit --</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* 📊 Marks Table */}
          <motion.div
            className="mt-6 border-t border-gray-200 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-lg font-medium mb-2">
              Submitted Marks Records
            </h2>

            {loading ? (
              <p className="text-gray-500 italic">Loading marks...</p>
            ) : studentData.length === 0 ? (
              <p className="text-gray-500">No marks submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm text-green-darkest">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1 text-left">Reg No</th>
                      <th className="border px-2 py-1 text-left">Name</th>
                      <th className="border px-2 py-1 text-left">Unit</th>
                      <th className="border px-2 py-1">CAT1</th>
                      <th className="border px-2 py-1">CAT2</th>
                      <th className="border px-2 py-1">CAT3</th>
                      <th className="border px-2 py-1">Assignment</th>
                      <th className="border px-2 py-1">Practical</th>
                      <th className="border px-2 py-1">Exam</th>
                      <th className="border px-2 py-1">Total</th>
                      <th className="border px-2 py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentData.map((record) => (
                      <tr key={record.regNo}>
                        <td className="border px-2 py-1">{record.regNo}</td>
                        <td className="border px-2 py-1">{record.name}</td>
                        <td className="border px-2 py-1">
                          {record.unitCode ?? "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {record.cat1 ?? "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {record.cat2 ?? "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {record.cat3 ?? "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {record.assignment ?? "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {record.practical ?? "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {record.exam ?? "-"}
                        </td>
                        <td className="border px-2 py-1 text-center font-semibold">
                          {record.total?.toFixed(1) ?? "-"}
                        </td>
                        <td
                          className={`border px-2 py-1 text-center ${
                            record.status === "Pass"
                              ? "text-green-600"
                              : record.status === "Supplementary"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {record.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* 🧾 Marks Input Dialog */}
        <Transition show={isOpen}>
          <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            </Transition.Child>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4">
                    Enter Marks
                  </Dialog.Title>

                  {/* Unit Selector */}
                  <div className="mb-4">
                    <label className="block text-green-darkest font-medium mb-2">
                      Select Unit
                    </label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-yellow-400"
                    >
                      <option value="">-- Choose a Unit --</option>
                      {units.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.code} - {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedUnit && (
                    <MarksInputForm
                      unitId={selectedUnit}
                      isOpen={isOpen}
                      onClose={() => {
                        setIsOpen(false);
                        addToast("Marks submitted successfully!", "success");
                        setSelectedUnit("");
                      }}
                    />
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </ProtectedRoute>
  );
}
