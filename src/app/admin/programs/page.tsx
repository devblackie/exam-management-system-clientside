// clientside/src/app/admin/programs/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createProgram, getPrograms } from "@/api/programsApi";
import type { Program } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import { X, } from "lucide-react";
import CommonButton from "@/components/ui/CommonButton";


export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
   const [submitting, setSubmitting] = useState(false);
  const [durationYears, setDurationYears] = useState("4");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const {addToast} = useToast();
   const [form, setForm] = useState({
      programId: "",
      code: "",
      name: "",
      year: "1",
      semester: "1",
    });


  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch {
      setMessage("Failed to load programs");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setMessage("Code and Name are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await createProgram({
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        durationYears: Number(durationYears),
      });

      setMessage("Program created successfully!");
      setCode("");
      setName("");
      setDescription("");
      setDurationYears("4");
      loadPrograms();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage(err.response?.data?.message || "Failed to create program");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div className="max-w-8xl  ml-48   my-10 ">
      <div className="bg-white rounded-3xl shadow-2xl p-10 min-h-screen">
        <div className="flex justify-between items-center rounded-lg shadow-md border border-green-dark/20 p-4 ">
                 <h1 className="text-2xl font-bold text-green-darkest">
                   Academic Programs
                 </h1>
       
                 {!showForm && (
                   <div className="text-center ">
                     <button
                       onClick={() => setShowForm(true)}
                       className=" px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-2xl hover:from-green-700 hover:to-emerald-800 hover:scale-105 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
                     >
                       Add New Program
                     </button>
                   </div>
                 )}
               </div>

        <div className="flex justify-between items-center rounded-lg shadow-md border border-green-dark/20 p-4 my-4 ">
          <div className="  w-full">
            {/* Create Form */}

            {showForm && ( <> 
          <div className="flex justify-between px-8 border-b-4 shadow-xl">
                <h2 className="text-xl font-black text-center mb-8 text-green-darkest">
                  Add New Program
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className=" w-10 h-10 bg-green-dark hover:bg-red-400 hover:text-green-darkest  text-yellow-gold rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200  group"
                  disabled={submitting}
                >
                  <X />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    Close
                  </span>
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-8 w-full mx-auto bg-white-pure p-6 rounded-lg rounded-tl-0 rounded-tr-0 shadow-xl"
              >
              <div>
                <label className="block text-green-darkest  font-bold mb-2">
                  Program Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BIT, BME, BCOM"
                  className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
                  required
                />
              </div>

              <div>
                <label className="block text-green-darkest font-bold mb-2">
                  Program Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bachelor of Science in Information Technology"
                  className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-green-darkest font-bold mb-2">
                  Description Optional
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-green-darkest leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-green-darkest font-bold mb-2"
                >
                  Duration
                </label>
                <select
                  value={durationYears}
                  onChange={(e) => setDurationYears(e.target.value)}
                  // className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-200 transition font-bold"
                  className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
                >
                  {[3, 4, 5, 6].map((y) => (
                    <option key={y} value={y}>
                      {y} Years
                    </option>
                  ))}
                </select>
              </div>

              <div className="">
              
                <CommonButton
                          type="submit"
                          disabled={loading}
                          className="mt-5 font-bold  w-full "
                          textColor="text-green-darkest"
                        >
                          {loading ? "Creating..." : "Create Program"}
                        </CommonButton>
              </div>
            </form>
            </>)}

            {/* Message */}
            {message && (
              <div
                className={`p-6 text-center text-white font-bold text-xl rounded-2xl mb-10 shadow-lg ${
                  message.includes("success") ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {message}
              </div>
            )}

          
          </div>
        </div>
  {/* Programs List */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8 overflow-hidden">

               <div className="px-8 py-2 border-b border-green-dark bg-green-dark/10">
                        <h2 className="text-xl font-semibold text-green-darkest">
                Active Programs ({programs.length})
              </h2>
              </div>

              {programs.length === 0 && (
                <div className="text-center py-20 text-gray-500 text-xl">
                  No programs yet. Create your first one above!
                </div>
              )}
            </div>
        <table className="w-full  text-sm">
          <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-lg">Name</th>

              <th className="px-4 py-2 text-left font-bold text-lg">Code</th>
              <th className="px-4 py-2 text-left font-bold text-lg">Years</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program._id} className="text-green-darkest">
                <td className="p-2 border border-green-darkest/30 w-full">
                  {program.name}
                </td>
                <td className="p-2 border border-green-darkest/30 text-center w-full">
                  {program.code}
                </td>
                <td className="p-2 border border-green-darkest/30 text-center w-full">
                  {program.durationYears}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
