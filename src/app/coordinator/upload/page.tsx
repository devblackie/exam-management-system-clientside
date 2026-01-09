// // clientside/src/app/coordinator/upload/page.tsx
// "use client";

// import { useState } from "react";
// import { uploadMarks, downloadTemplate } from "@/api/marksApi";
// import { useToast } from "@/context/ToastContext";

// interface UploadResult {
//   message: string;
//   total: number;
//   success: number;
//   errors: string[];
// }

// export default function UploadMarks() {
//   const [file, setFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [result, setResult] = useState<UploadResult | null>(null);
//   const [dragActive, setDragActive] = useState(false);
//       const { addToast } = useToast();

//       // --- NEW STATE FOR COORDINATOR SELECTIONS ---
//     const [selectedProgramId, setSelectedProgramId] = useState<string>('');
//     const [selectedUnitId, setSelectedUnitId] = useState<string>('');
//     const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
//     const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<number>(0);
//     const [selectedSemester, setSelectedSemester] = useState<number>(0);
//     // ---------------------------------------------

//   // Handle drag events
//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFile(e.dataTransfer.files[0]);
//     }
//   };

//  const handleFile = (selectedFile: File) => {
//     const valid = selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls");

//     if (valid) {
//       setFile(selectedFile);
//       setResult(null);
//       addToast(`${selectedFile.name} ready for upload`, "success");
//     } else {
//       addToast("Invalid file type. Only .csv, .xlsx allowed", "error");
//     }
//   };

//   const handleUpload = async () => {
//     if (!file) return;

//     setUploading(true);
//     setResult(null);
//     try {
//       const data = await uploadMarks(file);
//       setResult(data);
//    if (data.success === data.total) {
//         addToast(`PERFECT! All ${data.success} records uploaded successfully!`, "success");
//       } else if (data.success > 0) {
//         addToast(`${data.success}/${data.total} records uploaded. Check errors below.`, "success");
//       } else {
//         addToast("No records uploaded. See errors.", "error");
//       }
//     } catch (err: unknown) {
//       const errorMessage = err instanceof Error ? err.message : "Upload failed";
//       addToast(`Upload failed: ${errorMessage}`, "error");

//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleDownloadTemplate = async () => {
//         // The defensive check now lives in the API call, so we just call it.
//         try {
//             await downloadTemplate(
//                 selectedProgramId,
//                 selectedUnitId,
//                 selectedAcademicYearId,
//                 selectedYearOfStudy,
//                 selectedSemester
//             );
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during download.";
//             addToast(`Download Error: ${errorMessage}`, "error");
//         }
//     };

//     // Check if the required fields for template download are ready
//     const isReadyForDownload = selectedProgramId && selectedUnitId && selectedAcademicYearId && selectedYearOfStudy > 0 && selectedSemester > 0;

//   return (
//     // <div className="max-w-2xl mx-auto p-8">
//     //   <h1 className="text-3xl font-bold mb-6">Upload Marks</h1>

//     //   <button
//     //     onClick={downloadTemplate}
//     //     className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//     //   >
//     //     Download Template (.csv)
//     //   </button>

//     //   <div className="space-y-6">
//     //     <input
//     //       type="file"
//     //       accept=".csv,.xlsx"
//     //       onChange={(e) => setFile(e.target.files?.[0] || null)}
//     //       className="block w-full text-sm text-green-darkest border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
//     //     />

//     //     <button
//     //       onClick={handleUpload}
//     //       disabled={!file || uploading}
//     //       className="w-full px-8 py-4 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
//     //     >
//     //       {uploading ? "Uploading..." : "Upload Marks"}
//     //     </button>

//     //     {result && (
//     //       <div className="mt-8 p-6 bg-white border border-green-300 rounded-lg shadow-sm">
//     //         <h3 className="text-lg font-semibold text-green-800 mb-2">
//     //           Upload Complete!
//     //         </h3>
//     //         <p className="text-green-darkest">
//     //           <strong>{result.success}</strong> out of{" "}
//     //           <strong>{result.total}</strong> records processed successfully
//     //         </p>

//     //         {result.errors.length > 0 && (
//     //           <details className="mt-4">
//     //             <summary className="cursor-pointer text-red-600 font-medium hover:underline">
//     //               Show {result.errors.length} error(s)
//     //             </summary>
//     //             <ul className="mt-2 text-sm text-red-700 list-disc list-inside bg-red-50 p-3 rounded">
//     //               {result.errors.map((error, index) => (
//     //                 <li key={index}>{error}</li>
//     //               ))}
//     //             </ul>
//     //           </details>
//     //         )}
//     //       </div>
//     //     )}
//     //   </div>
//     // </div>

