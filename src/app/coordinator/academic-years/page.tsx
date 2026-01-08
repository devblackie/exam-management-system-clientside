// clientside/src/app/coordinator/academic-years/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createAcademicYear, getAcademicYears } from "@/api/academicYearsApi";
import { useToast } from "@/context/ToastContext";
import { Plus, Edit2, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

interface AcademicYear {
  _id: string;
  year: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { addToast } = useToast();

  const loadYears = async () => {
    setLoading(true);
    try {
      const data = await getAcademicYears();
      setYears(data || []);
    } catch {
      console.error("Failed to load academic years");
      addToast("Failed to load academic years", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const autoFill = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;
    const academicYear =
      today.getMonth() >= 7
        ? `${currentYear}/${nextYear}`
        : `${currentYear - 1}/${currentYear}`;

    setYear(academicYear);
    setStartDate(`${academicYear.split("/")[0]}-08-01`);
    setEndDate(`${academicYear.split("/")[1]}-07-31`);
    addToast("Auto-filled current academic year", "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !startDate || !endDate) {
      addToast("All fields are required", "error");
      return;
    }

    setSubmitting(true);
    try {
      await createAcademicYear({ year, startDate, endDate });
      addToast(`Academic Year ${year} created successfully!`, "success");
      setShowForm(false);
      setYear("");
      setStartDate("");
      setEndDate("");
      await loadYears();
    } catch {
      console.error("Failed to create academic year");
      addToast( "Failed to create academic year",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-dark border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-medium text-green-dark">
            Loading academic years...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl  ml-48  my-10 ">
      <div className="bg-white max-w-full min-h-screen rounded-3xl shadow-2xl p-10">
        {/* Header */}

        <div className=" rounded-lg shadow-md border border-green-dark/20 p-4 ">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r  from-green-darkest to-green-dark">
                Academic Years Management
              </h1>
              <p className=" text-green-darkest">
                Configure and manage academic calendar periods
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright font-bold text-md rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition"
            >
              <Plus className="w-6 h-6" />
              Add New Academic Year
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8 overflow-hidden">
          <div className="px-8 py-2 border-b border-green-dark bg-green-dark/10">
            <h2 className="text-xl font-semibold text-green-darkest">
              All Academic Years
            </h2>
          </div>

          {years.length === 0 ? (
            <div className="text-center py-24">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <p className="text-xl text-gray-500">
                No academic years configured yet
              </p>
              <p className="text-gray-500 mt-2">
                Click &quot;Add New Academic Year&quot; to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
                  <tr>
                    <th className="text-left px-4 py-5 font-bold ">
                      Academic Year
                    </th>
                    <th className="text-left px-4 py-5 font-bold ">Duration</th>
                    <th className="text-left px-4 py-5 font-bold ">
                      Start Date
                    </th>
                    <th className="text-left px-4 py-5 font-bold ">End Date</th>
                    <th className="text-center px-4 py-5 font-bold ">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((y) => (
                    <tr
                      key={y._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-2 font-mono text-lg font-semibold text-green-dark">
                        {y.year}
                      </td>
                      <td className="px-4 py-2 text-green-darkest">
                        {new Date(y.startDate).toLocaleDateString()} →{" "}
                        {new Date(y.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-green-darkest">
                        {new Date(y.startDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-2 text-green-darkest">
                        {new Date(y.endDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {y.isCurrent ? (
                          <span className="inline-flex items-center gap-2 px-5 py-1 bg-green-100 text-green-800 rounded-full font-bold text-lg">
                            <CheckCircle2 className="w-6 h-6" />
                            CURRENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                            <AlertCircle className="w-5 h-5" />
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-3xl shadow-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-10 py-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  Create New Academic Year
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-red-600 text-4xl font-light hover:rotate-90 transition"
                  disabled={submitting}
                >
                  ×
                </button>
              </div>

              <div className="p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-bold text-gray-700 mb-3">
                        Academic Year
                      </label>
                      <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g. 2024/2025"
                        required
                        className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-600 focus:outline-none transition"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={autoFill}
                        disabled={submitting}
                        className="w-full px-8 py-5 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-xl transition"
                      >
                        Auto-Fill Current Year
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-bold text-gray-700 mb-3">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-600 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-gray-700 mb-3">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl text-lg focus:border-blue-600 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 pt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-6 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold text-2xl rounded-xl hover:shadow-2xl transition disabled:opacity-70 flex items-center justify-center gap-4"
                    >
                      {submitting ? (
                        <>
                          <span className="inline-block w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                          Creating...
                        </>
                      ) : (
                        "Create Academic Year"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                      className="px-12 py-6 bg-gray-500 hover:bg-gray-600 text-white font-bold text-xl rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
