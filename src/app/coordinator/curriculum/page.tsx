// clientside/src/app/coordinator/curriculum/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getPrograms } from "@/api/programsApi";
import { createUnitTemplate, getUnitTemplates } from "@/api/unitsApi";
import {
  getProgramUnits,
  createProgramUnitLink,
  updateProgramUnitLink,
  deleteProgramUnitLink,
  ProgramUnitLinkFormData,
} from "@/api/programUnitsApi";
import type { AxiosExpectedError, Program, ProgramUnit, Unit } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import { X, Trash2, PenLine } from "lucide-react";
import CommonButton from "@/components/ui/CommonButton";

// Define the shape of the form state
interface CurriculumFormState {
  // Fields for linking (ProgramUnit)
  programId: string;
  unitId: string; // The ID of the Unit Template being linked
  requiredYear: string; // Stored as string for the input/select value
  requiredSemester: string; // Stored as string for the input/select value
  isElective?: boolean;

  // Fields used only when creating a brand NEW Unit Template (NOT IMPLEMENTED HERE for complexity)
  // code: string; 
  // name: string;
}

export default function CurriculumManagementPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  // Store all available Unit Templates
  const [unitTemplates, setUnitTemplates] = useState<Unit[]>([]);
  // Store the curriculum links for the selected program
  const [curriculum, setCurriculum] = useState<ProgramUnit[]>([]); 
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // ProgramUnit ID being edited
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const { addToast } = useToast();

  const [selectedProgramId, setSelectedProgramId] = useState("");

  const [form, setForm] = useState<CurriculumFormState>({
    programId: "",
    unitId: "",
    requiredYear: "1",
    requiredSemester: "1",
    isElective: false,
  });

  const [showTemplateModal, setShowTemplateModal] = useState(false);
