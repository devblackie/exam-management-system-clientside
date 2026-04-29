// clientside/src/components/coordinator/StudentSearch/DeferSuppModal.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X, CalendarClock, AlertTriangle, CheckCircle2,
  Loader2, ChevronRight, RotateCcw, ArrowRight,
  BookOpen, Clock, Info,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { deferSuppUnits, undoDeferral, getDeferredUnits, DeferredUnit } from "@/api/deferSuppApi";

interface FailedUnit  { displayName: string; attempt: string | number; programUnitId?: string; }
interface SpecialUnit { displayName: string; grounds: string; programUnitId?: string; }

interface DeferSuppModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  studentId:    string;
  studentName:  string;
  studentRegNo: string;
  academicYear: string;
  currentYear:  number;
  failedList:   FailedUnit[];
  specialList:  SpecialUnit[];
  onSuccess:    () => void;
}

type TabKey = "defer" | "deferred" | "scoresheet";

export default function DeferSuppModal({
  isOpen, onClose, studentId, studentName, studentRegNo,
  academicYear, currentYear, failedList, specialList, onSuccess,
}: DeferSuppModalProps) {
  const { addToast } = useToast();

  const [activeTab,       setActiveTab]       = useState<TabKey>("defer");
  const [selectedIds,     setSelectedIds]     = useState<Set<string>>(new Set());
  const [deferReason,     setDeferReason]     = useState<"supp_deferred" | "special_deferred">("supp_deferred");
  const [isSaving,        setIsSaving]        = useState(false);
  const [undoingId,       setUndoingId]       = useState<string | null>(null);
  const [deferredUnits,   setDeferredUnits]   = useState<DeferredUnit[]>([]);
  const [loadingDeferred, setLoadingDeferred] = useState(false);

  // ── Fetch existing deferrals ──────────────────────────────────────────────
  const fetchDeferred = useCallback(async () => {
    if (!studentId) return;
    setLoadingDeferred(true);
    try {
      const data = await getDeferredUnits(studentId);
      setDeferredUnits(data);
    } catch {
      // non-fatal — table shows empty
    } finally {
      setLoadingDeferred(false);
    }
  },[studentId]);

  useEffect(() => {
    if (isOpen) { fetchDeferred(); setActiveTab("defer"); }
  }, [fetchDeferred, isOpen, studentId]);

  if (!isOpen) return null;

  // ── Derived state ─────────────────────────────────────────────────────────
  const alreadyDeferredIds = new Set(deferredUnits.map(u => u.programUnitId));

  const availableToDefer = [
    ...failedList.map(u => ({ id: u.programUnitId || "", displayName: u.displayName, type: "SUPP" as const, grounds: ""})),
    ...specialList.map(u => ({ id: u.programUnitId || "", displayName: u.displayName, type: "SPECIAL" as const, grounds: u.grounds })),
  ].filter(u => u.id && !alreadyDeferredIds.has(u.id));

  const toggleUnit = (id: string) => {
    if (!id) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(availableToDefer.map(u => u.id).filter(Boolean)));
  const clearAll  = () => setSelectedIds(new Set());

  // ── Defer selected units ──────────────────────────────────────────────────
  const handleDefer = async () => {
    if (selectedIds.size === 0) { addToast("Select at least one unit", "error"); return; }
    setIsSaving(true);
    try {
      await deferSuppUnits({
        studentId,
        programUnitIds: [...selectedIds],
        academicYear,
        reason: deferReason,
      });
      addToast(`${selectedIds.size} unit(s) deferred to next ordinary period`, "success");
      setSelectedIds(new Set());
      await fetchDeferred();
      setActiveTab("deferred");
      onSuccess(); // ← tells AcademicStatusBox to re-fetch the student record
    } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
        const message = err instanceof Error ? err.message : axiosErr?.response?.data?.error ?? "Failed to defer units";
        addToast(`${axiosErr?.response?.status ?? ""} — ${message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Undo a deferral ───────────────────────────────────────────────────────
  // This removes the deferredSuppUnits entry for this unit.
  // After the call succeeds and onSuccess() fires, the parent re-fetches the
  // student record. calculateStudentStatus will see the unit as
  // failed/special again → status reverts to SUPP/SPEC → promotion blocked.
  //
  // WHY HERE (DeferSuppModal) AND NOT AcademicStatusBox:
  //   The confirm prompt, loading spinner, and deferred-list refresh are all
  //   local to this modal. Putting the undo in AcademicStatusBox would require
  //   prop-drilling the unit list and loading state down one more level,
  //   and the user already has to open the modal to see which units are
  //   deferred — so the undo living here is discoverable and co-located.
  const handleUndo = async (programUnitId: string, unitCode: string) => {
    if (!confirm(`Cancel deferral for ${unitCode}? The unit will return to pending status and block promotion.`))
      return;

    setUndoingId(programUnitId);
    try {
      await undoDeferral(studentId, programUnitId);
      addToast(`Deferral for ${unitCode} cancelled`, "success");
      await fetchDeferred();   // refresh the Deferred tab
      onSuccess();             // re-fetch student → AcademicStatusBox updates
    } catch {
      addToast("Failed to cancel deferral", "error");
    } finally {
      setUndoingId(null);
    }
  };

  const nextYearLabel = (() => {
    if (!academicYear?.includes("/")) return "next year";
    const [start] = academicYear.split("/").map(Number);
    return `${start + 1}/${start + 2}`;
  })();

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: "defer",      label: "Defer Units",  count: availableToDefer.length },
    { key: "deferred",   label: "Deferred",     count: deferredUnits.filter(u => u.status === "pending").length },
    { key: "scoresheet", label: "Scoresheet View" },
  ];

  return (
    <div className="fixed inset-0 bg-green-darkest/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="bg-green-darkest px-6 py-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
            <CalendarClock size={120} className="text-yellow-gold" />
          </div>
          <div className="relative z-10">
            <p className="text-yellow-gold/60 text-[8px] font-black uppercase tracking-[0.4em] mb-0.5">
              ENG.13b / ENG.18c
            </p>
            <h2 className="text-white font-black text-sm uppercase tracking-tight">
              Defer to Next Ordinary
            </h2>
            <p className="text-white/40 text-[9px] font-mono mt-0.5">
              {studentRegNo} — {studentName.split(" ")[0].toUpperCase()}
              <span className="ml-2 text-yellow-gold/60">Year {currentYear} · {academicYear}</span>
            </p>
          </div>
          <button onClick={onClose} className="relative z-10 text-white/40 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.key ? "text-green-darkest bg-white border-b-2 border-green-darkest" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[7px] font-black ${activeTab === tab.key ? "bg-green-darkest text-yellow-gold" : "bg-slate-200 text-slate-500"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── TAB: DEFER ─────────────────────────────────────────────── */}
          {activeTab === "defer" && (
            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-700 leading-relaxed">
                  Under <strong>ENG.13b</strong> and <strong>ENG.18c</strong>, supplementary and
                  special exams may be sat during the next ordinary period. Approving this deferral
                  allows promotion to Year {currentYear + 1} while the unit(s) are examined in{" "}
                  {nextYearLabel}.
                </p>
              </div>

              {/* Deferral type selector */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Deferral Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["supp_deferred", "special_deferred"] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setDeferReason(r)}
                      className={`px-3 py-2.5 rounded-xl text-left border transition-all ${
                        deferReason === r ? "bg-green-darkest text-yellow-gold border-green-darkest" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-[9px] font-black uppercase tracking-wider">
                        {r === "supp_deferred" ? "⚡ Supplementary" : "🔵 Special Exam"}
                      </p>
                      <p className={`text-[8px] mt-0.5 ${deferReason === r ? "text-yellow-gold/60" : "text-slate-400"}`}>
                        {r === "supp_deferred" ? "Failed unit → sit at next ordinary" : "Special approved → deferred to next ordinary"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit list */}
              {availableToDefer.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-xl">
                  <CheckCircle2 size={24} className="text-teal-400 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All units already deferred</p>
                  <button onClick={() => setActiveTab("deferred")} className="mt-2 text-[9px] text-green-700 font-black uppercase underline tracking-wider">
                    View deferred units →
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Select Units ({selectedIds.size}/{availableToDefer.length})
                    </p>
                    <div className="flex gap-3">
                      <button onClick={selectAll} className="text-[8px] font-black text-green-700 uppercase hover:underline">All</button>
                      <button onClick={clearAll} className="text-[8px] font-black text-slate-400 uppercase hover:underline">None</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {availableToDefer.map((unit, i) => {
                      const isSelected = selectedIds.has(unit.id);
                      return (
                        <button
                          key={i}
                          onClick={() => toggleUnit(unit.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${isSelected ? "bg-green-darkest/5 border-green-darkest/30" : "bg-white border-slate-200 hover:border-slate-300"}`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-green-darkest border-green-darkest" : "border-slate-300"}`}>
                            {isSelected && <CheckCircle2 size={10} className="text-yellow-gold" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-800 truncate">{unit.displayName}</p>
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-0.5 inline-block ${unit.type === "SPECIAL" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                              {unit.type}
                            </span>
                          </div>
                          <ChevronRight size={12} className={isSelected ? "text-green-700" : "text-slate-300"} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: DEFERRED ─────────────────────────────────────────── */}
          {activeTab === "deferred" && (
            <div className="p-5 space-y-3">
              {loadingDeferred ? (
                <div className="py-10 flex items-center justify-center gap-2 text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-[10px] font-mono">Loading deferred units...</span>
                </div>
              ) : deferredUnits.filter(u => u.status === "pending").length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No pending deferrals</p>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-teal-800 uppercase tracking-wider mb-0.5">Promotion Eligible</p>
                      <p className="text-[9px] text-teal-700 leading-relaxed">
                        All pending units are deferred. This student may now be promoted to Year {currentYear + 1}.
                        They will appear on Year {currentYear} scoresheets in {nextYearLabel} for these units.
                      </p>
                    </div>
                  </div>

                  {deferredUnits.filter(u => u.status === "pending").map((unit, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Clock size={14} className="text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-800">{unit.unitCode} — {unit.unitName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${unit.reason === "special_deferred" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                            {unit.reason === "special_deferred" ? "SPECIAL" : "SUPP"}
                          </span>
                          <span className="text-[8px] text-slate-400 font-mono">From Year {unit.fromYear} · {unit.fromAcademicYear}</span>
                          <span className="text-[8px] text-amber-600 font-black uppercase px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">PENDING</span>
                        </div>
                        <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                            Will appear on: {nextYearLabel} Year {currentYear} Scoresheet
                          </p>
                          <div className="flex items-center gap-2 text-[8px] font-mono text-slate-600">
                            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">{studentRegNo}</span>
                            <ArrowRight size={8} className="text-slate-300" />
                            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">{unit.unitCode}</span>
                            <ArrowRight size={8} className="text-slate-300" />
                            <span className={`px-1.5 py-0.5 rounded font-black ${unit.reason === "special_deferred" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                              {unit.reason === "special_deferred" ? "Special" : "Supp"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* UNDO BUTTON — the primary access point for undoing a deferral */}
                      <button
                        onClick={() => handleUndo(unit.programUnitId, unit.unitCode)}
                        disabled={undoingId === unit.programUnitId}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-[8px] font-black
                                   uppercase text-red-500 border border-red-200 bg-red-50 rounded-lg
                                   hover:bg-red-100 transition-all disabled:opacity-50"
                        title="Cancel this deferral — unit returns to SUPP/SPEC status and blocks promotion"
                      >
                        {undoingId === unit.programUnitId ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                        Undo
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── TAB: SCORESHEET VIEW ──────────────────────────────────── */}
          {activeTab === "scoresheet" && (
            <div className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <Info size={13} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-blue-700 leading-relaxed">
                  This preview shows how this student will appear on scoresheets for deferred units
                  in <strong>{nextYearLabel}</strong>. They will be in Year {currentYear + 1} classes
                  but sit Year {currentYear} units.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-800 text-white px-4 py-2.5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/50">
                    Preview — {nextYearLabel} Ordinary Examination Scoresheet
                  </p>
                  <p className="text-[10px] font-bold mt-0.5">Year {currentYear} Units · {nextYearLabel} Academic Year</p>
                </div>

                <div className="grid grid-cols-12 gap-0 text-[8px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                  {["#","Reg. No","Name","Attempt","CA /30","Exam /70"].map((h, i) => (
                    <div key={i} className={`px-3 py-2 border-r border-slate-200 ${i === 0 ? "col-span-1" : i <= 2 ? "col-span-4" : i === 3 ? "col-span-2" : "col-span-1"}`}>{h}</div>
                  ))}
                </div>

                {deferredUnits.filter(u => u.status === "pending").length === 0 ? (
                  <div className="px-4 py-6 text-center text-[10px] text-slate-400 font-mono">
                    No pending deferred units — defer units first
                  </div>
                ) : (
                  deferredUnits.filter(u => u.status === "pending").map((unit, i) => (
                    <div key={i}>
                      <div className="px-4 py-1.5 bg-green-darkest/5 border-b border-t border-slate-100">
                        <p className="text-[8px] font-black text-green-darkest uppercase tracking-wider">
                          {unit.unitCode} — {unit.unitName}
                        </p>
                      </div>
                      <div className="grid grid-cols-12 gap-0 items-center hover:bg-slate-50 border-b border-slate-100">
                        <div className="col-span-1 px-3 py-2.5 text-[9px] font-mono text-slate-400 border-r border-slate-100">{i + 1}</div>
                        <div className="col-span-4 px-3 py-2.5 border-r border-slate-100">
                          <p className="text-[9px] font-mono font-bold text-slate-700">{studentRegNo}</p>
                        </div>
                        <div className="col-span-3 px-3 py-2.5 border-r border-slate-100">
                          <p className="text-[9px] font-bold text-slate-700 truncate">{studentName.toUpperCase()}</p>
                        </div>
                        <div className="col-span-2 px-3 py-2.5 border-r border-slate-100">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded ${unit.reason === "special_deferred" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                            {unit.reason === "special_deferred" ? "Special" : "Supp"}
                          </span>
                        </div>
                        <div className="col-span-1 px-3 py-2.5 border-r border-slate-100 text-[9px] font-mono text-slate-400 italic">
                          {unit.reason === "special_deferred" ? "locked" : "—"}
                        </div>
                        <div className="col-span-1 px-3 py-2.5 text-[9px] font-mono text-slate-300">—</div>
                      </div>
                      <div className="px-4 py-1.5 bg-blue-50/50 border-b border-slate-100">
                        <p className="text-[8px] text-blue-600 font-mono">
                          {unit.reason === "special_deferred"
                            ? "ⓘ CA pre-populated from original special approval and locked. Exam cell editable."
                            : "ⓘ CA locked to 0 per ENG.13f. Max score 40%. Exam cell editable."}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Scoring Rules</p>
                <div className="flex items-start gap-2">
                  <span className="text-[8px] px-1.5 py-0.5 bg-purple-100 text-purple-700 font-black rounded">SUPP</span>
                  <p className="text-[8px] text-slate-500 leading-relaxed">CA = 0, exam max 40% (ENG.13f). Student retaking failed unit.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[8px] px-1.5 py-0.5 bg-blue-100 text-blue-700 font-black rounded">SPECIAL</span>
                  <p className="text-[8px] text-slate-500 leading-relaxed">CA pre-populated from original sitting, locked. Exam out of 70%. Full 100% score (ENG.18c).</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex gap-3 items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 rounded-lg"
          >
            Close
          </button>

          {activeTab === "defer" && (
            <button
              onClick={handleDefer}
              disabled={isSaving || selectedIds.size === 0 || availableToDefer.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-darkest text-yellow-gold
                         rounded-lg text-[9px] font-black uppercase tracking-widest
                         disabled:opacity-40 hover:bg-green-900 transition-all"
            >
              {isSaving ? (
                <><Loader2 size={13} className="animate-spin" /> Deferring...</>
              ) : (
                <><CalendarClock size={13} />Defer {selectedIds.size > 0 ? `${selectedIds.size} Unit${selectedIds.size > 1 ? "s" : ""}` : "Selected Units"}</>
              )}
            </button>
          )}

          {activeTab === "deferred" && deferredUnits.filter(u => u.status === "pending").length > 0 && (
            <button
              onClick={() => setActiveTab("scoresheet")}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white
                         rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
            >
              <BookOpen size={13} />Preview Scoresheet
            </button>
          )}

          {activeTab === "scoresheet" && (
            <p className="flex-1 text-[8px] text-slate-400 font-mono text-center">
              This student will appear on {nextYearLabel} Year {currentYear} scoresheets with &quot;Supp&quot; or &quot;Special&quot; attempt label.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}