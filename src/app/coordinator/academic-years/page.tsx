// clientside/src/app/coordinator/academic-years/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createAcademicYear, getAcademicYears } from "@/api/academicYearsApi";
import { useToast } from "@/context/ToastContext";
import { AcademicYear } from "@/api/types";
import { YearFormModal } from "@/components/coordinator/AcademicYears/YearFormModal";
import { YearTable } from "@/components/coordinator/AcademicYears/YearTable";
import { LoadingState } from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
import { History } from "lucide-react";

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

  if (loading) return <LoadingState message="Fetching academic years..." />;

  return (
    <div className="max-w-8xl  ml-48  my-10 ">
      <div className="bg-[#F8F9FA] max-w-full min-h-screen rounded-3xl shadow-2xl p-10">
       
                {/* Header */}
                 <PageHeader 
          title="Academic Years" 
          highlightedTitle="Management"
          actions={
            <>            
              {!showForm && (
              <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                + Open New Session
              </button>
              )}
            </>
          }
        />

        {/* Table */}
       <div className="mt-12">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3 text-green-darkest/40">
              <History size={18} />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">
                Session History & Active Calendars
              </h2>
            </div>
          </div>

          <YearTable years={years} />
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <YearFormModal 
            formData={{ year, startDate, endDate }}
            setFormData={(data) => {
               setYear(data.year);
               setStartDate(data.startDate);
               setEndDate(data.endDate);
            }}
            onClose={() => setShowForm(false)}
            onSubmit={handleSubmit}
            autoFill={autoFill}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