//     <div className="max-w-6xl ml-48  my-10 ">

//          <div className="bg-white max-w-full min-h-screen rounded-3xl shadow-2xl p-10">
//  <div className=" rounded-lg shadow-md border border-green-dark/20 p-4 ">
//           <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r  from-green-darkest to-green-dark">
//             Upload Student Marks
//           </h1>
// <p className=" text-green-darkest">
//             Drag & drop your Excel/CSV file or click to browse
//           </p>
//          <p className=" text-green-darkest">
//                         1. Select Context 2. Download Template 3. Upload File
//                     </p>
//         </div>

//       {/* --- NEW: CONTEXT SELECTION UI (Illustrative Dropdowns) --- */}
//                 <div className="my-8 p-6 bg-gray-50 rounded-2xl border">
//                     <h2 className="text-xl font-semibold mb-4">Select Scoresheet Context</h2>
//                     <div className="grid grid-cols-3 gap-6">
//                         {/* Program Selection */}
//                         <select
//                             value={selectedProgramId}
//                             onChange={(e) => setSelectedProgramId(e.target.value)}
//                             className="p-3 border rounded-lg"
//                         >
//                             <option value="">-- Select Program --</option>
//                             {/* Fetch and map programs here (e.g., Bachelor of Technology in Building Construction) */}
//                             <option value="someProgramId">B. Tech. in Building Construction</option>
//                         </select>

//                         {/* Unit Selection */}
//                         <select
//                             value={selectedUnitId}
//                             onChange={(e) => setSelectedUnitId(e.target.value)}
//                             className="p-3 border rounded-lg"
//                             disabled={!selectedProgramId}
//                         >
//                             <option value="">-- Select Unit --</option>
//                             {/* Fetch and map units based on selectedProgramId (e.g., ECE 4104) */}
//                             <option value="someUnitId">ECE 4104: Theory of Structures IV</option>
//                         </select>

//                         {/* Academic Year Selection */}
//                         <select
//                             value={selectedAcademicYearId}
//                             onChange={(e) => setSelectedAcademicYearId(e.target.value)}
//                             className="p-3 border rounded-lg"
//                         >
//                             <option value="">-- Select Academic Year --</option>
//                             {/* Fetch and map academic years */}
//                             <option value="someYearId">2022/2023</option>
//                         </select>

//                         {/* Year of Study Selection */}
//                         <select
//                             value={selectedYearOfStudy}
//                             onChange={(e) => setSelectedYearOfStudy(parseInt(e.target.value, 10))}
//                             className="p-3 border rounded-lg"
//                         >
//                             <option value={0}>-- Select Year of Study --</option>
//                             <option value={1}>1</option>
//                             <option value={2}>2</option>
//                             <option value={3}>3</option> {/* The relevant Year */}
//                         </select>

//                         {/* Semester Selection */}
//                         <select
//                             value={selectedSemester}
//                             onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
//                             className="p-3 border rounded-lg"
//                         >
//                             <option value={0}>-- Select Semester --</option>
//                             <option value={1}>1st Semester</option>
//                             <option value={2}>2nd Semester</option> {/* The relevant Semester */}
//                         </select>
//                     </div>
//                 </div>
//                 {/* --- END: CONTEXT SELECTION UI --- */}

//         {/* Template Download */}
//         <div className="text-center my-8">
//           <button
//          onClick={handleDownloadTemplate} // CALL THE WRAPPER FUNCTION
//                         disabled={!isReadyForDownload} // DISABLE IF CONTEXT IS NOT COMPLETE
//                         className="inline-flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-2xl hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
//                     >
//             <svg
//               className="w-8 h-8"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//               />
//             </svg>
//             Download Upload Template (.csv)
//           </button>
//         </div>

//         {/* Drag & Drop Zone */}
//         <div
//           onDragEnter={handleDrag}
//           onDragLeave={handleDrag}
//           onDragOver={handleDrag}
//           onDrop={handleDrop}
//           className={`relative border-2 border-dashed rounded-3xl p-20 text-center transition-all duration-300 ${
//             dragActive
//               ? "border-green-darkest bg-green-dark/20 shadow-2xl scale-105"
//               : "border-gray-400 bg-white shadow-xl"
//           }`}
//         >
//           {dragActive && (
//             <div className="absolute inset-0 bg-green-dark/50 bg-opacity-10 rounded-3xl animate-pul" />
//           )}

