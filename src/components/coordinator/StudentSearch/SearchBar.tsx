
// src/components/coordinator/StudentSearch/SearchBar.tsx
"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Cpu, Search, UserCheck } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  onSearch: () => void;
  searching: boolean;
  selectedYearOfStudy: number;
  setSelectedYearOfStudy: (value: number) => void;
}

export default function SearchBar({ 
  query, 
  setQuery, 
  onSearch, 
  searching, 
  selectedYearOfStudy, 
  setSelectedYearOfStudy 
}: SearchBarProps) {
  
  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
      {/* Labeling for the "Executive Console" look */}
      <div className="flex items-center gap-3 mb-1 px-2">
        <UserCheck size={14} className="text-yellow-gold" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
          Registry Identity Lookup
        </span>
      </div>

      <div className="rounded-lg shadow-md bg-white mb-4">
       <div className="flex">
         <input
           type="text"
           placeholder="e.g. SC/ICT/001/2023"
           value={query}
           onChange={(e) => setQuery(e.target.value.toUpperCase())}
           onKeyDown={(e) => e.key === "Enter" && onSearch()}
          
           className="flex-1 px-4 py-2 text-sm text-green-darkest/50 border-0 border-r-transparent border-green-transparent rounded-br-none rounded-tr-none rounded-lg placeholder-green-dark/50 outline-0 focus:outline-0 "
         />

         <select
           value={selectedYearOfStudy}
           onChange={(e) => setSelectedYearOfStudy(Number(e.target.value))}
           className="px-4 py-2 bg-white text-sm border-0 border-l-transparent border-green-dark/20 text-green-darkest font-bold outline-none cursor-pointer"
         >
          {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
         </select>

         <button
           onClick={onSearch}
           disabled={searching}
           className="flex text-sm items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg rounded-bl-none rounded-tl-none hover:from-green-700 hover:to-emerald-800 font-bold disabled:opacity-50 transition shadow-2xl"
         >
           <MagnifyingGlassIcon className="h-5 w-5" />           {searching ? "Searching..." : "Search Student"}
         </button>
       </div>
     </div>

      

     
    </div>
  );
}