// clientside/src/app/coordinator/curriculum/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrograms } from "@/hooks/queries/usePrograms";
import { useUnits, useCreateUnit } from "@/hooks/queries/useUnits";
import {
  useProgramUnits,
  useCreateProgramUnit,
  useUpdateProgramUnit,
  useDeleteProgramUnit,
} from "@/hooks/queries/useProgramUnits";
import type { ProgramUnitLinkFormData } from "@/api/programUnitsApi";
import type { CurriculumFormState, ProgramUnit } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { CurriculumTable } from "@/components/coordinator/Curriculum/CurriculumTable";
import { CurriculumLinkForm } from "@/components/coordinator/Curriculum/CurriculumLinkForm";
import { UnitTemplateModal } from "@/components/coordinator/Curriculum/UnitTemplateModal";
import PageHeader from "@/components/ui/PageHeader";
import { Layers } from "lucide-react";

export default function CurriculumManagementPage() {
  const { data: programs = [], isLoading: programsLoading } = usePrograms();
  const { data: unitTemplates = [], isLoading: unitsLoading } = useUnits();
  const createUnit = useCreateUnit();
  const { addToast } = useToast();

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: curriculum = [], isLoading: curriculumLoading } = useProgramUnits(selectedProgramId);

  const createProgramUnit = useCreateProgramUnit();
  const updateProgramUnit = useUpdateProgramUnit();
  const deleteProgramUnit = useDeleteProgramUnit();

  const [form, setForm] = useState<CurriculumFormState>({
    programId: "",
    unitId: "",
    requiredYear: "1",
    requiredSemester: "1",
    isElective: false,
  });

  useEffect(() => {
    if (programs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(programs[0]._id);
    }
  }, [programs, selectedProgramId]);

  useEffect(() => {
    if (selectedProgramId) {
      setForm((prev) => ({ ...prev, programId: selectedProgramId }));
    }
  }, [selectedProgramId]);

  const handleCreateTemplate = useCallback(
    async (code: string, name: string) => {
      const normalizedCode = code.trim().toUpperCase();
      const exists = unitTemplates.some((u) => u.code === normalizedCode);
      if (exists) {
        addToast(`Unit ${normalizedCode} already exists in your department.`, "error");
        return;
      }
      setSubmitting(true);
      try {
        const result = await createUnit.mutateAsync({ code: normalizedCode, name });
        addToast(result.message || "Unit created successfully", "success");
        setShowTemplateModal(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create unit";
        addToast(message, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [unitTemplates, createUnit, addToast],
  );

  const resetForm = useCallback(() => {
    setEditingId(null);
    setShowForm(false);
    setForm((prev) => ({ ...prev, unitId: "", requiredYear: "1", requiredSemester: "1", isElective: false }));
  }, []);

  const handleSubmitLink = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingId) {
        const isAlreadyLinked = curriculum.some((item) => item.unit._id === form.unitId);
        if (isAlreadyLinked) {
          const unitName = unitTemplates.find((u) => u._id === form.unitId)?.code;
          addToast(`${unitName} is already linked to this program.`, "error");
          return;
        }
      }
      const linkData: ProgramUnitLinkFormData = {
        programId: form.programId,
        unitId: form.unitId,
        requiredYear: Number(form.requiredYear),
        requiredSemester: Number(form.requiredSemester) as 1 | 2,
        isElective: form.isElective || false,
      };
      setSubmitting(true);
      try {
        if (editingId) {
          await updateProgramUnit.mutateAsync({ id: editingId, data: linkData });
          addToast("Curriculum link updated.", "success");
        } else {
          await createProgramUnit.mutateAsync(linkData);
          addToast("Unit linked to program.", "success");
        }
        resetForm();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Operation failed.";
        addToast(message, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [editingId, curriculum, form, unitTemplates, addToast, resetForm, createProgramUnit, updateProgramUnit],
  );

  const startEdit = useCallback((link: ProgramUnit) => {
    setEditingId(link._id);
    setForm({
      programId: link.program._id,
      unitId: link.unit._id,
      requiredYear: String(link.requiredYear),
      requiredSemester: String(link.requiredSemester),
      isElective: false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteProgramUnit.mutateAsync(id);
        addToast("Unit delinked from program.", "success");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Delete failed.";
        addToast(message, "error");
      }
    },
    [deleteProgramUnit, addToast],
  );

  const isLoading = programsLoading || unitsLoading;
  if (isLoading) return <LoadingState message="Loading curriculum data..." />;

  return (
    <div className="max-w-8xl h-full lg:ml-48 my-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="bg-[#F8F9FA] rounded-2xl shadow-2xl p-10 min-h-screen border border-white/60"
      >
        <PageHeader
          title="Curriculum"
          highlightedTitle="Management"
          actions={
            <div className="flex gap-3">
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
            </div>
          }
        />

        {/* Program Selector — Executive Console Style */}
        <div className="flex items-center gap-3 mb-1 px-2">
          <Layers size={14} className="text-yellow-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
            Active Program Context
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg shadow-md bg-white mb-10"
        >
          <div className="flex">
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="flex-1 px-4 py-3 text-xs font-bold bg-transparent border-0 rounded-lg text-green-darkest outline-none cursor-pointer"
            >
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Link Form */}
        <AnimatePresence>
          {showForm && (
            <CurriculumLinkForm
              form={form}
              setForm={setForm}
              unitTemplates={unitTemplates}
              editingId={editingId}
              curriculum={curriculum}
              submitting={submitting}
              onSubmit={handleSubmitLink}
              onClose={resetForm}
            />
          )}
        </AnimatePresence>

        {/* Curriculum Table */}
        {curriculumLoading ? (
          <LoadingState message="Loading curriculum structure..." />
        ) : (
          <CurriculumTable
            curriculum={curriculum}
            programs={programs}
            selectedProgramId={selectedProgramId}
            loading={false}
            submitting={submitting}
            onEdit={startEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Unit Template Modal */}
        <UnitTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSubmit={handleCreateTemplate}
          submitting={submitting}
        />
      </motion.div>
    </div>
  );
}