"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AcademicYear } from "@/api/types";

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  searching: boolean;
  academicYears: AcademicYear[];
  selectedYear: string;
  setSelectedYear: (value: string) => void;
}

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  searching,
  academicYears,
  selectedYear,
  setSelectedYear,
}: SearchBarProps) {
  return (
    <div className="rounded-lg shadow-md mb-4">
      <div className="flex">
        <input
          type="text"
          placeholder="e.g. SC/ICT/001/2023"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="flex-1 px-4 py-2 text-sm text-green-darkest/50 border border-r-transparent border-green-dark/20 rounded-br-none rounded-tr-none rounded-lg placeholder-green-dark/50 focus:outline-0 focus:border-green-darkest"
        />

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 bg-white border border-l-transparent border-green-dark/20 text-green-darkest font-bold outline-none cursor-pointer"
        >
          <option value="" disabled>Select Year</option>
          {academicYears.map((y) => (
            <option key={y._id} value={y.year}>
              {y.year}
            </option>
          ))}
        </select>

        <button
          onClick={onSearch}
          disabled={searching}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg rounded-bl-none rounded-tl-none hover:from-green-700 hover:to-emerald-800 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          {searching ? "Searching..." : "Search Student"}
        </button>
      </div>
    </div>
  );
}