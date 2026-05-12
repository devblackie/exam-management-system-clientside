// clientside/src/app/coordinator/institution-settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, GraduationCap, Save, Info,
  Building2, Plus, Trash2, ShieldCheck, Lock,
} from "lucide-react";
import {
  useInstitutionSettings,
  useSaveSettings,
  useUpdateDepartmentRegPatterns,
} from "@/hooks/queries/useInstitutionSettings";
import { getLogoPreviewUrl } from "@/api/institutionSettingsApi";
import type {
  GradeEntry, InstitutionRuleSet, 
  School, Department, RegNoPattern, WAAClassification,
} from "@/api/types";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_GRADING_SCALE: GradeEntry[] = [
  { min: 70, max: 100, grade: "A", label: "Excellent" },
  { min: 60, max: 69, grade: "B", label: "Good" },
  { min: 50, max: 59, grade: "C", label: "Satisfactory" },
  { min: 40, max: 49, grade: "D", label: "Pass" },
  { min: 0, max: 39, grade: "E", label: "Fail" },
];

const DEFAULT_RULE_SET: Partial<InstitutionRuleSet> = {
  passMark: 40, suppMarkCap: 40, maxCarryForwardUnits: 2,
  caWeight: 30, examWeight: 70, catMax: 20, assignmentMax: 10,
  practicalMax: 10, maxAttempts: 5, gradeAppealWindowDays: 28,
  maxDurationMultiplier: 2.0, supplementaryThreshold: 0.333,
  stayoutThreshold: 0.5, repeatYearMeanThreshold: 40,
  hasLab: true, hasPractical: true, hasWorkshop: false,
};

type Tab = "rules" | "grading" | "regno" | "identity";

