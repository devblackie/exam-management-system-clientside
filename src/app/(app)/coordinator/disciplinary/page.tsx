// clientside/src/app/coordinator/disciplinary/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { searchStudents } from "@/api/studentsApi";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { listDisciplinaryCases, raiseCase, recordOutcome, reinstateStudent, recordAppeal, 
  GROUNDS_LABELS, OUTCOME_LABELS,
  type DisciplinaryCase, type DisciplinaryGrounds, type DisciplinaryOutcome, type RecordOutcomePayload, type ListCasesParams,
} from "@/api/disciplinaryApi";
import {
  AlertTriangle, ShieldAlert, Search, Plus, CheckCircle2, Clock, XCircle, AlertCircle,
  Gavel,  RefreshCcw, ChevronLeft, ChevronRight, Loader2, User, ChevronDown, Scale,
} from "lucide-react";

// ── Outcome pill ───────────────────────────────────────────────────────────────
function OutcomePill({ outcome }: { outcome: DisciplinaryOutcome }) {
  const styles: Record<
    DisciplinaryOutcome,
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    PENDING: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      icon: <Clock size={10} />,
    },
    SENT_HOME: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: <AlertCircle size={10} />,
    },
    WARNING: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: <AlertTriangle size={10} />,
    },
    REINSTATED: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      icon: <CheckCircle2 size={10} />,
    },
    DISCONTINUED: {
      bg: "bg-slate-800",
      text: "text-slate-100",
      icon: <XCircle size={10} />,
    },
    DISMISSED: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      icon: <CheckCircle2 size={10} />,
    },
  };
  const s = styles[outcome] ?? styles.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}
    >
      {s.icon}
      {OUTCOME_LABELS[outcome] ?? outcome}
    </span>
  );
}

// ── Shared input class ─────────────────────────────────────────────────────────
const inputCls = [
  "w-full bg-white border border-green-darkest/10 rounded-lg",
  "py-2.5 px-4 text-xs font-mono text-green-darkest",
  "placeholder:text-slate-300 outline-none",
  "focus:ring-2 focus:ring-yellow-gold/20 focus:border-yellow-gold/50 transition-all",
].join(" ");

