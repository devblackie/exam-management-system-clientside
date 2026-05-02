// src/app/lecturer/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function LecturerDashboardPage() {
  return (
    <ProtectedRoute allowed={["lecturer"]}>
      <div className="max-w-9xl ml-40 my-10 px-2 animate-in fade-in duration-700">
        <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-10">
          <h1 className="text-2xl font-bold text-green-darkest">
            Lecturer Dashboard
          </h1>
          <p className="text-slate-500 mt-2">Welcome to your lecturer portal</p>

          {/* Add your lecturer dashboard content here */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-darkest/5">
              <h3 className="font-bold text-green-darkest">My Units</h3>
              <p className="text-sm text-slate-500 mt-2">
                View and manage your assigned units
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-darkest/5">
              <h3 className="font-bold text-green-darkest">Mark Entry</h3>
              <p className="text-sm text-slate-500 mt-2">
                Record and update student marks
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-darkest/5">
              <h3 className="font-bold text-green-darkest">Attendance</h3>
              <p className="text-sm text-slate-500 mt-2">
                Track student attendance
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