export default function CoordinatorInstitutionSettingsPage() {
  const { addToast } = useToast();
  const { user } = useAuth(); // Get current user for scoping
  const { data: existing, isLoading } = useInstitutionSettings();
  const { mutateAsync: saveSettings, isPending: saving } = useSaveSettings();
  const { mutateAsync: updatePatterns, isPending: patternSaving } = useUpdateDepartmentRegPatterns();

  const [tab, setTab] = useState<Tab>("rules");
  const [ruleSet, setRuleSet] = useState<Partial<InstitutionRuleSet>>(DEFAULT_RULE_SET);
  const [gradingScale, setGradingScale] = useState<GradeEntry[]>(DEFAULT_GRADING_SCALE);
  const [waaClass, setWaaClass] = useState<WAAClassification[]>([]);

  // Reg number pattern editing — ONLY for coordinator's own department
  const [patterns, setPatterns] = useState<RegNoPattern[]>([]);

  const hasLogo = !!existing?.branding?.universityLogoPath;
  const meta = existing?.docMeta;
  const schools = existing?.schools ?? [];

  // Find coordinator's assigned school and department
  const coordinatorSchool = schools.find((s: School) => s.code === user?.schoolCode);
  const coordinatorDepartment = coordinatorSchool?.departments?.find(
    (d: Department) => d.code === user?.departmentCode
  );

  const isScopedCoordinator = user?.role === "coordinator" && !user?.institutionWide;

  // Load patterns when component mounts or when coordinator's department changes
  useEffect(() => {
    if (isScopedCoordinator && coordinatorDepartment) {
      setPatterns(coordinatorDepartment.regNoPatterns ?? []);
    }
  }, [isScopedCoordinator, coordinatorDepartment]);

  // Populate state from server
  useEffect(() => {
    if (!existing) return;
    if (existing.ruleSet) setRuleSet({ ...DEFAULT_RULE_SET, ...existing.ruleSet });
    if ((existing.gradingScale?.length ?? 0) > 0) {
      setGradingScale(existing.gradingScale.map(g => ({
        min: g.min ?? 0, max: g.max ?? 0,
        grade: g.grade ?? "E", label: g.label ?? "Fail",
      })));
    }
    if ((existing.waaClassification?.length ?? 0) > 0) {
      setWaaClass(existing.waaClassification);
    } else {
      setWaaClass([
        { min: 70, max: 100, classification: "First Class Honours" },
        { min: 60, max: 69, classification: "Second Class Honours (Upper Division)" },
        { min: 50, max: 59, classification: "Second Class Honours (Lower Division)" },
        { min: 40, max: 49, classification: "Pass" },
        { min: 0, max: 39, classification: "Fail" },
      ]);
    }
  }, [existing]);

  if (isLoading) return <LoadingState message="Loading settings..." />;

  const updateRuleSet = (k: keyof InstitutionRuleSet, v: number | boolean) =>
    setRuleSet(p => ({ ...p, [k]: v }));

  const updateGradeEntry = (i: number, field: keyof GradeEntry, v: string | number) => {
    const next = [...gradingScale];
    if (field === "grade") {
      const valid = ["A", "B", "C", "D", "E"];
      const g = (v as string).toUpperCase();
      if (!valid.includes(g)) return;
      next[i] = { ...next[i], grade: g as GradeEntry["grade"] };
    } else if (field === "label") {
      next[i] = { ...next[i], label: v as string };
    } else {
      next[i] = { ...next[i], [field]: Number(v) };
    }
    setGradingScale(next);
  };

  const updateWaaEntry = (i: number, field: keyof WAAClassification, v: string | number) => {
    const next = [...waaClass];
    if (field === "classification") next[i] = { ...next[i], classification: v as string };
    else next[i] = { ...next[i], [field]: Number(v) };
    setWaaClass(next);
  };

  const handleSaveRules = async () => {
    const ca = ruleSet.caWeight ?? 30;
    const ex = ruleSet.examWeight ?? 70;
    if (Math.abs(ca + ex - 100) > 0.01) {
      addToast(`CA (${ca}%) + Exam (${ex}%) must equal 100%`, "error");
      return;
    }
    try {
      await saveSettings({ ruleSet, gradingScale, waaClassification: waaClass });
      addToast("Academic rules and grading saved", "success");
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    }
  };

  const handleSavePatterns = async () => {
    if (!user?.schoolCode || !user?.departmentCode) {
      addToast("Your account is not assigned to a specific department", "error");
      return;
    }
    try {
      await updatePatterns({
        schoolCode: user.schoolCode,
        deptCode: user.departmentCode,
        regNoPatterns: patterns,
      });
      addToast("Registration number patterns saved", "success");
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    }
  };

  const addPattern = () => setPatterns(p => [...p, {
    prefix: "", separator: "-", yearDigits: 3, example: "",
  }]);

  const removePattern = (i: number) =>
    setPatterns(p => p.filter((_, idx) => idx !== i));

  const updatePattern = (i: number, field: keyof RegNoPattern, v: string | number) => {
    const next = [...patterns];
    next[i] = { ...next[i], [field]: field === "yearDigits" ? Number(v) : v };
    setPatterns(next);
  };

  const inputCls = "w-full bg-slate-100 rounded-lg px-3 py-2 text-sm text-green-darkest font-semibold outline-none";
  const labelCls = "text-[10px] font-bold uppercase tracking-tighter text-slate-400 mb-1.5 block";

  const tabs: { id: Tab; label: string }[] = [
    { id: "rules", label: "Academic Rules" },
    { id: "grading", label: "Grading & Classification" },
    { id: "regno", label: "Reg Number Patterns" },
    { id: "identity", label: "Identity (View)" },
  ];

  return (
    <div className="max-w-8xl lg:ml-48 my-14">
      <div className="bg-[#F8F9FA] rounded-lg shadow-2xl p-10 min-h-screen">
        <PageHeader
          title="Institution" highlightedTitle="Settings"
          subtitle="Configure academic rules, grading, and registration number formats"
          actions={
            tab !== "identity" && tab !== "regno" ? (
              <button onClick={handleSaveRules} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50">
                {saving ? "Saving..." : <><Save size={16} /> Save Rules & Grading</>}
              </button>
            ) : tab === "regno" ? (
              <button onClick={handleSavePatterns} disabled={patternSaving || !coordinatorDepartment}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50">
                {patternSaving ? "Saving..." : <><Save size={16} /> Save Patterns</>}
              </button>
            ) : null
          }
        />

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-slate-200/50 rounded-lg p-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-md transition-all ${tab === t.id
                ? "bg-white text-green-darkest shadow-sm"
                : "text-slate-500 hover:text-slate-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Academic Rules ─────────────────────────────────────────── */}
        {tab === "rules" && (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 text-green-600 rounded-xl"><BarChart3 size={16} /></div>
              <h2 className="text-sm font-bold text-green-darkest">Academic Rules</h2>
              <span className="ml-auto text-[9px] text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                Coordinator editable
              </span>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <Num label="Pass Mark (%)" value={ruleSet.passMark ?? 40}
                help="ENG.10 — minimum to pass a unit"
                onChange={v => updateRuleSet("passMark", v)} />
              <Num label="Supp Mark Cap (%)" value={ruleSet.suppMarkCap ?? 40}
                help="ENG.13(f) — supplementary mark capped at this"
                onChange={v => updateRuleSet("suppMarkCap", v)} />
              <Num label="Max Carry-forward Units" value={ruleSet.maxCarryForwardUnits ?? 2}
                help="ENG.14 — units carried to next year"
                onChange={v => updateRuleSet("maxCarryForwardUnits", v)} />
              <Num label="CA Weight (%)" value={ruleSet.caWeight ?? 30}
                help="ENG.10(b) — continuous assessment"
                onChange={v => updateRuleSet("caWeight", v)} />
              <Num label="Exam Weight (%)" value={ruleSet.examWeight ?? 70}
                help="ENG.10(b) — final examination"
                onChange={v => updateRuleSet("examWeight", v)} />
              <Num label="CAT Max (per CAT)" value={ruleSet.catMax ?? 20}
                onChange={v => updateRuleSet("catMax", v)} />
              <Num label="Assignment Max" value={ruleSet.assignmentMax ?? 10}
                onChange={v => updateRuleSet("assignmentMax", v)} />
              <Num label="Practical Max" value={ruleSet.practicalMax ?? 10}
                onChange={v => updateRuleSet("practicalMax", v)} />
              <Num label="Max Attempts" value={ruleSet.maxAttempts ?? 5}
                help="ENG.22 — before discontinuation"
                onChange={v => updateRuleSet("maxAttempts", v)} />
              <Num label="Duration Multiplier" value={ruleSet.maxDurationMultiplier ?? 2.0}
                step={0.5} help="max years = program.durationYears × this"
                onChange={v => updateRuleSet("maxDurationMultiplier", v)} />
              <Num label="Supp Threshold (fraction)" value={ruleSet.supplementaryThreshold ?? 0.333}
                step={0.001} help="ENG.13(a) — fail ≤ this fraction → supp eligible"
                onChange={v => updateRuleSet("supplementaryThreshold", v)} />
              <Num label="Stayout Threshold (fraction)" value={ruleSet.stayoutThreshold ?? 0.5}
                step={0.001} help="ENG.15(h) — fail > supp threshold but < this → stayout"
                onChange={v => updateRuleSet("stayoutThreshold", v)} />
              <Num label="Repeat Mean Threshold (%)" value={ruleSet.repeatYearMeanThreshold ?? 40}
                help="ENG.16(b) — annual mean below this → repeat year"
                onChange={v => updateRuleSet("repeatYearMeanThreshold", v)} />
              <Num label="Appeal Window (days)" value={ruleSet.gradeAppealWindowDays ?? 28}
                help="ENG.26 — days to appeal a grade"
                onChange={v => updateRuleSet("gradeAppealWindowDays", v)} />
            </div>

            {Math.abs((ruleSet.caWeight ?? 30) + (ruleSet.examWeight ?? 70) - 100) > 0.01 && (
              <div className="flex items-center gap-2 mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Info size={14} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700">
                  CA weight + Exam weight must total 100%
                  (currently {(ruleSet.caWeight ?? 30) + (ruleSet.examWeight ?? 70)}%)
                </p>
              </div>
            )}

            <div className="flex gap-6 mt-5 pt-5 border-t border-slate-100">
              <Toggle label="Has Lab component" checked={ruleSet.hasLab ?? true}
                onChange={v => updateRuleSet("hasLab", v)} />
              <Toggle label="Has Practical component" checked={ruleSet.hasPractical ?? true}
                onChange={v => updateRuleSet("hasPractical", v)} />
              <Toggle label="Has Workshop component" checked={ruleSet.hasWorkshop ?? false}
                onChange={v => updateRuleSet("hasWorkshop", v)} />
            </div>
          </div>
        )}

        {/* ── Tab: Grading & Classification ──────────────────────────────── */}
        {tab === "grading" && (
          <div className="grid grid-cols-12 gap-8">
            {/* Per-unit grading scale */}
            <div className="col-span-12 lg:col-span-5">
              <div className="bg-green-darkest rounded-lg p-7 shadow-2xl text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/10 text-emerald-400 rounded-xl">
                    <GraduationCap size={18} />
                  </div>
                  <h2 className="text-base font-bold">Unit Grading Scale</h2>
                </div>
                <p className="text-[10px] text-white/40 mb-5 uppercase tracking-wider">
                  A / B / C / D / E — per unit marks
                </p>

                <div className="space-y-3">
                  {gradingScale.map((row, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                      <select value={row.grade}
                        onChange={e => updateGradeEntry(i, "grade", e.target.value)}
                        className="w-12 bg-transparent text-emerald-400 font-black text-sm outline-none border border-white/20 rounded px-1 py-0.5">
                        {(["A", "B", "C", "D", "E"] as const).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <div className="flex-1">
                        <div className="flex gap-1.5 items-center">
                          <input type="number" value={row.min}
                            onChange={e => updateGradeEntry(i, "min", +e.target.value)}
                            className="w-12 bg-transparent text-white font-bold text-sm outline-none border-b border-white/20 text-center" />
                          <span className="text-white/30 text-xs">–</span>
                          <input type="number" value={row.max}
                            onChange={e => updateGradeEntry(i, "max", +e.target.value)}
                            className="w-12 bg-transparent text-white font-bold text-sm outline-none border-b border-white/20 text-center" />
                          <span className="text-white/30 text-xs">%</span>
                        </div>
                        <input type="text" value={row.label}
                          onChange={e => updateGradeEntry(i, "label", e.target.value)}
                          placeholder="Description"
                          className="mt-1 w-full bg-transparent text-white/50 text-[10px] outline-none placeholder:text-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WAA / degree classification */}
            <div className="col-span-12 lg:col-span-7">
              <div className="bg-white rounded-lg p-7 shadow-sm border border-slate-100 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                    <ShieldCheck size={16} />
                  </div>
                  <h2 className="text-sm font-bold text-green-darkest">WAA Degree Classification</h2>
                </div>
                <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
                  Maps the Weighted Annual Average (WAA%) to the degree class awarded.
                  Applied at graduation per ENG.25.
                </p>

                <div className="space-y-3">
                  {waaClass.map((row, i) => (
                    <div key={i} className="grid grid-cols-7 gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="col-span-1">
                        <label className={labelCls}>Min %</label>
                        <input type="number" value={row.min}
                          onChange={e => updateWaaEntry(i, "min", +e.target.value)}
                          className={inputCls} />
                      </div>
                      <div className="col-span-1">
                        <label className={labelCls}>Max %</label>
                        <input type="number" value={row.max}
                          onChange={e => updateWaaEntry(i, "max", +e.target.value)}
                          className={inputCls} />
                      </div>
                      <div className="col-span-4">
                        <label className={labelCls}>Classification</label>
                        <input type="text" value={row.classification}
                          onChange={e => updateWaaEntry(i, "classification", e.target.value)}
                          className={inputCls}
                          placeholder="First Class Honours" />
                      </div>
                      <div className="col-span-1 flex items-end pb-1">
                        <button onClick={() => setWaaClass(p => p.filter((_, idx) => idx !== i))}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setWaaClass(p => [...p, { min: 0, max: 0, classification: "" }])}
                  className="mt-4 flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-green-darkest bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Plus size={12} /> Add Classification Band
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Reg Number Patterns ──────────────────────────────────── */}
        {tab === "regno" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">
                  Registration Number Format
                </p>
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Set the expected format for student registration numbers in your department.
                  When enabled, the system validates new student registrations against these patterns.
                  Example: DeKUT Civil Engineering uses <code className="bg-blue-100 px-1 rounded">E024-0001</code>
                  (prefix=&quot;E&quot;, separator=&quot;-&quot;, year digits=3).
                </p>
              </div>
            </div>

            {/* Coordinator's assigned department - PRE-FILLED AND LOCKED */}
            {isScopedCoordinator ? (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Lock size={16} className="text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-darkest">Your Assigned Department</p>
                    <p className="text-sm text-slate-600">
                      {coordinatorSchool?.name} / {coordinatorDepartment?.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      You can only configure registration number patterns for your own department.
                    </p>
                  </div>
                </div>

                {/* Pattern editor */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-green-darkest">
                      Patterns for {coordinatorDepartment?.name}
                    </h3>
                    <button onClick={addPattern}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-darkest text-yellow-gold rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-colors">
                      <Plus size={12} /> Add Pattern
                    </button>
                  </div>

                  {patterns.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      No patterns configured. Click &quot;Add Pattern&quot; to add one.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {patterns.map((p, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="col-span-2">
                            <label className={labelCls}>Prefix *</label>
                            <input className={inputCls} value={p.prefix}
                              onChange={e => updatePattern(i, "prefix", e.target.value)}
                              placeholder="E" maxLength={10} />
                            <p className="text-[9px] text-slate-400 mt-1">e.g. E, SMS, F</p>
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>Separator</label>
                            <input className={inputCls} value={p.separator}
                              onChange={e => updatePattern(i, "separator", e.target.value)}
                              placeholder="-" maxLength={2} />
                            <p className="text-[9px] text-slate-400 mt-1">-, /, or empty</p>
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>Year Digits</label>
                            <select className={inputCls}
                              value={p.yearDigits}
                              onChange={e => updatePattern(i, "yearDigits", e.target.value)}>
                              <option value={2}>2 (e.g. 24)</option>
                              <option value={3}>3 (e.g. 024)</option>
                            </select>
                          </div>
                          <div className="col-span-3">
                            <label className={labelCls}>Example *</label>
                            <input className={inputCls} value={p.example}
                              onChange={e => updatePattern(i, "example", e.target.value)}
                              placeholder="E024-0001" />
                            <p className="text-[9px] text-slate-400 mt-1">shown in error messages</p>
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>Manual Regex</label>
                            <input className={inputCls} value={p.manualRegex ?? ""}
                              onChange={e => updatePattern(i, "manualRegex", e.target.value)}
                              placeholder="^E\\d{3}-\\d+$" />
                            <p className="text-[9px] text-slate-400 mt-1">overrides prefix fields</p>
                          </div>
                          <div className="col-span-1 flex items-end pb-1">
                            <button onClick={() => removePattern(i)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {patterns.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 mb-1">Preview patterns:</p>
                      {patterns.map((p, i) => (
                        p.example ? (
                          <p key={i} className="text-[11px] text-slate-700 font-mono">
                            Pattern {i + 1}: <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded">{p.example}</span>
                            {p.manualRegex && <span className="ml-2 text-blue-600">(custom regex: {p.manualRegex})</span>}
                          </p>
                        ) : null
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
                <div className="text-center py-8">
                  <Lock size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">
                    You have institution-wide access. Registration number patterns can only be configured
                    by coordinators assigned to specific departments.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Identity (Read-only for coordinator) ─────────────────── */}
        {tab === "identity" && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700">
                University identity (name, logo, schools, departments) is managed by the admin.
                To request changes, contact your system administrator.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={15} /></div>
                <h2 className="text-sm font-bold text-green-darkest">University Identity</h2>
                <span className="ml-auto text-[9px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                  Read only
                </span>
              </div>

              {hasLogo && (
                <div className="relative w-20 h-20 border border-slate-200 rounded-lg overflow-hidden mb-5">
                  <Image src={getLogoPreviewUrl()} alt="University logo"
                    fill className="object-contain" unoptimized />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {[
                  ["University Name", meta?.universityName],
                  ["Abbreviation", meta?.universityAbbr],
                  ["School", meta?.schoolName],
                  ["Department", meta?.departmentName],
                  ["Registrar", meta?.registrar],
                  ["Email", meta?.email],
                  ["Telephone", meta?.telephone],
                  ["Postal Address", meta?.postalAddress],
                ].map(([label, value]) => (
                  <div key={label} className={label === "University Name" || label === "Postal Address" ? "col-span-2" : ""}>
                    <label className={labelCls}>{label}</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-green-darkest font-semibold">
                      {value || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schools (read-only) */}
            {schools.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
                <h2 className="text-sm font-bold text-green-darkest mb-4">Schools & Departments</h2>
                <div className="space-y-3">
                  {schools.map((school: School) => (
                    <div key={school.code} className="border border-slate-100 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                        <span className="font-bold text-green-darkest text-sm">{school.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border">
                          {school.code}
                        </span>
                      </div>
                      {(school.departments ?? []).map((dept: Department) => (
                        <div key={dept.code} className="flex items-center gap-2 px-4 py-2 border-t border-slate-50">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-darkest/20" />
                          <span className="text-sm text-slate-700">{dept.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                            {dept.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Num({
  label, value, onChange, step = 1, help,
}: {
  label: string; value: number;
  onChange: (v: number) => void; step?: number; help?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 mb-1 block">
        {label}
      </label>
      <input type="number" value={value} step={step}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(parseFloat(e.target.value) || 0)
        }
        className="w-full bg-slate-100 rounded-lg px-3 py-2 text-green-darkest font-bold text-sm outline-none" />
      {help && <p className="text-[9px] text-slate-400 mt-1">{help}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        className="rounded border-slate-300" />
      <span className="text-xs text-slate-600">{label}</span>
    </label>
  );
}



























