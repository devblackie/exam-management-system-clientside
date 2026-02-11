// clientside/src/components/coordinator/MarksInputForm.tsx
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Dialog, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { submitMarks } from "@/api/unitsApii";
import { useToast } from "@/context/ToastContext";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ExcelRow = [string?, number?, number?, number?, number?, number?, number?];

interface StudentMark {
  studentId: string;
  cat1?: number;
  cat2?: number;
  cat3?: number;
  assignment?: number;
  practical?: number;
  exam?: number;
}

interface MarksInputFormProps {
  unitId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MarksInputForm({
  unitId,
  isOpen,
  onClose,
}: MarksInputFormProps) {
  const { addToast } = useToast();
  const [marks, setMarks] = useState<StudentMark[]>([
    {
      studentId: "",
      cat1: 0,
      cat2: 0,
      cat3: 0,
      assignment: 0,
      practical: 0,
      exam: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);

  /** ➕ Add new student row */
  const addRow = () => {
    setMarks([
      ...marks,
      {
        studentId: "",
        cat1: 0,
        cat2: 0,
        cat3: 0,
        assignment: 0,
        practical: 0,
        exam: 0,
      },
    ]);
  };

  /** ❌ Remove a student row */
  const removeRow = (index: number) => {
    setMarks((prev) => prev.filter((_, i) => i !== index));
  };

  /** ✏️ Update mark field */
  const handleChange = (
    index: number,
    field: keyof StudentMark,
    value: string
  ) => {
    setMarks((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "studentId" ? value : Number(value) || 0,
      };
      return updated;
    });
  };

  /** 📤 Excel Upload (NEW FEATURE) */
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // rows as arrays

      // Expect header like: studentId | cat1 | cat2 | cat3 | assignment | practical | exam
      const rows = (jsonData.slice(1) as ExcelRow[]).map(
        ([id, cat1, cat2, cat3, assign, practical, exam]) => ({
          studentId: id || "",
          cat1: Number(cat1) || 0,
          cat2: Number(cat2) || 0,
          cat3: Number(cat3) || 0,
          assignment: Number(assign) || 0,
          practical: Number(practical) || 0,
          exam: Number(exam) || 0,
        })
      );

      if (rows.length === 0)
        throw new Error("No valid data found in the Excel file.");

      setMarks(rows);
      addToast("✅ Excel file uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      addToast("❌ Failed to parse Excel file. Please check format.", "error");
    }
  };

  /** 💾 Submit marks */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await submitMarks(unitId, marks);
      addToast("✅ Marks submitted successfully!", "success");
      onClose();
    } catch (error) {
      console.error(error);
      addToast("❌ Failed to submit marks", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-black/40"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl relative">
            {/* ❌ Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <Dialog.Title className="text-xl font-semibold mb-4 text-gray-800">
              Enter Marks
            </Dialog.Title>

            {/* 📤 Upload Excel */}
            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center gap-2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-md cursor-pointer hover:bg-yellow-200 transition">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
                📁 Upload Excel File
              </label>
              <button
                onClick={addRow}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded"
              >
                + Add Row
              </button>
            </div>

            {/* 🧾 Marks Table */}
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border rounded-lg">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-green-darkest sticky top-0">
                  <tr>
                    <th className="px-3 py-2 border">Student ID</th>
                    <th className="px-3 py-2 border">CAT 1</th>
                    <th className="px-3 py-2 border">CAT 2</th>
                    <th className="px-3 py-2 border">CAT 3 (optional)</th>
                    <th className="px-3 py-2 border">Assignment</th>
                    <th className="px-3 py-2 border">Practical</th>
                    <th className="px-3 py-2 border">Exam</th>
                    <th className="px-3 py-2 border">Action</th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>
                    {marks.map((mark, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 border">
                          <input
                            type="text"
                            className="w-full border rounded px-2 py-1"
                            value={mark.studentId}
                            onChange={(e) =>
                              handleChange(idx, "studentId", e.target.value)
                            }
                            placeholder="e.g. CSE/001/2024"
                          />
                        </td>

                        {[
                          "cat1",
                          "cat2",
                          "cat3",
                          "assignment",
                          "practical",
                          "exam",
                        ].map((field) => (
                          <td key={field} className="px-3 py-2 border">
                            <input
                              type="number"
                              className="w-full border rounded px-2 py-1 text-center"
                              value={mark[field as keyof StudentMark] ?? 0}
                              onChange={(e) =>
                                handleChange(
                                  idx,
                                  field as keyof StudentMark,
                                  e.target.value
                                )
                              }
                              min={0}
                              max={100}
                            />
                          </td>
                        ))}

                        <td className="px-3 py-2 border text-center">
                          <button
                            onClick={() => removeRow(idx)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* ✅ Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded bg-gray-200 text-green-darkest hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-5 py-2 rounded text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit Marks"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
