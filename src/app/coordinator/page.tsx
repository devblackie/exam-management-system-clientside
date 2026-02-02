// src/app/coordinator/page.tsx
"use client";

import { Upload, FileText, User, UserCheck, Users, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getStudentStats } from "@/api/studentsApi";
import { StudentStats } from "@/api/types";
import { bulkPromoteClass, previewPromotion, PromotionParams, PromotionPreviewResponse } from "@/api/promoteApi";
import PromotionControlCard from "@/components/coordinator/PromotionControlCard";
import PromotionPreviewModal from "@/components/coordinator/PromotionPreviewModal";
import Image from "next/image";
import { branding } from "@/config/branding";
import { useServerHealth } from "@/hooks/useServerHealth";
import PageHeader from "@/components/ui/PageHeader";

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const isOnline = useServerHealth();

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const dashboardStats = [
    { title: "Active Students", value: loadingStats ? "..." : stats.active.toLocaleString(), icon: <UserCheck className="w-6 h-6 " /> },
    { title: "Inactive/Other", value: loadingStats ? "..." : stats.inactive.toLocaleString(), icon: <UserX className="w-6 h-6 " /> },
    { title: "Total Students", value: loadingStats ? "..." : stats.total.toLocaleString(), icon: <Users className="w-6 h-6 " /> },
    { title: "Units Offered", value: "184", icon: <FileText className="w-6 h-6 " /> },
    { title: "Marks Uploaded", value: "98.2%", icon: <Upload className="w-6 h-6 " /> },
    { title: "Reports Generated", value: "47", icon: <FileText className="w-6 h-6 " /> },
  ];

  const handleRunPreview = async (params: PromotionParams) => {
    setIsPreviewLoading(true);
    setCurrentParams(params);
    try {
      const data = await previewPromotion(params);
      setPreviewData(data);
      setShowPreview(true);
    } catch {
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
    } catch {
      alert("Promotion failed.");
    }
  };

  return (
    <ProtectedRoute allowed={["coordinator"]}>
      <div className="max-w-8xl ml-48 my-10 ">
        <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-10">
        
         {/* 1. PAGE HEADER */}
          <PageHeader
            title="Coordinator"
            highlightedTitle="Overview"
            systemLabel=" "
          />

          {/* EXECUTIVE DATA RIBBON */}
          <div className="mb-16">
            {/* Section Label */}
            <div className="flex items-center gap-4 mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                Academic Intelligence Summary
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>

            <div className="bg-white border-y border-green-darkest/5 py-10 relative overflow-hidden">
              {/* Subtle Background Watermark */}
              <div className="absolute right-0 top-0 h-full flex items-center pr-10 opacity-[0.03] pointer-events-none select-none">
                <Image src={branding.institutionLogo} alt="" width={200} height={200} />
              </div>

              <div className="max-w-[1600px] mx-auto flex flex-wrap lg:flex-nowrap items-center">
                {dashboardStats.map((stat, index) => (
                  <div key={stat.title} className="flex-1 px-10 relative group border-r border-green-darkest/[0.06] last:border-r-0">
                    <div className="relative ">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-green-darkest/20 group-hover:text-yellow-gold transition-all duration-500 transform group-hover:-translate-y-1">
                          {stat.icon}
                        </div>

                        <span className="text-[9px] font-mono text-slate-300 group-hover:text-green-darkest transition-colors">
                          0{index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {stat.title}
                        </span>
                      </div>


                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-light text-green-darkest tracking-tighter group-hover:tracking-normal transition-all duration-500">
                          {stat.value.split('.')[0]}
                        </span>
                        {stat.value.includes('.') && (
                          <span className="text-xl font-black text-yellow-gold">
                            .{stat.value.split('.')[1]}
                          </span>
                        )}
                      </div>

                      <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. PRIMARY ACTION ZONE: "Floating Console" */}
          <div className="grid grid-cols-12 gap-10">

            {/* Left Side: Promotion Console (The Core Task) */}
            <div className="col-span-12 lg:col-span-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-gold/20 to-green-darkest/5 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative bg-white border border-green-darkest/5 rounded-lg p-10 shadow-sm">

                  <PromotionControlCard
                    onRunPreview={handleRunPreview}
                    isLoading={isPreviewLoading}
                  />
                </div>
              </div>
            </div>

            {/* Right Side: High-End Quick Access */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
              <div className="flex items-center gap-1 mb-1 px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 px-2">
                  System Utilities
                </h3>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-green-darkest/20 to-transparent" />
              </div>
              {[
                { label: "Grade Ledger", icon: <Upload size={18} />, href: "/marks", desc: "Sync academic scores" },
                { label: "Transcript Gen", icon: <FileText size={18} />, href: "/reports", desc: "Batch export PDFs" },
                { label: "Student Registry", icon: <User size={18} />, href: "/coordinator/students", desc: "Manual & Bulk entry" }
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="group flex items-center gap-5 p-3 bg-white border border-green-darkest/5 rounded-lg hover:bg-green-darkest transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-green-darkest/20"
                >
                  <div className="h-8 w-8 rounded-xl bg-slate-50 group-hover:bg-white/10 flex items-center justify-center text-green-darkest group-hover:text-yellow-gold transition-colors">
                    {action.icon}
                  </div>
                  <div>
                    <p className="font-black text-green-darkest group-hover:text-white text-xs uppercase tracking-tight">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-slate-400 group-hover:text-white/50 font-medium">
                      {action.desc}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {showPreview && previewData && currentParams && (
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