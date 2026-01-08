// src/app/coordinator/page.tsx

"use client";

import { Upload, FileText,User, UserCheck, Users, UserX } from "lucide-react"; // Import new icons
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getStudentStats } from "@/api/studentsApi"; // Import the new function and type
import { StudentStats } from "@/api/types";

export default function CoordinatorPage() {
  const [stats, setStats] = useState<StudentStats>({
    active: 0,
    inactive: 0,
    total: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getStudentStats();
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch student stats:", e);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  // Define the dynamic dashboard cards using the fetched state
  const dashboardStats = [
    {
      title: "Active Students",
      value: loadingStats ? "..." : stats.active.toLocaleString(),
      color: "bg-green-600",
      icon: <UserCheck className="w-6 h-6 text-white" />,
    },
    {
      title: "Inactive/Other",
      value: loadingStats ? "..." : stats.inactive.toLocaleString(),
      color: "bg-red-500",
      icon: <UserX className="w-6 h-6 text-white" />,
    },
    {
      title: "Total Students",
      value: loadingStats ? "..." : stats.total.toLocaleString(),
      color: "bg-blue-600",
      icon: <Users className="w-6 h-6 text-white" />,
    },
    // The original hardcoded stats are kept here, but should eventually use dynamic data
    { title: "Units Offered", value: "184", color: "bg-indigo-500", icon: <FileText className="w-6 h-6 text-white" /> },
    { title: "Marks Uploaded", value: "98.2%", color: "bg-purple-500", icon: <Upload className="w-6 h-6 text-white" /> },
    { title: "Reports Generated", value: "47", color: "bg-orange-500", icon: <FileText className="w-6 h-6 text-white" /> },
  ];

  return (
    <ProtectedRoute allowed={["coordinator"]}>
      <div className="max-w-8xl ml-48 my-10 ">
      <div className="bg-white min-h-screen rounded-3xl shadow-2xl p-10">

        <h1 className="text-2xl font-bold mb-6 text-green-darkest">Welcome Back! 👋</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-xl p-6 transition-all hover:shadow-2xl"
            >
              <div
                className={`${stat.color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center`}
              >
                {stat.icon} {/* Display the icon */}
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-extrabold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-green-darkest">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/marks"
              className="bg-blue-600 text-white p-6 rounded-lg text-center font-semibold hover:bg-blue-700 transition shadow-md"
            >
              <Upload className="mx-auto mb-2" />
              Upload Marks
            </a>
            <a
              href="/reports"
              className="bg-green-600 text-white p-6 rounded-lg text-center font-semibold hover:bg-green-700 transition shadow-md"
            >
              <FileText className="mx-auto mb-2" />
              Generate Reports
            </a>
            {/* Add Register Students link */}
            <a
              href="/coordinator/students"
              className="bg-yellow-gold text-green-darkest p-6 rounded-lg text-center font-semibold hover:bg-yellow-600 transition shadow-md"
            >
              <User className="mx-auto mb-2" />
              Register Students
            </a>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
