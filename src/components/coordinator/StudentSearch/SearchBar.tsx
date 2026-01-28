// src/components/coordinator/StudentSearch/SearchBar.tsx
"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  searching: boolean;
  selectedYearOfStudy: number; // Changed from string to number
  setSelectedYearOfStudy: (value: number) => void; // Changed from string to number
}

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  searching,
  selectedYearOfStudy,
  setSelectedYearOfStudy,
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
          className="flex-1 px-4 py-2 text-sm text-green-darkest/50 border border-r-transparent border-green-dark/20 rounded-br-none rounded-tr-none rounded-lg placeholder-green-dark/50 focus:outline-0 "
        />

        <select
          value={selectedYearOfStudy}
          onChange={(e) => setSelectedYearOfStudy(Number(e.target.value))}
          className="px-4 py-2 bg-white text-sm border border-l-transparent border-green-dark/20 text-green-darkest font-bold outline-none cursor-pointer"
        >
          <option value={1}>Year 1</option>
          <option value={2}>Year 2</option>
          <option value={3}>Year 3</option>
          <option value={4}>Year 4</option>
          <option value={5}>Year 5</option>
          <option value={6}>Year 6</option>
        </select>

        <button
          onClick={onSearch}
          disabled={searching}
          className="flex text-sm items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg rounded-bl-none rounded-tl-none hover:from-green-700 hover:to-emerald-800 font-bold disabled:opacity-50 transition shadow-2xl"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          {searching ? "Searching..." : "Search Student"}
        </button>
      </div>
    </div>
  );
}