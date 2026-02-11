// clientside/src/components/ui/Loader.tsx
"use client";

import React from "react";

const Loader = () => {
  return (
    <div className="relative flex items-center justify-center w-[6em] h-[6em] text-[10px]">
      {/* Outer Face - Gold */}
      <div className="absolute w-full h-full rounded-full border-t-[0.2em] border-r-[0.2em] border-b-0 border-l-0 border-solid border-yellow-gold/80 border-r-transparent border-b-transparent animate-[spin_3s_linear_infinite]">
        <div 
          className="absolute w-1/2 h-[0.1em] top-1/2 left-1/2 origin-left -rotate-45"
        >
          <div className="absolute -top-[0.5em] -right-[0.5em] w-[1em] h-[1em] bg-yellow-gold rounded-full shadow-[0_0_2em_gold,0_0_4em_gold,0_0_0_0.5em_rgba(255,223,0,0.1)]" />
        </div>
      </div>

      {/* Inner Face - Emerald */}
      <div className="absolute w-[70%] h-[70%] rounded-full border-t-[0.2em] border-l-[0.2em] border-b-0 border-r-0 border-solid border-emerald-500 border-t-transparent border-b-transparent animate-[spin_3s_linear_infinite_reverse]">
        <div 
          className="absolute w-1/2 h-[0.1em] top-1/2 left-1/2 origin-left -rotate-[135deg]"
        >
          <div className="absolute -top-[0.5em] -right-[0.5em] w-[1em] h-[1em] bg-emerald-500 rounded-full shadow-[0_0_2em_#10b981,0_0_4em_#10b981,0_0_0_0.5em_rgba(16,185,129,0.1)]" />
        </div>
      </div>
    </div>
  );
};

export default Loader;