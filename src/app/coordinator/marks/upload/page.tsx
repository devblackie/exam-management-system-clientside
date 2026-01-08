"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

export default function UploadMarksPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setData(parsedData);
      setPreviewOpen(true);
    };
    reader.readAsBinaryString(selectedFile);
  };

  // Handle submit to backend
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/coordinator/marks/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
        credentials: "include", // important for httpOnly cookies
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to upload marks");

      setSuccess("Marks uploaded successfully!");
      setPreviewOpen(false);
      setData([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md"
      >
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Upload Marks (Excel)
        </h1>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-xl">
          <ArrowUpTrayIcon className="w-10 h-10 text-gray-500 mb-2" />
          <p className="text-gray-600 mb-3">Select an Excel file (.xlsx)</p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="file-input text-sm"
          />
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}
        {success && <p className="text-green-600 mt-4">{success}</p>}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
              <h2 className="text-xl font-bold mb-4">Preview Marks Data</h2>
              <div className="overflow-auto max-h-[60vh] border rounded-lg">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(data[0] || {}).map((key) => (
                        <th
                          key={key}
                          className="border px-4 py-2 text-left font-medium text-green-darkest"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i} className="odd:bg-gray-50">
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="border px-4 py-2">
                            {value as string}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Submit Marks"}
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </motion.div>
    </div>
  );
}
