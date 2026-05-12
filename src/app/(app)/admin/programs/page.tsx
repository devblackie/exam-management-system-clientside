// clientside/src/app/admin/programs/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getPrograms } from "@/api/programsApi";
import type { Program, AxiosExpectedError } from "@/api/types";
import ProgramTable from "@/components/admin/Programs/ProgramTable";
import ProgramForm from "@/components/admin/Programs/ProgramForm";
import PageHeader from "@/components/ui/PageHeader";
import { LayoutGrid, Plus, Search, X, Filter, ChevronDown } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";

type SortField = "name" | "code" | "durationYears" | "degreeType";
type SortOrder = "asc" | "desc";

export default function ProgramsPage() {
  const { addToast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filterDegree, setFilterDegree] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDuration, setFilterDuration] = useState<string>("all");
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get unique degree types for filter
  const degreeOptions = useMemo(() => {
    const degrees = new Set(programs.map(p => p.degreeType));
    return ["all", ...Array.from(degrees).sort()];
  }, [programs]);

  // Filter and sort programs
  const applyFilters = useCallback(() => {
    let result = [...programs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          (p.schoolCode && p.schoolCode.toLowerCase().includes(query)) ||
          (p.departmentCode && p.departmentCode.toLowerCase().includes(query))
      );
    }

    // Degree filter
    if (filterDegree !== "all") {
      result = result.filter((p) => p.degreeType === filterDegree);
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((p) =>
        filterStatus === "active" ? p.isActive : !p.isActive
      );
    }

    // Duration filter
    if (filterDuration !== "all") {
      const duration = parseInt(filterDuration);
      result = result.filter((p) => p.durationYears === duration);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === "durationYears") {
        aVal = a.durationYears;
        bVal = b.durationYears;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredPrograms(result);
  }, [programs, searchQuery, sortField, sortOrder, filterDegree, filterStatus, filterDuration]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);


  const loadPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch (err) {
      const axiosErr = err as AxiosExpectedError;
      addToast(getErrorMessage(axiosErr), "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]); // addToast is stable from useToast


  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilterDegree("all");
    setFilterStatus("all");
    setFilterDuration("all");
    setSortField("name");
    setSortOrder("asc");
  };

  const hasActiveFilters = searchQuery || filterDegree !== "all" || filterStatus !== "all" || filterDuration !== "all";

  return (
    <div className="max-w-8xl lg:ml-48 my-10">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[calc(100vh)]">
        <PageHeader
          title="Academic Programs"
          highlightedTitle="Management"
          actions={
            !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
              >
                <Plus size={14} />
                Add Program
              </button>
            )
          }
        />

        {showForm && (
          <div className="mb-8">
            <ProgramForm
              onClose={() => setShowForm(false)}
              onSuccess={loadPrograms}
            />
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="mt-6 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, code, school, department..."
                className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter size={14} />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {filterDegree !== "all" ? 1 : 0 + (filterStatus !== "all" ? 1 : 0) + (filterDuration !== "all" ? 1 : 0) + (searchQuery ? 1 : 0)}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50/80 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Degree Type Filter */}
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    Degree Type
                  </label>
                  <select
                    value={filterDegree}
                    onChange={(e) => setFilterDegree(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  >
                    <option value="all">All Degrees</option>
                    {degreeOptions.filter(d => d !== "all").map((degree) => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    Duration (Years)
                  </label>
                  <select
                    value={filterDuration}
                    onChange={(e) => setFilterDuration(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  >
                    <option value="all">All Durations</option>
                    <option value="3">3 Years</option>
                    <option value="4">4 Years</option>
                    <option value="5">5 Years</option>
                    <option value="6">6 Years</option>
                    <option value="7">7 Years</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                    >
                      <option value="name">Name</option>
                      <option value="code">Code</option>
                      <option value="durationYears">Duration</option>
                      <option value="degreeType">Degree</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Search Results Summary */}
          {!loading && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <LayoutGrid size={12} className="text-slate-400" />
                <span>
                  {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""}
                  {filteredPrograms.length !== programs.length && searchQuery && (
                    <span> found for &quot;{searchQuery}&quot;</span>
                  )}
                  {filteredPrograms.length !== programs.length && !searchQuery && hasActiveFilters && (
                    <span> after filtering</span>
                  )}
                </span>
              </div>
              {hasActiveFilters && filteredPrograms.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <span>No results match your criteria</span>
                  <button
                    onClick={resetFilters}
                    className="text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <ProgramTable programs={filteredPrograms} onRefresh={loadPrograms} />
        )}
      </div>
    </div>
  );
}