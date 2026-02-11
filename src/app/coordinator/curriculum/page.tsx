// clientside/src/app/coordinator/curriculum/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getPrograms } from "@/api/programsApi";
import { createUnitTemplate, getUnitTemplates } from "@/api/unitsApi";
import { getProgramUnits, createProgramUnitLink,
  updateProgramUnitLink, deleteProgramUnitLink, ProgramUnitLinkFormData,
} from "@/api/programUnitsApi";
import type { CurriculumFormState, Program, ProgramUnit, Unit,} from "@/api/types";
import { useToast } from "@/context/ToastContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { CurriculumTable } from "@/components/coordinator/Curriculum/CurriculumTable";
import { CurriculumLinkForm } from "@/components/coordinator/Curriculum/CurriculumLinkForm";
import { UnitTemplateModal } from "@/components/coordinator/Curriculum/UnitTemplateModal";
import PageHeader from "@/components/ui/PageHeader";
import { Layers, Plus, Link as LinkIcon, Activity } from "lucide-react";

export default function CurriculumManagementPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [unitTemplates, setUnitTemplates] = useState<Unit[]>([]);
  const [curriculum, setCurriculum] = useState<ProgramUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const { addToast } = useToast();

  const [form, setForm] = useState<CurriculumFormState>({
    programId: "",
    unitId: "",
    requiredYear: "1",
    requiredSemester: "1",
    isElective: false,
  });

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [progs, templates] = await Promise.all([
        getPrograms(),
        getUnitTemplates(),
      ]);
      setPrograms(progs);
      setUnitTemplates(templates);
      if (progs.length > 0) setSelectedProgramId(progs[0]._id);
    } catch {
      addToast("Failed to load initial data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      setForm((prev) => ({ ...prev, programId: selectedProgramId }));
      loadProgramCurriculum(selectedProgramId);
    }
  }, [selectedProgramId]);

  const loadProgramCurriculum = async (id: string) => {
    try {
      const list = await getProgramUnits(id);
      setCurriculum(list);
    } catch {
      addToast("Failed to load curriculum", "error");
    }
  };

  const handleCreateTemplate = async (code: string, name: string) => {
    const normalizedCode = code.trim().toUpperCase();
    const exists = unitTemplates.some((u) => u.code === normalizedCode);

    if (exists) {
      addToast(
        `Unit ${normalizedCode} already exists in the template library.`,
        "error",
      );
      return;
    }
    setSubmitting(true);
    try {
      await createUnitTemplate({ code, name });
      addToast("Unit created successfully", "success");
      setShowTemplateModal(false);
      await loadInitialData();
    } catch {
      addToast("Failed to create unit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) {
      const isAlreadyLinked = curriculum.some(
        (item) => item.unit._id === form.unitId,
      );
      if (isAlreadyLinked) {
        const unitName = unitTemplates.find((u) => u._id === form.unitId)?.code;
        addToast(
          `${unitName} is already part of this program's curriculum.`,
          "error",
        );
        return;
      }
    }
    setSubmitting(true);
    const linkData: ProgramUnitLinkFormData = {
      programId: form.programId,
      unitId: form.unitId,
      requiredYear: Number(form.requiredYear),
      requiredSemester: Number(form.requiredSemester) as 1 | 2,
      isElective: form.isElective || false,
    };

    try {
      if (editingId) {
        await updateProgramUnitLink(editingId, linkData);
        addToast("Updated successfully", "success");
      } else {
        await createProgramUnitLink(linkData);
        addToast("Linked successfully", "success");
      }
      resetForm();
      loadProgramCurriculum(selectedProgramId);
    } catch (err) {
      addToast("Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({ ...form, unitId: "", requiredYear: "1", requiredSemester: "1" });
  };

  const startEdit = (link: ProgramUnit) => {
    setEditingId(link._id);
    setForm({
      programId: link.program._id,
      unitId: link.unit._id,
      requiredYear: String(link.requiredYear),
      requiredSemester: String(link.requiredSemester),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return <LoadingState message="Fetching academic structures..." />;

  return (
    <div className="max-w-8xl h-full ml-48 my-10 ">
      <div className="bg-[#F8F9FA] rounded-xl shadow-2xl p-10 min-h-screen">
        {/* Header */}
        <PageHeader
          title="Curriculum"
          highlightedTitle="Management"
          actions={
            <>
              {!showForm && (
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-5 py-2.5 bg-green-darkest text-yellow-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  + New Unit
                </button>
              )}

              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 border border-green-darkest/10 text-green-darkest rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Link Program
                </button>
              )}
            </>
          }
        />

        {/* Program Selector */}
        <div className="flex items-center bg-white rounded-lg px-6 py-4 mb-10 border border-green-darkest/5 shadow-sm">
          <div className="flex items-center gap-3 mr-6 border-r border-slate-100 pr-6">
            <Layers size={18} className="text-yellow-gold" />
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Program
            </label>
          </div>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="flex-1 text-sm font-bold bg-transparent border-0 outline-0 text-green-darkest cursor-pointer"
          >
            {programs.map((p) => ( <option key={p._id} value={p._id}> {p.code} — {p.name} </option> ))}
          </select>
        </div>

        {/* 1. The Link Form Component */}
        {showForm && (
          <CurriculumLinkForm
            form={form}  setForm={setForm}
            unitTemplates={unitTemplates} editingId={editingId}
            curriculum={curriculum} submitting={submitting}
            onSubmit={handleSubmitLink}  onClose={resetForm}
          />
        )}

        {/* 2. The Data Table Component */}
        <CurriculumTable
          curriculum={curriculum} programs={programs}
          selectedProgramId={selectedProgramId} loading={loading}
          submitting={submitting}  onEdit={startEdit}
          onDelete={(id) => {
            if (confirm("Delink unit?"))
              deleteProgramUnitLink(id).then(() =>
                loadProgramCurriculum(selectedProgramId),
              );
          }}
        />

        {/* 3. The Modal Component */}
        <UnitTemplateModal
          isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)}
          onSubmit={handleCreateTemplate} submitting={submitting}
        />
      </div>
    </div>
  );
}
