"use client";

import { useEffect, useState } from "react";
import { getLecturers, getUnits, assignLecturerToUnits } from "@/api/lecturersApi";
import { Lecturer, Unit } from "@/api/types";

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState<string>("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const [lecRes, unitRes] = await Promise.all([getLecturers(), getUnits()]);
        setLecturers(lecRes);
        setUnits(unitRes);
      } catch (err) {
        console.error("Failed to fetch lecturers/units", err);
      }
    })();
  }, []);

  const handleAssign = async () => {
    if (!selectedLecturer || selectedUnits.length === 0) {
      setMessage("Please select a lecturer and at least one unit.");
      return;
    }

    try {
      const res = await assignLecturerToUnits(selectedLecturer, selectedUnits);
      setMessage(`✅ ${res.assigned} units assigned, ${res.skipped} skipped.`);
      setSelectedUnits([]);
    } catch (err) {
      console.error("Assignment failed", err);
      setMessage("❌ Failed to assign units.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Assign Lecturers to Units</h1>

      <div className="mb-4">
        <label className="block font-medium">Select Lecturer</label>
        <select
          value={selectedLecturer}
          onChange={(e) => setSelectedLecturer(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">-- Choose Lecturer --</option>
          {lecturers.map((lec) => (
            <option key={lec._id} value={lec._id}>
              {lec.name} ({lec.email})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium">Select Units</label>
        <div className="flex flex-col border rounded p-2 max-h-64 overflow-y-auto">
          {units.map((unit) => (
            <label key={unit._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={unit._id}
                checked={selectedUnits.includes(unit._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedUnits([...selectedUnits, unit._id]);
                  } else {
                    setSelectedUnits(selectedUnits.filter((id) => id !== unit._id));
                  }
                }}
              />
              <span>
                {unit.code} - {unit.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleAssign}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Assign
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
