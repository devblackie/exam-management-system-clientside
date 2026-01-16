// src/app/coordinator/page.tsx
"use client";

import { Upload, FileText, User, UserCheck, Users, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getStudentStats } from "@/api/studentsApi";
import { StudentStats } from "@/api/types";
import { bulkPromoteClass, previewPromotion, PromotionPreviewResponse } from "@/api/promoteApi";
import PromotionControlCard from "@/components/coordinator/PromotionControlCard";
import PromotionPreviewModal from "@/components/coordinator/PromotionPreviewModal";

interface PromotionParams {
  programId: string;
  yearToPromote: number;
  academicYearName: string;
}

export default function CoordinatorPage() {
  const [stats, setStats] = useState<StudentStats>({
    active: 0,
    inactive: 0,
    total: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PromotionPreviewResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentParams, setCurrentParams] = useState<PromotionParams | null>(null);

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

  const dashboardStats = [
    { title: "Active Students", value: loadingStats ? "..." : stats.active.toLocaleString(), color: "bg-green-600", icon: <UserCheck className="w-6 h-6 text-white" /> },
    { title: "Inactive/Other", value: loadingStats ? "..." : stats.inactive.toLocaleString(), color: "bg-red-500", icon: <UserX className="w-6 h-6 text-white" /> },
    { title: "Total Students", value: loadingStats ? "..." : stats.total.toLocaleString(), color: "bg-blue-600", icon: <Users className="w-6 h-6 text-white" /> },
    { title: "Units Offered", value: "184", color: "bg-indigo-500", icon: <FileText className="w-6 h-6 text-white" /> },
    { title: "Marks Uploaded", value: "98.2%", color: "bg-purple-500", icon: <Upload className="w-6 h-6 text-white" /> },
    { title: "Reports Generated", value: "47", color: "bg-orange-500", icon: <FileText className="w-6 h-6 text-white" /> },
  ];

  const handleRunPreview = async (params: PromotionParams) => {
    setIsPreviewLoading(true);
    setCurrentParams(params);
    try {
      const data = await previewPromotion(params);
      setPreviewData(data);
      setShowPreview(true);
    } catch  {
      alert("Error fetching promotion data. Check if units are set for this year.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleFinalPromote = async () => {
    // FIX: Check if data exists before accessing eligibleCount
    if (!previewData || !currentParams) {
        alert("No data to process.");
        return;
    }

    if (!confirm(`Are you sure you want to promote ${previewData.eligibleCount} students?`)) return;

    try {
      const res = await bulkPromoteClass(currentParams);
      alert(res.message);
      setShowPreview(false);
    } catch  {
      alert("Promotion failed.");
    }
  };

  return (
    <ProtectedRoute allowed={["coordinator"]}>
      <div className="max-w-8xl ml-48 my-10 ">
        <div className="bg-white min-h-screen rounded-3xl shadow-2xl p-10">
          <h1 className="text-2xl font-bold mb-6 text-green-darkest">Welcome Back! 👋</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardStats.map((stat) => (
              <div key={stat.title} className="bg-white rounded-xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <div className={`${stat.color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
                <p className="text-3xl font-extrabold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <PromotionControlCard 
              onRunPreview={handleRunPreview} 
              isLoading={isPreviewLoading} 
            />
          </div>

          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-green-darkest">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/marks" className="bg-blue-600 text-white p-6 rounded-lg text-center font-semibold hover:bg-blue-700 transition shadow-md">
                <Upload className="mx-auto mb-2" />
                Upload Marks
              </a>
              <a href="/reports" className="bg-green-600 text-white p-6 rounded-lg text-center font-semibold hover:bg-green-700 transition shadow-md">
                <FileText className="mx-auto mb-2" />
                Generate Reports
              </a>
              <a href="/coordinator/students" className="bg-yellow-gold text-green-darkest p-6 rounded-lg text-center font-semibold hover:bg-yellow-600 transition shadow-md">
                <User className="mx-auto mb-2" />
                Register Students
              </a>
            </div>
          </div>
        </div>
      </div>

      {showPreview && previewData && (
        <PromotionPreviewModal 
          data={previewData} 
          params={currentParams}
          onClose={() => setShowPreview(false)} 
          onConfirm={handleFinalPromote}
        />
      )}
    </ProtectedRoute>
  );
}