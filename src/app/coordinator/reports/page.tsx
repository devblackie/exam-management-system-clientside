// // clientside/src/app/coordinator/reports/page.tsx
// "use client";

// import { useState } from "react";
// import { format } from "date-fns";

// export default function ReportsPage() {
//   // Replace with real data from API later
//   const [selectedYear, setSelectedYear] = useState("2024/2025");
//   const academicYears = ["2024/2025", "2023/2024", "2022/2023", "2021/2022"];

//   const openReport = (type: "pass-list" | "consolidated") => {
//     const yearId = "671f9a1b2c8d3e9f4a8b4567"; // Map selectedYear → ID in real app
//     window.open(`/api/reports/${type}/${yearId}`, "_blank", "noopener,noreferrer");
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Top Bar */}
//       <div className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-semibold text-gray-900">Examination Reports Portal</h1>
//           <div className="text-sm text-gray-600">
//             {format(new Date(), "EEEE, MMMM d, yyyy")}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-10">

//         {/* Header */}
//         <div className="mb-10">
//           <h2 className="text-3xl font-bold text-gray-900">Senate & Official Reports</h2>
//           <p className="mt-2 text-gray-600">
//             Generate official examination reports for senate approval and academic records
//           </p>
//         </div>

//         {/* Academic Year Selector */}
//         <div className="mb-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <label className="block text-sm font-medium text-gray-700 mb-3">
//             Select Academic Year
//           </label>
//           <select
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(e.target.value)}
//             className="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
//           >
//             {academicYears.map((year) => (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Report Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

//           {/* Pass List */}
//           <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
//             <div className="bg-blue-700 text-white p-6">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-xl font-bold">Pass List</h3>
//                 <svg className="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <p className="mt-2 text-blue-100">Official list of passed units</p>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-600 mb-6">
//                 Approved list of students who have passed all registered units for senate presentation.
//               </p>
//               <button
//                 onClick={() => openReport("pass-list")}
//                 className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-md transition"
//               >
//                 Generate Pass List (PDF)
//               </button>
//             </div>
//           </div>

//           {/* Consolidated Marksheet */}
//           <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
//             <div className="bg-green-700 text-white p-6">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-xl font-bold">Consolidated Marksheet</h3>
//                 <svg className="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 012-2h8a2 2 0 012 2v6m-6-8V9a2 2 0 012-2h2a2 2 0 012 2v4" />
//                 </svg>
//               </div>
//               <p className="mt-2 text-green-100">Complete examination results</p>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-600 mb-6">
//                 Full marksheet showing all students, all units, grades and remarks (PASS/SUPP/RETAKE).
//               </p>
//               <button
//                 onClick={() => openReport("consolidated")}
//                 className="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-md transition"
//               >
//                 Generate Consolidated Marksheet
//               </button>
//             </div>
//           </div>

//           {/* Supplementary List */}
//           <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
//             <div className Fre="bg-amber-600 text-white p-6">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-xl font-bold">Supplementary List</h3>
//                 <svg className="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <p className="mt-2 text-amber-100">Students requiring supplementary exams</p>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-600 mb-6">
//                 List of students with supplementary examinations for the selected academic year.
//               </p>
//               <button
//                 disabled
//                 className="w-full py-3 bg-gray-400 text-white font-medium rounded-md cursor-not-allowed"
//               >
//                 Coming Soon
//               </button>
//             </div>
//           </div>

//         </div>

//         {/* Footer Note */}
//         <div className="mt-16 text-center text-sm text-gray-500">
//           <p>
//             All generated reports are official documents bearing the university seal and signature. 
//             For queries, contact the Office of the Registrar (Academics).
//           </p>
//           <p className="mt-2 font-medium text-gray-700">
//             System Version 2.0 • © 2025 Your University
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }