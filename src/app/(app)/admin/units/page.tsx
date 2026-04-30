"use client";

import { Dialog } from "@headlessui/react";
import { useUnits } from "@/hooks/useUnits";
import Loader from "@/components/ui/Loader";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Units() {
  const {
    programs,
    lecturers,
    program,
    programIdFilter,
    unitName,
    unitCode,
    programId,
    search,
    message,
    loading,
    isModalOpen,
    isEditMode,
    currentUnits,
    totalPages,
    currentPage,
    editingUnit,

    setUnitName,
    setUnitCode,
    setProgramId,
    setSearch,
    setIsModalOpen,
    setCurrentPage,

    sortField,
    sortOrder,
    handleSort,

    handleDeleteUnit,
    handleAssignLecturer,
    handleUnassignLecturer,
    openAddModal,
    openEditModal,
    handleSaveUnit,
  } = useUnits();

  return (
    <ProtectedRoute allowed={["admin", "coordinator"]}>
         <div className="max-w-6xl h-full  ml-48   my-10 ">
      <div className="bg-white rounded-3xl shadow-2xl p-10">

        <h1 className="text-lg font-bold mb-3">Units Management</h1>
        {message && <p className="text-sm text-blue-600 mb-2">{message}</p>}
        {programIdFilter && program && (
          <p className="text-sm text-red-500 mb-2">
            Filtering by program:{" "}
            <b>
              {program.name} ({program.code})
            </b>
          </p>
        )}

        {/* Add Unit Button */}
        <div className="mb-4">
          <button
            onClick={openAddModal}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            + Add Unit
          </button>
        </div>

        {/* Search bar */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search units..."
          className="border p-2 rounded mb-4 w-1/3"
        />

        {/* Table */}
        {loading ? (
          <div className="flex justify-center p-6">
            <Loader />
          </div>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              {/* <tr className="bg-gray-100">
              <th className="p-2 border">Unit Name</th>
              <th className="p-2 border">Code</th>
              <th className="p-2 border">program</th>
              <th className="p-2 border">Lecturer</th>
              <th className="p-2 border">Actions</th>
            </tr> */}
              <tr className="bg-green-darkest">
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Unit Name{" "}
                  {sortField.includes("name") &&
                    (sortOrder[sortField.indexOf("name")] === "asc"
                      ? "↑"
                      : "↓")}
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("code")}
                >
                  Code{" "}
                  {sortField.includes("code") &&
                    (sortOrder[sortField.indexOf("code")] === "asc"
                      ? "↑"
                      : "↓")}
                </th>
                <th
                  className="p-2 border cursor-pointer"
                  onClick={() => handleSort("program")}
                >
                  program{" "}
                  {sortField.includes("program") &&
                    (sortOrder[sortField.indexOf("program")] === "asc"
                      ? "↑"
                      : "↓")}
                </th>
                <th className="p-2 border">Lecturer</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUnits.map((unit) => (
                <tr key={unit._id}>
                  <td className="p-2 border">{unit.name}</td>
                  <td className="p-2 border">{unit.code}</td>
                  <td className="p-2 border">
                    {typeof unit.program === "string"
                      ? programs.find((c) => c._id === unit.program)?.name ||
                        unit.program
                      : `${unit.program?.name} (${unit.program?.code})`}
                  </td>
                  <td className="p-2 border">
                    {unit.lecturer ? (
                      <div className="flex items-center space-x-2">
                        <span>
                          {typeof unit.lecturer === "string"
                            ? lecturers.find((l) => l._id === unit.lecturer)
                                ?.name || "Unknown"
                            : unit.lecturer.name}
                        </span>
                        <button
                          onClick={() => handleUnassignLecturer(unit._id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Unassign
                        </button>
                      </div>
                    ) : (
                      <select
                        onChange={(e) =>
                          handleAssignLecturer(unit._id, e.target.value)
                        }
                        className="border rounded p-1"
                      >
                        <option value="">Assign lecturer</option>
                        {lecturers.map((lec) => (
                          <option key={lec._id} value={lec._id}>
                            {lec.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => openEditModal(unit)}
                      className="text-blue-500"
                    >
                      Edit
                    </button>{" "}
                    <button
                      onClick={() => handleDeleteUnit(unit._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={
                  currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                }
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Dialog.Panel className="bg-white p-6 rounded shadow w-96">
              <Dialog.Title>
                {isEditMode ? "Edit Unit" : "Add Unit"}
              </Dialog.Title>
              <input
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Unit Name"
                className="border p-2 rounded w-full mb-2"
              />
              <input
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                placeholder="Unit Code"
                className="border p-2 rounded w-full mb-2"
              />
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="border p-2 rounded w-full mb-4"
              >
                <option value="">Select program</option>
                {programs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 px-3 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUnit}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  {isEditMode ? "Update" : "Create"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
      </div>
    </ProtectedRoute>
  );
}
