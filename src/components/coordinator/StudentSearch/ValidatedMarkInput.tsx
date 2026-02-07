// components/coordinator/StudentSearch/ValidatedMarkInput.tsx
import React, { useState, useEffect } from "react";

interface ValidatedMarkInputProps {
  value: number;
  maxScore: number;
  onChange: (newValue: number) => void;
  label: string;
}

export const ValidatedMarkInput = ({ value, maxScore, onChange, label }: ValidatedMarkInputProps) => {
  const [error, setError] = useState<string | null>(null);

  // Instant validation logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    
    if (val > maxScore) {
      setError(`Max score is ${maxScore}`);
    } else if (val < 0) {
      setError("Cannot be negative");
    } else {
      setError(null);
    }
    
    onChange(val);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
        {label} (Max: {maxScore})
      </label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        className={`border p-2 rounded-md transition-all ${
          error 
            ? "border-red-500 bg-red-50 text-red-700 focus:ring-red-200" 
            : "border-slate-200 focus:border-green-darkest focus:ring-green-100"
        }`}
      />
      {error && (
        <span className="text-[10px] font-bold text-red-500 animate-pulse">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};