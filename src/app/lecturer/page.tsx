"use client";

import { useEffect, useState } from "react";
import { getAssignedUnits } from "@/api/apiLecturer";
import Link from "next/link";
import { IUnit } from "@/types/lecturer";

export default function LecturerDashboard() {
  const [units, setUnits] = useState<IUnit[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAssignedUnits();
        setUnits(res.data as IUnit[]);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lecturer Dashboard</h1>
      <p className="mb-4">Assigned units</p>

      <div className="grid grid-cols-1 gap-3">
        {units.length === 0 && <div>No units assigned</div>}
        {units.map((u) => (
          <div
            key={u._id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">
                {u.code} — {u.title}
              </div>
              <div className="text-sm text-gray-500">
                {u.program?.code} • {u.academicYear || ""}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/lecturer/upload?unit=${u._id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Upload Results
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
