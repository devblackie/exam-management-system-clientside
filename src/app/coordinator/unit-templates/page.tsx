"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getUnitTemplates, 
  updateUnitTemplate, 
  deleteUnitTemplate,
  UnitTemplateFormData
} from "@/api/unitsApi";
import type { Unit } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import CommonButton from "@/components/ui/CommonButton";
import { X, Trash2, PenLine, Check, ChevronLeft, ChevronRight, Search } from "lucide-react";

// Assuming you have the AxiosExpectedError type defined
interface AxiosExpectedError {
  response?: {
    data?: { message?: string };
  };
  message: string;
}

const UNITS_PER_PAGE = 7; // Define items per page

export default function UnitTemplateManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { addToast } = useToast();

  // --- Search and Pagination State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for the edit form
  const [editForm, setEditForm] = useState<UnitTemplateFormData>({ code: "", name: "" });

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      // NOTE: In a production app, we would pass searchTerm and pagination 
      // parameters to the backend API call here (GET /units?page=x&limit=y&search=z)
      const data = await getUnitTemplates();
      setUnits(data);
    } catch {
      addToast("Failed to load unit templates.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Search and Pagination Logic (Client-Side) ---

  const filteredUnits = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    // Reset page to 1 if the search term changes
    // This is often handled in the useEffect if we were fetching from the backend
    if (currentPage !== 1 && term !== "") {
        setCurrentPage(1); 
    }

    if (!term) return units;

    return units.filter(unit => 
        unit.code.toLowerCase().includes(term) ||
        unit.name.toLowerCase().includes(term)
    );
  }, [units, searchTerm]);


  const totalPages = Math.ceil(filteredUnits.length / UNITS_PER_PAGE);
  const startIndex = (currentPage - 1) * UNITS_PER_PAGE;
  const currentUnits = filteredUnits.slice(startIndex, startIndex + UNITS_PER_PAGE);


  // --- Edit/Delete Handlers (Unchanged) ---
  const startEdit = (unit: Unit) => {
    setEditingId(unit._id);
    setEditForm({ code: unit.code, name: unit.name });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ code: "", name: "" });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.code.trim() || !editForm.name.trim()) return;

    setSubmitting(true);
    try {
      await updateUnitTemplate(editingId, { 
          code: editForm.code, 
          name: editForm.name 
      });
      addToast("Unit Template updated successfully.", "success");
      cancelEdit();
      // Reload units to get updated data
      await loadUnits();
    } catch (error) {
      const axiosError = error as AxiosExpectedError;
      const backendMessage = axiosError.response?.data?.message || "Failed to update unit template.";
      addToast(backendMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (unitId: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete Unit Template ${code}? This is irreversible.`)) {
      return;
    }

    setSubmitting(true);
    try {
      await deleteUnitTemplate(unitId);
      addToast(`Unit Template ${code} deleted successfully.`, "success");
      await loadUnits();
    } catch (error) {
      const axiosError = error as AxiosExpectedError;
      const backendMessage = axiosError.response?.data?.message || "Failed to delete unit template.";
      addToast(backendMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="p-10 text-center text-lg text-green-darkest">
        Loading Unit Templates...
      </div>
    );
  }

  return (
    <div className="max-w-8xl h-full ml-48  my-10 ">
      <div className="bg-white min-h-screen rounded-3xl shadow-2xl p-10">
       
       

         <div className="rounded-lg shadow-md border border-green-dark/20 p-4 ">
          <h1 className="text-2xl font-bold text-green-darkest">
            Academic Units Management
          </h1>

         
        </div>
        
        {/* Search Bar and Controls */}
 

        <div className=" rounded-lg  my-4">
          <div className="flex ">
            {/* <div className=""> */}
            <input
                     type="text"
                    placeholder="Search by Code or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 text-green-darkest text-lg border border-green-darkest/40 rounded-br-none rounded-tr-none rounded-lg placeholder-green-dark/50 focus:outline-0 focus:border-green-darkest"

            />
                {/* <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-darkest" /> */}
{/* </div> */}
            <button
     
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-sm text-white-pure rounded-lg rounded-bl-none rounded-tl-none   disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"

            >
      Total Units: {filteredUnits.length}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg">
            <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">
                  Edit/Delete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-green-dark/20">
              {currentUnits.length > 0 ? (
                currentUnits.map((unit) => (
                    <tr key={unit._id} className={editingId === unit._id ? "bg-yellow-50/70" : "hover:bg-green-dark/30 transition"}>
                    {editingId === unit._id ? (
                        // --- EDIT ROW (unchanged) ---
                        <td colSpan={3} className="p-4">
                        <form onSubmit={handleUpdate} className="grid grid-cols-4 gap-4 items-center">
                            <input
                            type="text"
                            value={editForm.code}
                            onChange={(e) => setEditForm({...editForm, code: e.target.value.toUpperCase()})}
                            placeholder="Code"
                            className="col-span-1 text-green-dark/50 border rounded-md p-2"
                            disabled={submitting}
                            required
                            />
                            <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            placeholder="Name"
                            className="col-span-2 text-green-dark/50 border rounded-md p-2"
                            disabled={submitting}
                            required
                            />
                            <div className="flex space-x-2 justify-end">
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                className=" px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg hover:from-green-700 hover:to-emerald-800  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"

                                
                                >
                                     Save
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={submitting}
                                    className="h-10 px-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition flex items-center"
                                >
                                    <X size={18} /> Cancel
                                </button>
                            </div>
                        </form>
                        </td>
                    ) : (
                        // --- VIEW ROW (unchanged) ---
                        <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {unit.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {unit.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => startEdit(unit)}
                                disabled={submitting}
                                title="Edit Unit Template"
                                className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                            >
                                <PenLine size={20} />
                            </button>
                            <button
                                onClick={() => handleDelete(unit._id, unit.code)}
                                disabled={submitting}
                                title="Delete Unit Template"
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                                <Trash2 size={20} />
                            </button>
                            </div>
                        </td>
                        </>
                    )}
                    </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                        {searchTerm ? "No units match your search criteria." : "No unit templates found."}
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + UNITS_PER_PAGE, filteredUnits.length)} of {filteredUnits.length} templates
                </p>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || submitting}
                        className="p-2 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="p-2 text-sm font-semibold text-green-darkest">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || submitting}
                        className="p-2 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}