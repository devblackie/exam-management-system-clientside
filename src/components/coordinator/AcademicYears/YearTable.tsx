"use client";

import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { AcademicYear } from "@/api/types";

interface YearTableProps {
  years: AcademicYear[];
}

export const YearTable = ({ years }: YearTableProps) => {
  if (years.length === 0) {
    return (
      <div className="text-center py-24">
        <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <p className="text-xl text-gray-500">No academic years configured yet</p>
        <p className="text-gray-500 mt-2">Click &quot;Add New Academic Year&quot; to get started</p>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => 
    dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "N/A";

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-sm text-lime-bright">
          <tr>
            <th className="text-left px-4 py-5 font-bold">Academic Year</th>
            <th className="text-left px-4 py-5 font-bold">Duration</th>
            <th className="text-left px-4 py-5 font-bold">Start Date</th>
            <th className="text-left px-4 py-5 font-bold">End Date</th>
            <th className="text-center px-4 py-5 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {years.map((y) => (
            <tr key={y._id} className="border-b hover:bg-gray-50 transition text-xs">
              <td className="px-4 py-2 font-mono font-semibold text-green-dark">{y.year}</td>
              <td className="px-4 py-2 text-green-darkest">
                {formatDate(y.startDate)} → {formatDate(y.endDate)}
              </td>
              <td className="px-4 py-2 text-green-darkest">{formatDate(y.startDate)}</td>
              <td className="px-4 py-2 text-green-darkest">{formatDate(y.endDate)}</td>
              <td className="px-4 py-2 text-center">
                {y.isCurrent ? (
                  <span className="inline-flex items-center gap-2 px-5 py-1 bg-green-100 text-green-800 rounded-full font-bold text-lg">
                    <CheckCircle2 className="w-6 h-6" /> CURRENT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                    <AlertCircle className="w-5 h-5" /> Inactive
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};