//           {!file ? (
//             <>
//               <div className="mb-8">
//                 <svg
//                   className="w-32 h-32 mx-auto text-green-darkest/50"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1.5}
//                     d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                   />
//                 </svg>
//               </div>
//               <p className="text-xl font-bold text-green-darkest mb-6">
//                 Drop your marks file here
//               </p>
//               <p className="text-2xl text-green-darkest mb-10">or</p>
//               <label

//               className="inline-block px-8 py-4 bg-gradient-to-r from-green-darkest to-green-dark text-white text-2xl font-bold rounded-2xl cursor-pointer hover:shadow-2xl transition transform hover:scale-105">
//                 Browse Files
//                 <input
//                   type="file"
//                   accept=".csv,.xlsx"
//                   onChange={(e) =>
//                     e.target.files?.[0] && handleFile(e.target.files[0])
//                   }
//                   className="hidden"
//                 />
//               </label>
//             </>
//           ) : (
//             <div className="text-center">
//               <div className="mb-8">
//                 <svg
//                   className="w-32 h-32 mx-auto text-green-600"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </div>
//               <p className="text-4xl font-bold text-green-700 mb-4">
//                 {file.name}
//               </p>
//               <p className="text-2xl text-gray-600 mb-10">
//                 {(file.size / 1024 / 1024).toFixed(2)} MB
//               </p>
//               <button
//                 onClick={() => setFile(null)}
//                 className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-xl transition"
//               >
//                 Remove File
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Upload Button */}
//         {file && (
//           <div className="text-center mt-12">
//             <button
//               onClick={handleUpload}
//               disabled={uploading}
//               className="px-8 py-4 bg-gradient-to-r from-green-darkest to-green-dark text-white text-xl font-black rounded-3xl shadow-3xl hover:shadow-4xl disabled:opacity-70 disabled:cursor-not-allowed transition transform hover:scale-105 flex items-center gap-6 mx-auto"
//             >
//               {uploading ? (
//                 <>
//                   <span className="inline-block w-12 h-12 border-8 border-white border-t-transparent rounded-full animate-spin"></span>
//                   Uploading & Calculating Grades...
//                 </>
//               ) : (
//                 <>
//                   <svg
//                     className="w-8 h-8"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4"
//                     />
//                   </svg>
//                   Upload & Process Marks
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         {/* Result */}
//         {result && (
//           <div
//             className={`mt-16 p-12 rounded-3xl shadow-2xl text-center ${
//               result.success === result.total
//                 ? "bg-gradient-to-br from-green-100 to-emerald-100 border-8 border-green-500"
//                 : "bg-gradient-to-br from-yellow-100 to-orange-100 border-8 border-yellow-500"
//             }`}
//           >
//             <h3 className="text-5xl font-black mb-6">
//               {result.success === result.total ? "SUCCESS!" : "PARTIAL SUCCESS"}
//             </h3>
//             <p className="text-6xl font-black text-gray-900 mb-8">
//               {result.success} / {result.total}
//             </p>
//             <p className="text-4xl font-bold text-gray-800">
//               records processed successfully
//             </p>

//             {result.errors.length > 0 && (
//               <details className="mt-10">
//                 <summary className="cursor-pointer text-2xl font-bold text-red-700 hover:underline">
//                   Show {result.errors.length} error(s)
//                 </summary>
//                 <div className="mt-6 bg-red-50 border-4 border-red-400 rounded-2xl p-8 text-left">
//                   {result.errors.map((error, i) => (
//                     <p
//                       key={i}
//                       className="text-lg text-red-800 font-medium py-2"
//                     >
//                       • {error}
//                     </p>
//                   ))}
//                 </div>
//               </details>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// clientside/src/app/coordinator/upload/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { uploadMarks, downloadTemplate } from "@/api/marksApi";
import { useToast } from "@/context/ToastContext";
import { branding } from "@/config/branding";
import { getPrograms } from "@/api/programsApi";
import { getAcademicYears } from "@/api/academicYearsApi"; 
import { getProgramUnits } from "@/api/programUnitsApi"; 
import type { Program, AcademicYear, ProgramUnit } from "@/api/types"; 

interface UploadResult {
  message: string;
  total: number;
  success: number;
  errors: string[];
}

// Static lists for simple selections
const YEARS_OF_STUDY = [1, 2, 3, 4, 5, 6];
const SEMESTERS = [1, 2];

