"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getUnits,
  createUnit,
  deleteUnit,
  updateUnit,
  assignLecturerToUnit,
  unassignLecturerFromUnit,
} from "@/api/unitsApii";
import { getLecturers } from "@/api/lecturersApi";
// import { getprograms, getprogramById } from "@/api/programsApi";
import type { Unit, Lecturer, User, Program } from "@/api/types";

export function useUnits() {
  const searchParams = useSearchParams();
  const programIdFilter = searchParams.get("programId");

  // State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // program info
  const [program, setProgram] = useState<Program | null>(null);

  // Modal + form state
  const [unitName, setUnitName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [programId, setProgramId] = useState(programIdFilter || "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<("name" | "code" | "program")[]>([
    "program",
    "name",
  ]);
  const [sortOrder, setSortOrder] = useState<("asc" | "desc")[]>([
    "asc",
    "asc",
  ]);

  /** 🔹 Fetch units */
  useEffect(() => {
    (async () => {
      try {
        const data = await getUnits();
        setUnits(
          programIdFilter
            ? data.filter((u) => u.programId === programIdFilter)
            : data
        );
      } catch (err) {
        console.error("Failed to fetch units", err);
        setMessage("❌ Failed to load units");
      } finally {
        setLoading(false);
      }
    })();
  }, [programIdFilter]);

  /** 🔹 Fetch lecturers */
  useEffect(() => {
    (async () => {
      try {
        const data: User[] = await getLecturers();
        setLecturers(data.filter((u): u is Lecturer => u.role === "lecturer"));
      } catch (err) {
        console.error("Failed to fetch lecturers", err);
        setMessage("❌ Failed to load lecturers");
      }
    })();
  }, []);

  /** 🔹 Fetch single program info */
  useEffect(() => {
    if (!programIdFilter) return;
    (async () => {
      try {
        const c = await getProgramById(programIdFilter);
        setProgram(c);
      } catch (err) {
        console.error("Failed to fetch program", err);
      }
    })();
  }, [programIdFilter]);

  /** 🔹 Fetch programs */
  useEffect(() => {
    (async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
        if (programIdFilter && data.some((c) => c._id === programIdFilter)) {
          setProgramId(programIdFilter);
        }
      } catch (err) {
        console.error("Failed to fetch programs", err);
        setMessage("❌ Failed to load programs");
      }
    })();
  }, [programIdFilter]);

  /** 🔹 Open Add Modal */
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingUnit(null);
    setUnitName("");
    setUnitCode("");
    setProgramId(programIdFilter || "");
    setIsModalOpen(true);
  };

  /** 🔹 Open Edit Modal */
  const openEditModal = (unit: Unit) => {
    setIsEditMode(true);
    setEditingUnit(unit);
    setUnitName(unit.name);
    setUnitCode(unit.code);
    setProgramId(
      typeof unit.program === "string" ? unit.program : unit.program?._id || ""
    );
    setIsModalOpen(true);
  };

  /** 🔹 Save (Add or Update) */
  const handleSaveUnit = async () => {
    const finalProgramId = programIdFilter || programId;
    if (!unitName || !unitCode || !finalProgramId) {
      setMessage("⚠️ Please enter unit name, code, and select a program");
      return;
    }

    try {
      if (isEditMode && editingUnit) {
        // update existing
        const updated = await updateUnit(editingUnit._id, {
          name: unitName,
          code: unitCode,
          program: finalProgramId,
        });
        setUnits((prev) =>
          prev.map((u) => (u._id === updated._id ? updated : u))
        );
        setMessage("✅ Unit updated successfully");
      } else {
        // create new
        const newUnit = await createUnit({
          name: unitName,
          code: unitCode,
          program: finalProgramId,
        });
        setUnits((prev) => [...prev, newUnit]);
        setMessage("✅ Unit created");
      }

      setIsModalOpen(false);
      setEditingUnit(null);
      setUnitName("");
      setUnitCode("");
      if (!programIdFilter) setProgramId("");
    } catch (err) {
      console.error("Failed to save unit", err);
      setMessage("❌ Failed to save unit");
    }
  };

  /** 🔹 Delete Unit */
  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm("Delete this unit?")) return;
    try {
      await deleteUnit(unitId);
      setUnits((prev) => prev.filter((u) => u._id !== unitId));
      setMessage("✅ Unit deleted");
    } catch (err) {
      console.error("Failed to delete unit", err);
      setMessage("❌ Failed to delete unit");
    }
  };

  /** 🔹 Assign Lecturer */
  const handleAssignLecturer = async (unitId: string, lecturerId: string) => {
    if (!lecturerId) return;
    try {
      const updated = await assignLecturerToUnit(unitId, lecturerId);
      setUnits((prev) => prev.map((u) => (u._id === unitId ? updated : u)));
      setMessage("✅ Lecturer assigned");
    } catch (err) {
      console.error("Failed to assign lecturer", err);
      setMessage("❌ Failed to assign lecturer");
    }
  };

  /** 🔹 Unassign Lecturer */
  const handleUnassignLecturer = async (unitId: string) => {
    try {
      const updated = await unassignLecturerFromUnit(unitId);
      setUnits((prev) => prev.map((u) => (u._id === unitId ? updated : u)));
      setMessage("✅ Lecturer unassigned");
    } catch (err) {
      console.error("Failed to unassign", err);
      setMessage("❌ Failed to unassign lecturer");
    }
  };

  const handleSort = (field: "name" | "code" | "program") => {
    const idx = sortField.indexOf(field);
    if (idx === -1) {
      // add new field at the end
      setSortField([...sortField, field]);
      setSortOrder([...sortOrder, "asc"]);
    } else {
      // toggle existing order
      const newOrder = [...sortOrder];
      newOrder[idx] = newOrder[idx] === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
    }
  };

  // 🔹 Apply search + sorting + pagination
  const filteredUnits = units.filter((u) => {
    const searchLower = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(searchLower) ||
      u.code.toLowerCase().includes(searchLower) ||
      (typeof u.program !== "string" &&
        (u.program?.name.toLowerCase().includes(searchLower) ||
          u.program?.code.toLowerCase().includes(searchLower)))
    );
  });

  // Multi-column sort function
  const sortedUnits = [...filteredUnits].sort((a, b) => {
    for (let i = 0; i < sortField.length; i++) {
      const field = sortField[i];
      const order = sortOrder[i];

      let aVal = "";
      let bVal = "";

      if (field === "name") {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else if (field === "code") {
        aVal = a.code.toLowerCase();
        bVal = b.code.toLowerCase();
      } else if (field === "program") {
        const aProgram =
          typeof a.program === "string"
            ? programs.find((c) => c._id === a.program)?.name || ""
            : a.program?.name || "";
        const bProgram =
          typeof b.program === "string"
            ? programs.find((c) => c._id === b.program)?.name || ""
            : b.program?.name || "";
        aVal = aProgram.toLowerCase();
        bVal = bProgram.toLowerCase();
      }

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      // else continue to next field
    }
    return 0;
  });

  //   Pagination
  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUnits = sortedUnits.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedUnits.length / itemsPerPage);

  return {
    // state
    programs,
    units,
    lecturers,
    program,
    programIdFilter,
    unitName,
    unitCode,
    programId,
    editingUnit,
    search,
    loading,
    message,
    isModalOpen,
    isEditMode,

    sortField,
    sortOrder,
    handleSort,

    currentUnits,
    totalPages,
    currentPage,

    // setters
    setUnitName,
    setUnitCode,
    setProgramId,
    setSearch,
    setIsModalOpen,
    setCurrentPage,

    // actions
    handleDeleteUnit,
    handleAssignLecturer,
    handleUnassignLecturer,
    openAddModal,
    openEditModal,
    handleSaveUnit,
  };
}