const labelCls =
  "text-[10px] font-black uppercase tracking-[0.25em] text-green-darkest/50 block mb-1.5";

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children}: {
  title: string; subtitle: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-green-darkest/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-green-darkest rounded-t-2xl px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-yellow-gold text-[9px] font-black uppercase tracking-[0.3em] mb-1">
              {subtitle}
            </p>
            <h3 className="text-white text-sm font-black uppercase tracking-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="p-8 space-y-5">{children}</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DisciplinaryPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // ── List state ────────────────────────────────────────────────────────────
  const [cases, setCases] = useState<DisciplinaryCase[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<DisciplinaryOutcome | "">("");

  // ── Modal state ───────────────────────────────────────────────────────────
  const [showRaise, setShowRaise] = useState(false);
  const [activeOutcome, setActiveOutcome] = useState<DisciplinaryCase | null>(null);
  const [activeAppeal, setActiveAppeal] = useState<DisciplinaryCase | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Raise form fields ─────────────────────────────────────────────────────
  const [regNo, setRegNo] = useState("");
  const [grounds, setGrounds] = useState<DisciplinaryGrounds>("misconduct");
  const [description, setDescription] = useState("");
  const [hearingDate, setHearingDate] = useState("");

  // ── Outcome form fields ───────────────────────────────────────────────────
  const [ocOutcome, setOcOutcome] = useState<DisciplinaryOutcome>("WARNING");
  const [ocNotes, setOcNotes] = useState("");
  const [ocHearingDate, setOcHearingDate] = useState("");
  const [ocSuspStart, setOcSuspStart] = useState("");
  const [ocSuspEnd, setOcSuspEnd] = useState("");

  // ── Appeal form fields ────────────────────────────────────────────────────
  const [apOutcome, setApOutcome] = useState<"UPHELD" | "DISMISSED">("DISMISSED");
  const [apNotes, setApNotes] = useState("");

  const PAGE_SIZE = 15;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // listDisciplinaryCases is imported from disciplinaryApi.ts.
  // It returns DisciplinaryCaseListResponse — fully typed.
  // No `any` needed. If the shape changes, TypeScript tells you at compile time.
  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params: ListCasesParams = { page, limit: PAGE_SIZE };
      if (outcomeFilter) params.outcome = outcomeFilter;
      const data = await listDisciplinaryCases(params);
      setCases(data.cases);
      setTotal(data.total);
    } catch {
      addToast("Failed to load disciplinary cases.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, outcomeFilter, addToast]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = {
    pending: cases.filter((c) => c.outcome === "PENDING").length,
    suspended: cases.filter((c) => c.outcome === "SENT_HOME").length,
    resolved: cases.filter((c) => ["DISMISSED", "WARNING", "REINSTATED", "DISCONTINUED"].includes(c.outcome)).length,
  };

  // ── Raise case ────────────────────────────────────────────────────────────
  const handleRaise = async () => {
    if (!regNo.trim())
      return addToast("Enter the student registration number.", "error");
    if (description.trim().length < 10)
      return addToast("Description must be at least 10 characters.", "error");

    setSubmitting(true);
    try {
      // searchStudents already exists in studentsApi.ts — we reuse it.
      // No need for a new endpoint just to look up a student by regNo.
      const students = await searchStudents(regNo.trim());
      const student = students?.[0];
      if (!student) {
        addToast("No student found with that registration number.", "error");
        return;
      }

      // raiseCase is typed: accepts RaiseCasePayload, returns { message, caseId }
      // Compare to the old code: api.post("/disciplinary/raise", {...}) — no types
      const result = await raiseCase({
        studentId: student._id, grounds,
        description: description.trim(), hearingDate: hearingDate || undefined,
      });

      addToast(result.message, "success");
      setShowRaise(false);
      setRegNo("");
      setGrounds("misconduct");
      setDescription("");
      setHearingDate("");
      fetchCases();
    } catch (err: unknown) {
      // Typed error extraction — no `any` cast here either
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data ?.message ?? "Failed to file case.";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Record outcome ────────────────────────────────────────────────────────
  const handleOutcome = async () => {
    if (!activeOutcome) return;
    setSubmitting(true);
    try {
      const payload: RecordOutcomePayload = {
        outcome: ocOutcome,
        outcomeNotes: ocNotes || undefined,
        hearingDate: ocHearingDate || undefined,
        suspensionStart: ocSuspStart || undefined,
        suspensionEnd: ocSuspEnd || undefined,
      };
      // recordOutcome is typed → { message: string; studentStatus: string }
      const result = await recordOutcome(activeOutcome._id, payload);
      addToast(result.message, "success");
      setActiveOutcome(null);
      fetchCases();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to record outcome.";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reinstate ─────────────────────────────────────────────────────────────
  const handleReinstate = async (caseId: string, studentName: string) => {
    if (
      !window.confirm(
        `Reinstate ${studentName}? Their suspension will be lifted immediately.`,
      )
    )
      return;
    try {
      // reinstateStudent is typed → { message: string; restoredStatus: string }
      const result = await reinstateStudent(caseId, {
        notes: "Reinstated via admin dashboard.",
      });
      addToast(result.message, "success");
      fetchCases();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to reinstate student.";
      addToast(msg, "error");
    }
  };

  // ── Record appeal ─────────────────────────────────────────────────────────
  const handleAppeal = async () => {
    if (!activeAppeal) return;
    setSubmitting(true);
    try {
      // recordAppeal is typed → { message: string }
      const result = await recordAppeal(activeAppeal._id, {
        appealOutcome: apOutcome,
        appealNotes: apNotes || undefined,
      });
      addToast(result.message, "success");
      setActiveAppeal(null);
      fetchCases();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to record appeal.";
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Client-side filter (no extra network call) ────────────────────────────
  const filtered = cases.filter(
    (c) =>
      !search ||
      c.student.name.toLowerCase().includes(search.toLowerCase()) ||
      c.student.regNo.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <ProtectedRoute allowed={["coordinator", "admin"]}>
      <div className="max-w-8xl ml-40 my-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#F8F9FA] min-h-[100vh] rounded-xl shadow-2xl p-10 relative overflow-hidden">
          <Gavel
            size={400}
            className="absolute -right-20 -bottom-20 opacity-[0.02] text-green-darkest pointer-events-none"
          />

          <PageHeader
            title="Disciplinary"
            highlightedTitle="Registry"
            systemLabel="Conduct Management Portal"
          />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 mb-10">
            {(
              [
                {
                  label: "Total Cases",
                  val: total,
                  color: "text-green-darkest",
                },
                {
                  label: "Pending",
                  val: stats.pending,
                  color: "text-amber-600",
                },
                {
                  label: "Suspended",
                  val: stats.suspended,
                  color: "text-red-600",
                },
                {
                  label: "Resolved",
                  val: stats.resolved,
                  color: "text-emerald-600",
                },
              ] as const
            ).map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-green-darkest/5 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {s.label}
                </p>
                <p className={`text-3xl font-light ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="relative group max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-green-darkest transition-colors" />
              <input
                type="text"
                placeholder="Search by name or reg number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-slate-500 bg-white border border-green-darkest/10 rounded-lg py-2.5 pl-11 pr-4 text-xs font-mono outline-none "
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={outcomeFilter}
                  onChange={(e) => {
                    setOutcomeFilter(e.target.value as DisciplinaryOutcome | "");
                    setPage(1);
                  }}
                  className="appearance-none bg-white border border-green-darkest/10 rounded-lg py-2.5 pl-4 pr-8 text-xs font-mono text-green-darkest outline-none focus:ring-2 focus:ring-yellow-gold/20"
                >
                  <option value="">All Outcomes</option>
                  {(
                    Object.entries(OUTCOME_LABELS) as [DisciplinaryOutcome, string][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              <button
                onClick={() => setShowRaise(true)}
                className="flex items-center gap-2 bg-green-darkest hover:bg-green-800 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                <Plus size={14} className="text-yellow-gold" /> Raise Case
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-green-darkest/5 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-green-darkest/5 bg-slate-50/50">
                  {["Student", "Grounds", "Outcome", "Hearing Date", "Raised By", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-green-darkest/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2
                        size={20}
                        className="animate-spin text-slate-300 mx-auto"
                      />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-20 text-center text-xs font-mono text-slate-300 uppercase tracking-widest"
                    >
                      No cases found
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-slate-50/80 transition-colors group/row"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-green-darkest/5 flex items-center justify-center">
                            <User size={14} className="text-green-darkest/40" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-green-darkest">
                              {c.student.name}
                            </p>
                            <p className="text-[9px] font-mono text-slate-400">
                              {c.student.regNo} · Y
                              {c.student.currentYearOfStudy}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* GROUNDS_LABELS maps "exam_irregularity" → readable string */}
                      <td className="px-6 py-3 text-[10px] font-bold text-slate-600">
                        {GROUNDS_LABELS[c.grounds] ?? c.grounds}
                      </td>

                      <td className="px-6 py-3">
                        <OutcomePill outcome={c.outcome} />
                        {c.appealed && c.appealOutcome && (
                          <span className="ml-2 text-[8px] font-black text-indigo-600 uppercase tracking-wider">
                            Appeal {c.appealOutcome}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3 text-[10px] font-mono text-slate-400">
                        {c.hearingDate
                          ? new Date(c.hearingDate).toLocaleDateString(
                              "en-KE",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>

                      <td className="px-6 py-3 text-[10px] font-mono text-slate-500">
                        {c.raisedBy.name}
                      </td>

                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {isAdmin && c.outcome === "PENDING" && (
                            <button
                              onClick={() => {
                                setActiveOutcome(c);
                                setOcOutcome("WARNING");
                                setOcNotes("");
                                setOcHearingDate("");
                                setOcSuspStart("");
                                setOcSuspEnd(""); 
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-darkest text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-green-800 transition-all"
                            >
                              <Gavel size={11} className="text-yellow-gold" />{" "}
                              Outcome
                            </button>
                          )}
                          {isAdmin && c.outcome === "SENT_HOME" && (
                            <button
                              onClick={() =>
                                handleReinstate(c._id, c.student.name)
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-all"
                            >
                              <RefreshCcw size={11} /> Reinstate
                            </button>
                          )}
                          {isAdmin &&
                            ["SENT_HOME", "DISCONTINUED", "WARNING"].includes(c.outcome) && !c.appealed && (
                              <button
                                onClick={() => { setActiveAppeal(c); setApOutcome("DISMISSED"); setApNotes(""); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-indigo-700 transition-all"
                              >
                                <Scale size={11} /> Appeal
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-400 hover:text-green-darkest disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-slate-400 hover:text-green-darkest disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Raise Case Modal ─────────────────────────────────────────────────── */}
      {showRaise && (
        <Modal
          title="File Disciplinary Case"
          subtitle="Conduct Portal"
          onClose={() => setShowRaise(false)}
        >
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
              ⚠ Filing this case immediately suspends system access pending a
              hearing.
            </p>
          </div>
          <div>
            <label className={labelCls}>Student Registration Number</label>
            <input
              type="text"
              placeholder="E.g. E024-01-1234/2022"
              className={inputCls}
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Grounds</label>
            <select
              className={inputCls}
              value={grounds}
              onChange={(e) => setGrounds(e.target.value as DisciplinaryGrounds)}
            >
              {(
                Object.entries(GROUNDS_LABELS) as [DisciplinaryGrounds, string][]
              ).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>
              Incident Description (min. 10 characters)
            </label>
            <textarea
              rows={4}
              className={inputCls + " resize-none"}
              placeholder="Describe the incident in detail…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>
              Scheduled Hearing Date (optional)
            </label>
            <input
              type="date"
              className={inputCls}
              min="2000-01-01"
              value={hearingDate}
              onChange={(e) => setHearingDate(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowRaise(false)}
              className="flex-1 border border-green-darkest/10 text-green-darkest py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleRaise}
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldAlert size={14} />
              )}
              {submitting ? "Filing…" : "File Case & Suspend"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Outcome Modal ────────────────────────────────────────────────────── */}
      {activeOutcome && (
        <Modal
          title={`Outcome — ${activeOutcome.student.name}`}
          subtitle="Hearing Result"
          onClose={() => setActiveOutcome(null)}
        >
          <div>
            <label className={labelCls}>Outcome</label>
            <select
              className={inputCls}
              value={ocOutcome}
              onChange={(e) =>
                setOcOutcome(e.target.value as DisciplinaryOutcome)
              }
            >
              <option value="WARNING">
                Warning — student continues studies
              </option>
              <option value="SENT_HOME">
                Sent Home — suspension formalised (RP1D applied)
              </option>
              <option value="DISCONTINUED">Discontinued — per ENG.22</option>
              <option value="DISMISSED">
                Case Dismissed — no further action
              </option>
            </select>
          </div>
          {ocOutcome === "SENT_HOME" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Suspension Start</label>
                <input
                  type="date"
                  min="2000-01-01"
                  className={inputCls}
                  value={ocSuspStart}
                  onChange={(e) => setOcSuspStart(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Expected Return (optional)</label>
                <input
                  type="date"
                  min="2000-01-01"
                  className={inputCls}
                  value={ocSuspEnd}
                  onChange={(e) => setOcSuspEnd(e.target.value)}
                />
              </div>
            </div>
          )}
          <div>
            <label className={labelCls}>Hearing Date</label>
            <input
              type="date"
              min="2000-01-01"
              className={inputCls}
              value={ocHearingDate}
              onChange={(e) => setOcHearingDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Committee Notes</label>
            <textarea
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Record the committee's reasoning…"
              value={ocNotes}
              onChange={(e) => setOcNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setActiveOutcome(null)}
              className="flex-1 border border-green-darkest/10 text-green-darkest py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleOutcome}
              disabled={submitting}
              className="flex-1 bg-green-darkest hover:bg-green-800 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Gavel size={14} className="text-yellow-gold" />
              )}
              {submitting ? "Saving…" : "Record Outcome"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Appeal Modal ─────────────────────────────────────────────────────── */}
      {activeAppeal && (
        <Modal
          title={`Record Appeal — ${activeAppeal.student.name}`}
          subtitle="Appeal Registry"
          onClose={() => setActiveAppeal(null)}
        >
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              Original outcome: {OUTCOME_LABELS[activeAppeal.outcome]}
            </p>
          </div>
          <div>
            <label className={labelCls}>Appeal Outcome</label>
            <select
              className={inputCls}
              value={apOutcome}
              onChange={(e) =>
                setApOutcome(e.target.value as "UPHELD" | "DISMISSED")
              }
            >
              <option value="UPHELD">
                Upheld — student wins, automatically reinstated
              </option>
              <option value="DISMISSED">
                Dismissed — original outcome stands
              </option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Grounds for appeal decision…"
              value={apNotes}
              onChange={(e) => setApNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setActiveAppeal(null)}
              className="flex-1 border border-green-darkest/10 text-green-darkest py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAppeal}
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Scale size={14} />
              )}
              {submitting ? "Saving…" : "Record Appeal"}
            </button>
          </div>
        </Modal>
      )}
    </ProtectedRoute>
  );
}