export default function UploadMarks() {
  const { addToast } = useToast();

  // --- State for Data Fetching ---
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [programUnits, setProgramUnits] = useState<ProgramUnit[]>([]);

  // --- State for Template Selection ---
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState<string>("");
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<
    number | undefined
  >(undefined);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(
    undefined
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");

  // --- State for Upload ---
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // -----------------------------------------------------
  // useEffects for Populating Dropdowns
  // -----------------------------------------------------

  // Fetch initial data: Programs and Academic Years
  useEffect(() => {
    getPrograms()
      .then(setPrograms)
      .catch((e) => addToast("Failed to load programs.", "error"));
    getAcademicYears()
      .then(setAcademicYears)
      .catch((e) => addToast("Failed to load academic years.", "error"));
  }, [addToast]);

  // Fetch Units based on Selected Program
  useEffect(() => {
    if (selectedProgramId) {
      getProgramUnits(selectedProgramId)
        .then(setProgramUnits)
        .catch((e) =>
          addToast("Failed to load units for selected program.", "error")
        );
    } else {
      setProgramUnits([]); // Clear units if program is deselected
    }
    setSelectedUnitId(""); // Reset unit selection when program changes
  }, [selectedProgramId, addToast]);

  // Filter units based on Year/Semester selection for better UX
  const filteredProgramUnits = useMemo(() => {
    if (!selectedYearOfStudy || !selectedSemester) return programUnits;

    return programUnits.filter(
      (pu) =>
        pu.requiredYear === selectedYearOfStudy &&
        pu.requiredSemester === selectedSemester
    );
  }, [programUnits, selectedYearOfStudy, selectedSemester]);

  // Check if the download button should be enabled
  const isDownloadEnabled = useMemo(() => {
    return (
      !!selectedProgramId &&
      !!selectedUnitId &&
      !!selectedAcademicYearId &&
      !!selectedYearOfStudy &&
      !!selectedSemester
    );
  }, [
    selectedProgramId,
    selectedUnitId,
    selectedAcademicYearId,
    selectedYearOfStudy,
    selectedSemester,
  ]);

  // -----------------------------------------------------
  // Handlers
 
  const handleDownloadTemplate = async () => {
    // Use the state variables for the required parameters
    if (!isDownloadEnabled) {
      addToast("Please select all options before downloading.", "error");
      return;
    }

    try {
      await downloadTemplate(
        selectedProgramId,
        selectedUnitId,
        selectedAcademicYearId,
        selectedYearOfStudy!,
        selectedSemester!
      );
      addToast("Template download started!", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Download failed";
      addToast(`Download failed: ${errorMessage}`, "error");
      console.error("Download Error:", error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const valid =
      selectedFile.name.endsWith(".csv") ||
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls");

    if (valid) {
      setFile(selectedFile);
      setResult(null);
      addToast(`${selectedFile.name} ready for upload`, "success");
    } else {
      addToast("Invalid file type. Only .csv, .xlsx allowed", "error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);
    try {
      const data = await uploadMarks(file);
      setResult(data);
      if (data.success === data.total) {
        addToast(
          `PERFECT! All ${data.success} records uploaded successfully!`,
          "success"
        );
      } else if (data.success > 0) {
        addToast(
          `${data.success}/${data.total} records uploaded. Check errors below.`,
          "success"
        );
      } else {
        addToast("No records uploaded. See errors.", "error");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      addToast(`Upload failed: ${errorMessage}`, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-8xl ml-48  my-10 ">
      <div className="bg-white max-w-full min-h-screen rounded-3xl shadow-2xl p-10">
        <div className=" rounded-lg shadow-md border border-green-dark/20 p-4 ">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r  from-green-darkest to-green-dark">
            Upload Student Marks
          </h1>
          <p className=" text-green-darkest">
            Select the Academic Context and download the official{" "}
            {branding.school} scoresheet template.
          
          </p>
        </div>

        {/* --- SELECTION CONTROLS (New Section) --- */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {/* 1. Program Select */}
          <div>
            <label className="block text-sm font-medium text-green-darkest mb-1">
              Program
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-green-darkest/40 shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="" >Select Program</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id} className="text-green-darkest text-sm">
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Academic Year Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <select
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
              className="w-full p-2 border border-gray-300 text-green-darkest/40 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Year</option>
              {academicYears.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Year of Study Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year of Study
            </label>
            <select
              value={selectedYearOfStudy || ""}
              onChange={(e) =>
                setSelectedYearOfStudy(parseInt(e.target.value) || undefined)
              }
              className="w-full p-2 border border-gray-300  text-green-darkest/40 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Year</option>
              {YEARS_OF_STUDY.map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Semester Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester || ""}
              onChange={(e) =>
                setSelectedSemester(parseInt(e.target.value) || undefined)
              }
              className="w-full p-2 border border-gray-300 text-green-darkest/40 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Sem</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Unit Select (Filtered) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
          
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              disabled={
                !selectedProgramId || !selectedYearOfStudy || !selectedSemester
              }
              className={`w-full p-2 border rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 ${
                !selectedProgramId || !selectedYearOfStudy || !selectedSemester
                  ? "bg-gray-200 cursor-not-allowed text-gray-400"
                  : "border-gray-300 text-green-darkest/40"
              }`}
            >
              <option value="">Select Unit</option>
              {filteredProgramUnits.map((pu) => (
                <option key={pu._id} value={pu.unit._id}>
                  {pu.unit.code} - {pu.unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template Download Button (Updated onClick handler) */}
        <div className="text-center my-8">
          <button
            onClick={handleDownloadTemplate} // 👈 Call the new handler
            disabled={!isDownloadEnabled}
            className="inline-flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-2xl hover:from-green-700 hover:to-emerald-800 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download Scoresheet Template 
          </button>
        </div>
       
        {/* Drag & Drop Zone */}
       
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-20 text-center transition-all duration-300 ${
            dragActive
              ? "border-green-darkest bg-green-dark/20 shadow-2xl scale-105"
              : "border-gray-400 bg-white shadow-xl"
          }`}
        >
         
          {dragActive && (
            <div className="absolute inset-0 bg-green-dark/50 bg-opacity-10 rounded-3xl animate-pul" />
          )}

          {!file ? (
            <>
              <div className="mb-8">
                <svg
                  className="w-32 h-32 mx-auto text-green-darkest/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-xl font-bold text-green-darkest mb-6">
                Drop your marks file here
              </p>
              <p className="text-2xl text-green-darkest mb-10">or</p>
              <label className="inline-block px-8 py-4 bg-gradient-to-r from-green-darkest to-green-dark text-white text-2xl font-bold rounded-2xl cursor-pointer hover:shadow-2xl transition transform hover:scale-105">
                Browse Files
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-8">
                <svg
                  className="w-32 h-32 mx-auto text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-4xl font-bold text-green-700 mb-4">
                {file.name}
              </p>
              <p className="text-2xl text-gray-600 mb-10">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={() => setFile(null)}
                className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-bold rounded-xl transition"
              >
                Remove File
              </button>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {file && (
          <div className="text-center mt-12">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-8 py-4 bg-gradient-to-r from-green-darkest to-green-dark text-white text-xl font-black rounded-3xl shadow-3xl hover:shadow-4xl disabled:opacity-70 disabled:cursor-not-allowed transition transform hover:scale-105 flex items-center gap-6 mx-auto"
            >
              {uploading ? (
                <>
                  <span className="inline-block w-12 h-12 border-8 border-white border-t-transparent rounded-full animate-spin"></span>
                  Uploading & Calculating Grades...
                </>
              ) : (
                <>
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4"
                    />
                  </svg>
                  Upload & Process Marks
                </>
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`mt-16 p-12 rounded-3xl shadow-2xl text-center ${
              result.success === result.total
                ? "bg-gradient-to-br from-green-100 to-emerald-100 border-8 border-green-500"
                : "bg-gradient-to-br from-yellow-100 to-orange-100 border-8 border-yellow-500"
            }`}
          >
            <h3 className="text-5xl font-black mb-6">
              {result.success === result.total ? "SUCCESS!" : "PARTIAL SUCCESS"}
            </h3>
            <p className="text-6xl font-black text-gray-900 mb-8">
              {result.success} / {result.total}
            </p>
            <p className="text-4xl font-bold text-gray-800">
              records processed successfully
            </p>

            {result.errors.length > 0 && (
              <details className="mt-10">
                <summary className="cursor-pointer text-2xl font-bold text-red-700 hover:underline">
                  Show {result.errors.length} error(s)
                </summary>
                <div className="mt-6 bg-red-50 border-4 border-red-400 rounded-2xl p-8 text-left">
                  {result.errors.map((error, i) => (
                    <p
                      key={i}
                      className="text-lg text-red-800 font-medium py-2"
                    >
                      • {error}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
