// clientside/src/app/admin/programs/page.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { usePrograms } from "@/hooks/queries/usePrograms";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import {
  X,
  Filter,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Plus,
  AlertTriangle,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import ProgramForm from "@/components/admin/Programs/ProgramForm";
import ProgramTable from "@/components/admin/Programs/ProgramTable";

type SortField = "name" | "code" | "durationYears" | "degreeType";
type SortOrder = "asc" | "desc";

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] as const },
  },
};

export default function ProgramsPage() {
  const { data: programs = [], isLoading, isError, refetch } = usePrograms();
  const { data: settings } = useInstitutionSettings();

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filterDegree, setFilterDegree] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDuration, setFilterDuration] = useState<string>("all");
  const [filterSchool, setFilterSchool] = useState<string>("all");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const degreeOptions = useMemo(() => {
    const degrees = new Set(programs.map((p) => p.degreeType));
    return ["all", ...Array.from(degrees).sort()];
  }, [programs]);

  const schoolOptions = useMemo(() => {
    const schoolsList = settings?.schools ?? [];
    if (schoolsList.length > 0) return ["all", ...schoolsList.map((s) => s.code)];
    const codes = new Set(programs.map((p) => p.schoolCode).filter(Boolean));
    return ["all", ...Array.from(codes).sort()];
  }, [settings, programs]);

  const filteredPrograms = useMemo(() => {
    let result = [...programs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.schoolCode && p.schoolCode.toLowerCase().includes(query)) ||
          (p.departmentCode && p.departmentCode.toLowerCase().includes(query)),
      );
    }

    if (filterDegree !== "all") {
      result = result.filter((p) => p.degreeType === filterDegree);
    }
    if (filterStatus !== "all") {
      result = result.filter((p) =>
        filterStatus === "active" ? p.isActive : !p.isActive,
      );
    }
    if (filterDuration !== "all") {
      result = result.filter((p) => p.durationYears === parseInt(filterDuration, 10));
    }
    if (filterSchool !== "all") {
      result = result.filter((p) => p.schoolCode === filterSchool);
    }

    result.sort((a, b) => {
      const aVal = sortField === "durationYears" ? a.durationYears : String(a[sortField] ?? "").toLowerCase();
      const bVal = sortField === "durationYears" ? b.durationYears : String(b[sortField] ?? "").toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [programs, searchQuery, filterDegree, filterStatus, filterDuration, filterSchool, sortField, sortOrder]);

  const hasActiveFilters =
    searchQuery !== "" ||
    filterDegree !== "all" ||
    filterStatus !== "all" ||
    filterDuration !== "all" ||
    filterSchool !== "all";

  const activeFilterCount = [
    filterDegree !== "all",
    filterStatus !== "all",
    filterDuration !== "all",
    filterSchool !== "all",
    searchQuery !== "",
  ].filter(Boolean).length;

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterDegree("all");
    setFilterStatus("all");
    setFilterDuration("all");
    setFilterSchool("all");
    setSortField("name");
    setSortOrder("asc");
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    void refetch();
  };

  if (isLoading) return <LoadingState message="Loading academic programs..." />;

  if (isError) {
    return (
      <div className="max-w-8xl lg:ml-48 my-14 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
          <p className="text-slate-500 font-medium">Failed to load programs.</p>
          <button onClick={() => refetch()} className="mt-4 text-emerald-600 text-sm font-medium hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl lg:ml-48 my-10">
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#F8F9FA] min-h-screen rounded-2xl shadow-2xl p-10 border border-white/60"
      >
        <PageHeader
          title="Academic Programs"
          highlightedTitle="Management"
          actions={
            !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-darkest text-yellow-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                <Plus size={14} />
                Add Program
              </button>
            )
          }
        />

        <AnimatePresence>
          {showForm && (
            <ProgramForm
              onClose={() => setShowForm(false)}
              onSuccess={handleFormSuccess}
            />
          )}
        </AnimatePresence>

        {/* Executive Console Search Bar */}
        <div className="flex items-center gap-3 mb-1 px-2">
          <GraduationCap size={14} className="text-yellow-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
            Program Registry Lookup
          </span>
        </div>

        <div className="rounded-lg shadow-md bg-white mb-3">
          <div className="flex">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, code, school, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 text-xs font-medium text-green-darkest border-0 rounded-lg rounded-br-none rounded-tr-none placeholder-slate-300/50 outline-none"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="px-3 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={14} />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-0 transition-all ${
                showFilters || hasActiveFilters ? "bg-yellow-gold/10 text-green-darkest" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Filter size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 bg-yellow-gold text-green-darkest text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100 mb-4">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Degree</label>
                    <select value={filterDegree} onChange={(e) => setFilterDegree(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm cursor-pointer outline-none focus:ring-2 focus:ring-yellow-gold/30">
                      {degreeOptions.map((d) => (
                        <option key={d} value={d}>{d === "all" ? "All Degrees" : d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Status</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm cursor-pointer outline-none focus:ring-2 focus:ring-yellow-gold/30">
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Duration</label>
                    <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm cursor-pointer outline-none focus:ring-2 focus:ring-yellow-gold/30">
                      <option value="all">All Durations</option>
                      {[3, 4, 5, 6, 7].map((y) => (
                        <option key={y} value={y}>{y} Years</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">School</label>
                    <select value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm cursor-pointer outline-none focus:ring-2 focus:ring-yellow-gold/30">
                      {schoolOptions.map((code) => {
                        const school = settings?.schools?.find((s) => s.code === code);
                        return (
                          <option key={code} value={code}>
                            {code === "all" ? "All Schools" : school?.name ?? code}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Sort</label>
                    <div className="flex gap-2">
                      <select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm cursor-pointer outline-none focus:ring-2 focus:ring-yellow-gold/30">
                        <option value="name">Name</option>
                        <option value="code">Code</option>
                        <option value="durationYears">Duration</option>
                        <option value="degreeType">Degree</option>
                      </select>
                      <button
                        onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  </div>
                </div>
                {hasActiveFilters && (
                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                    <button onClick={resetFilters} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                      Reset all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mb-6 px-2">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-yellow-gold" />
            <span className="text-[10px] font-black text-green-darkest uppercase tracking-widest">
              {filteredPrograms.length} Program{filteredPrograms.length !== 1 ? "s" : ""}
            </span>
          </div>
          {filteredPrograms.length !== programs.length && (
            <span className="text-[10px] text-slate-400 font-medium">
              (filtered from {programs.length})
            </span>
          )}
          {hasActiveFilters && filteredPrograms.length === 0 && (
            <button onClick={resetFilters} className="ml-auto text-[10px] text-emerald-600 font-bold hover:underline">
              Clear filters
            </button>
          )}
        </div>

        <ProgramTable programs={filteredPrograms} onRefresh={() => refetch()} />
      </motion.div>
    </div>
  );
}