const [templateForm, setTemplateForm] = useState({
  code: "",
  name: "",
});

  // --- Data Loading Effects ---

  // 1. Load Programs and Unit Templates once on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [progs, templates] = await Promise.all([
        getPrograms(), 
        getUnitTemplates() // Fetch all base templates
      ]);

      setPrograms(progs);
      setUnitTemplates(templates);
      
      const initialProgramId = progs.length > 0 ? progs[0]._id : "";
      setSelectedProgramId(initialProgramId);
      
      if (initialProgramId) {
        await loadProgramCurriculum(initialProgramId);
      }
    } catch {
      addToast("Failed to load programs or unit templates", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Load curriculum whenever selectedProgramId changes
  useEffect(() => {
    if (selectedProgramId) {
      // Set the form's programId to the currently selected program for new links
      setForm(prev => ({ ...prev, programId: selectedProgramId }));
      loadProgramCurriculum(selectedProgramId);
    } else if (!loading) {
      setCurriculum([]);
    }
  }, [selectedProgramId]);
  
  const loadProgramCurriculum = async (programId: string) => {
    setLoading(true);
    try {
      const curriculumList = await getProgramUnits(programId);
      setCurriculum(curriculumList);
    } catch {
      addToast("Failed to load program curriculum", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!templateForm.code.trim() || !templateForm.name.trim()) {
    addToast("Unit code and name are required.", "error");
    return;
  }

  setSubmitting(true);

  try {
    await createUnitTemplate({
      code: templateForm.code,
      name: templateForm.name,
    });
    
    addToast(`Unit Template ${templateForm.code} created successfully.`, "success");
    
    // Clear form and close modal
    setTemplateForm({ code: "", name: "" });
    setShowTemplateModal(false);
    
    // CRITICAL: Reload all templates so the main 'Link Unit' form dropdown updates
    await loadInitialData(); 
  } catch (error) {
    const axiosError = error as AxiosExpectedError;
    const backendMessage = axiosError.response?.data?.message || "Failed to create unit template.";
    addToast(backendMessage, "error");
  } finally {
    setSubmitting(false);
  }
};

  // --- Form Logic ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation is focused on the curriculum link fields
    if (!form.programId || !form.requiredYear || !form.requiredSemester) {
      addToast("Please select a Program, Year, and Semester.", "error");
      return;
    }
    if (!editingId && !form.unitId) { // Must select a template for a new link
        addToast("Please select a Unit Template to link.", "error");
        return;
    }

    setSubmitting(true);
    setMessage("");

    const linkData: ProgramUnitLinkFormData = {
        programId: form.programId,
        unitId: form.unitId,
        requiredYear: Number(form.requiredYear),
        requiredSemester: Number(form.requiredSemester) as 1 | 2,
        isElective: form.isElective || false,
    };

    try {
      if (editingId) {
        // --- UPDATE EXISTING CURRICULUM LINK ---
        await updateProgramUnitLink(editingId, {
          requiredYear: linkData.requiredYear,
          requiredSemester: linkData.requiredSemester,
          isElective: linkData.isElective,
        });
        addToast("Curriculum link updated successfully", "success");
      } else {
        // --- CREATE NEW CURRICULUM LINK ---
        await createProgramUnitLink(linkData);
        addToast("Unit linked to program successfully", "success");
      }

      resetForm();
      await loadProgramCurriculum(selectedProgramId); // Reload only the curriculum list
   } catch (error) {
        const axiosError = error as AxiosExpectedError; 
        
        // Default message in case the error structure is unexpected
        let userFacingMessage = "An unexpected error occurred.";
        
        // 1. Get the message from the backend, if available
        const backendMessage = axiosError.response?.data?.message;

        // 2. Check the HTTP Status Code for specific handling
        const status = axiosError.response?.status;

        switch (status) {
            case 400:
                // Bad Request (Usually triggered by validation errors or business logic errors)
                // Examples: Unit already linked, missing required field, constraint violation (e.g., trying to delete a linked Unit Template)
                userFacingMessage = backendMessage || "Data provided is invalid or violates a curriculum rule.";
                break;
                
            case 401:
            case 403:
                // Unauthorized / Forbidden
                userFacingMessage = "You do not have permission to perform this action.";
                // Often, you would trigger a logout or redirect here
                // router.push('/login');
                break;
                
            case 404:
                // Not Found (e.g., trying to update a ProgramUnit link that was just deleted by another admin)
                userFacingMessage = "The curriculum item you tried to modify was not found.";
                break;

            case 500:
                // Server Error
                userFacingMessage = "A server error occurred. Please try again later.";
                break;
                
            default:
                // For network errors or other unexpected status codes
                userFacingMessage = backendMessage || axiosError.message;
                break;
        }

        addToast(userFacingMessage, "error");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const resetForm = () => {
    setForm({
      programId: selectedProgramId,
      unitId: "",
      requiredYear: "1",
      requiredSemester: "1",
      isElective: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Start edit now operates on a ProgramUnit object
  const startEdit = (link: ProgramUnit) => {
    setEditingId(link._id);
    setForm({
      programId: link.program._id,
      unitId: link.unit._id,
      requiredYear: String(link.requiredYear),
      requiredSemester: String(link.requiredSemester),
      isElective: link.isElective,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this unit link from the curriculum? The base unit template will NOT be deleted.")) return;

    setSubmitting(true);
    try {
      await deleteProgramUnitLink(id);
      addToast("Unit successfully delinked from program", "success");
      await loadProgramCurriculum(selectedProgramId);
  } catch (error) {
      const axiosError = error as AxiosExpectedError;
      const backendMessage = axiosError.response?.data?.message || "Delete failed.";
      addToast(backendMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render UI ---

  if (loading && programs.length === 0) {
    // Initial loading state
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 border-8 border-green-darkest border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-3xl font-black text-green-dark">Loading Academic Data...</p>
          <p className="text-green-darkest mt-4">Fetching programs and curriculum structures</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl h-full ml-48 my-10 ">
      <div className="bg-white rounded-3xl shadow-2xl p-10 min-h-screen">
        
        <div className="flex justify-between items-center rounded-lg shadow-md border border-green-dark/20 p-4 ">
          <h1 className="text-2xl font-bold text-green-darkest">Curriculum Management</h1>
          
          <div className="flex space-x-4">
            {/* NEW BUTTON: Triggers the Template Creation Modal */}
            <button
              onClick={() => setShowTemplateModal(true)}
              disabled={submitting || showForm} // Disable if another form is active
              className="px-4 py-2 bg-gradient-to-r from-green-dark to-lime-bright text-white-pure rounded-2xl hover:shadow-4xl hover:scale-105 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
            >
              + New Unit 
            </button>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                disabled={submitting}
                className=" px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-2xl hover:from-green-700 hover:to-emerald-800 hover:scale-105 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
              >
                Link Unit to Program
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          
          {/* Program Selector */}
          {/* <div className=" flex mb-8 max-w-l mx-uto"> */}
                <div className="flex justify-between bg-gray-200   rounded-lg shadow-md border border-green-dark/20 p-4 ">
            <label className="block text-green-darkest font-bold mb-">
              Viewing Curriculum for:
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full rounded-md border border-transparent border-green-darkest  bg-transparent px-3 py-3 text-green-dark outline-0 transition-all focus:border-t-transparent focus:outline-0"
              disabled={submitting || loading}
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Creation / Edit Form */}
          {showForm && (
            <>
              <div className="flex justify-between px-8 ">
                <h2 className="text-xl font-black text-center mb-8 text-green-darkest">
                  {editingId ? "Edit Curriculum Slot" : "Link New Unit"}
                </h2>
                <button
                  onClick={resetForm}
                  className=" w-10 h-10 bg-green-dark hover:bg-red-400 hover:text-green-darkest text-yellow-gold rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 z-10 group"
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
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto bg-white-pure p-6 rounded-lg shadow-xl"
              >
                
                {/* Unit Template Selector (Only visible for new creation) */}
                {!editingId && (
                  <div>
                    <label className="block text-green-darkest font-bold mb-2">
                      Unit Template (Required)
                    </label>
                    <select
                      value={form.unitId}
                      onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                      className=" w-full rounded-md border border-green-darkest bg-transparent px-3 py-3 text-green-dark outline-0 transition-all"
                      required
                      disabled={submitting}
                    >
                      <option value="">Select Unit Template</option>
                      {unitTemplates.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.code} - {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Display Current Unit when Editing */}
                 {editingId && (
                    <div className="md:col-span-2">
                        <label className="block text-green-darkest font-bold mb-2">
                            Unit Being Edited
                        </label>
                        <div className="p-3 bg-gray-100 rounded-md font-semibold text-green-darkest">
                            {curriculum.find(c => c._id === editingId)?.unit.code} - 
                            {curriculum.find(c => c._id === editingId)?.unit.name}
                        </div>
                    </div>
                )}
                
                {/* Year and Semester Selectors (for update and create) */}
                <div>
                  <label className="block text-green-darkest font-bold mb-2">
                    Required Year
                  </label>
                  <select
                    value={form.requiredYear}
                    onChange={(e) => setForm({ ...form, requiredYear: e.target.value })}
                    className=" w-full rounded-md border border-green-darkest bg-transparent px-3 py-3 text-green-dark outline-0 transition-all"
                    disabled={submitting}
                  >
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <option key={y} value={String(y)}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-green-darkest font-bold mb-2">
                    Required Semester
                  </label>
                  <select
                    value={form.requiredSemester}
                    onChange={(e) => setForm({ ...form, requiredSemester: e.target.value })}
                    className=" w-full rounded-md border border-green-darkest bg-transparent px-3 py-3 text-green-dark outline-0 transition-all"
                    disabled={submitting}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
                
                {/* Submission Button */}
                <div className="flex gap-4 items-center mt-5 md:col-span-2 lg:col-span-3">
                  <CommonButton
                    type="submit"
                    disabled={submitting}
                    className="font-bold"
                    textColor="text-white-pure"
                  >
                    {submitting ? (
                      <>
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingId ? "Updating Link..." : "Creating Link..."}
                      </>
                    ) : editingId ? (
                      "Update Curriculum Link"
                    ) : (
                      "Create Curriculum Link"
                    )}
                  </CommonButton>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-500 text-white font-bold rounded-2xl hover:bg-gray-600"
                      disabled={submitting}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {/* Message */}
          {/* ... (Message component remains the same) */}
          
          {message && (
             <div
               className={`p-2 text-center text-white font-black text-xl rounded-2xl mb-10 shadow-2xl animate-pulse ${
                 message.includes("success") ||
                 message.includes("created") ||
                 message.includes("updated") ||
                 message.includes("delinked")
                   ? "bg-green-600"
                   : "bg-red-600"
               }`}
             >
               {message}
             </div>
           )}


          {/* Curriculum Grid */}
          
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8 overflow-hidden">
            
           
            <div className="px-8 py-2 border-b border-green-dark bg-green-dark/10">
                        <h2 className="text-xl font-semibold text-green-darkest">
                                          Curriculum List for: {programs.find(p => p._id === selectedProgramId)?.code || "N/A"}

                        </h2>
                      </div>
            
            {curriculum.length === 0 && !loading ? (
              <div className="col-span-full text-center py-20">
                <p className="text-xl font-bold text-gray-400">
                  No units linked to this program yet.
                </p>
                <p className="text-md text-gray-500 mt-4">
                  Use the &apos;Link Unit to Program&apos; button above to define the curriculum.
                </p>
              </div>
            ) : (
              <table className="w-full  text-sm ">
                <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
                  <tr>
                    <th className="px-4 py-2 text-left font-bold ">Unit Code</th>
                    <th className="px-4 py-2 text-left font-bold ">Unit Name</th>
                    <th className="px-4 py-2 text-center font-bold ">Year</th>
                    <th className="px-4 py-2 text-center font-bold ">Semester</th>
                    <th className="px-4 py-2 text-center font-bold ">Edit/Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {curriculum.map((link) => (
                    <tr key={link._id} className="text-green-darkest">
                      <td className="px-2 border border-green-darkest/30">{link.unit.code}</td>
                      <td className="px-2 border border-green-darkest/30 ">{link.unit.name}</td>
                      <td className="  border border-green-darkest/30 text-center ">{link.requiredYear}</td>
                      <td className=" border border-green-darkest/30 text-center ">{link.requiredSemester}</td>
                      
                      {/* Action Buttons (Edit/Delete Link) */}
                      <td className="flex justify-center gap-4 border border-green-darkest/30">
                        <button
                          onClick={() => startEdit(link)}
                          disabled={submitting}
                          title="Edit Unit"
                          className="py-2 hover:text-green-dark/50 text-green-dark flex items-center justify-center hover:scale-110 transition-all duration-200 disabled:opacity-50 group"
                        >
                          <PenLine />
                        </button>
                        <button
                          onClick={() => handleDelete(link._id)}
                          disabled={submitting}
                          title="Delete Unit"
                          className="hover:text-red-300 text-red-600 flex items-center justify-center hover:scale-110 transition-all duration-200 disabled:opacity-50 group"
                        >
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-green-darkest">Create New Unit Template</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-500 hover:text-red-500 transition"
                  disabled={submitting}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateTemplate}>
                <div className="mb-4">
                  <label className="block text-green-darkest font-bold mb-2">Unit Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ICS 2107"
                    value={templateForm.code}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, code: e.target.value.toUpperCase() })
                    }
                    className="w-full rounded-md border border-green-darkest px-3 py-3 text-green-dark outline-0"
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-green-darkest font-bold mb-2">Unit Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Database Systems"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full rounded-md border border-green-darkest px-3 py-3 text-green-dark outline-0"
                    required
                    disabled={submitting}
                  />
                </div>

                <CommonButton
                  type="submit"
                  disabled={submitting}
                  className="font-bold w-full"
                  textColor="text-white-pure"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Template"
                  )}
                </CommonButton>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}