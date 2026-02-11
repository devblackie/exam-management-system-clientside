// clientside/src/app/coordinator/institution-settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Settings, ShieldCheck, BarChart3, GraduationCap, Save, Info, ArrowUpRight} from "lucide-react";
import { getInstitutionSettings, saveInstitutionSettings} from "@/api/institutionSettingsApi";
import type { InstitutionSettings } from "@/api/types";
import PageHeader from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";

export default function InstitutionSettingsPage() {
  const [settings, setSettings] = useState<InstitutionSettings>({
    cat1Max: 30, cat2Max: 40, cat3Max: 0,
    assignmentMax: 0, practicalMax: 0,
    examMax: 70, passMark: 40,
    supplementaryThreshold: 40,
    retakeThreshold: 5,
    gradingScale: [
      { min: 69.5, grade: "A" },{ min: 59.5, grade: "B" },
      { min: 49.5, grade: "C" },{ min: 39.5, grade: "D" },
      { min: 0, grade: "E" },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error"; text: string; } | null>(null);

  useEffect(() => {
    getInstitutionSettings()
      .then((data) => { if (data) setSettings({ ...settings, ...data });})
      .finally(() => setLoading(false));
  }, []);

  const hasAssignment = settings.assignmentMax > 0;
  const hasPractical = settings.practicalMax > 0;
  const fixedWeight = (hasAssignment ? 5 : 0) + (hasPractical ? 5 : 0);
  const remainingCA = 30 - fixedWeight;
  const activeCATs = [settings.cat1Max, settings.cat2Max, settings.cat3Max,].filter((m) => m > 0).length;
  const catWeight = activeCATs > 0 ? (remainingCA / activeCATs).toFixed(1) : 0;

  if (loading) return <LoadingState message="Loading environment settings"/>;

  return (
    <div className="max-w-8xl ml-48 my-10">
      <div className="bg-[#F8F9FA] rounded-lg shadow-2xl p-10 min-h-screen">
        <PageHeader
          title="Institution Grading"
          highlightedTitle="Configuration"
          systemLabel=" "
          subtitle="Configure assessment structure, passing rules, and grading scale"
          actions={
            <>
              <button
                onClick={() => saveInstitutionSettings(settings)}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  "Synchronizing..."
                ) : (
                  <>
                    <Save size={16} /> Commit Configuration
                  </>
                )}
              </button>
            </>
          }
        />

        <div className="grid grid-cols-12 gap-8">
          {/* LEFT COLUMN: ASSESSMENT */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <section className="bg-white rounded-lg p-10 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-7 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Settings size={200} />
              </div>

              <div className="flex items-center gap-4 mb-7">
                <div className="p-3 bg-green-50 text-green-dark rounded-2xl">
                  <BarChart3 size={18} />
                </div>
                <h2 className="text-md font-bold text-green-darkest">
                  Assessment Architecture
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Continuous Assessment (30%)
                  </label>
                  <div className="space-y-4">
                    <MinimalInput
                      label="CAT 01 Max"
                      value={settings.cat1Max}
                      onChange={(v) => setSettings({ ...settings, cat1Max: v })}
                    />
                    <MinimalInput
                      label="CAT 02 Max"
                      value={settings.cat2Max}
                      onChange={(v) => setSettings({ ...settings, cat2Max: v })}
                    />
                    <MinimalInput
                      label="CAT 03 Max (Optional)"
                      value={settings.cat3Max}
                      onChange={(v) => setSettings({ ...settings, cat3Max: v })}
                    />
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <MinimalInput
                        label="Assignment Max"
                        value={settings.assignmentMax}
                        onChange={(v) =>
                          setSettings({ ...settings, assignmentMax: v })
                        }
                      />
                      <MinimalInput
                        label="Practical Max"
                        value={settings.practicalMax}
                        onChange={(v) =>
                          setSettings({ ...settings, practicalMax: v })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="bg-slate-100 rounded-lg p-8 border border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-6">
                      Computed Distribution
                    </span>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600">
                          Internal Weight
                        </span>
                        <span className="text-xl font-black text-slate-900">
                          30
                          <span className="text-sm font-medium text-slate-400">
                            %
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600">
                          Final Examination
                        </span>
                        <span className="text-xl font-black text-slate-900">
                          70
                          <span className="text-sm font-medium text-slate-400">
                            %
                          </span>
                        </span>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                          Current logic assigns{" "}
                          <span className="font-bold text-emerald-600">
                            {catWeight}%
                          </span>{" "}
                          to each active CAT based on your configuration.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4 p-6 bg-amber-50/50 rounded-lg border border-amber-100">
                    <Info className="text-amber-600" size={24} />
                    <p className="text-xs text-amber-700 font-medium leading-tight">
                      Ensure total component weights do not exceed the 30% CA
                      ceiling.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PROGRESSION RULES */}
            <section className="bg-white rounded-lg p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-7">
                <div className="p-3 bg-green-50 text-green-dark rounded-2xl">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="text-md font-bold text-slate-800">
                  Progression Protocols
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <MinimalInput
                  label="Pass Threshold (%)"
                  value={settings.passMark}
                  onChange={(v) => setSettings({ ...settings, passMark: v })}
                />
                <MinimalInput
                  label="Supp. Threshold (%)"
                  value={settings.supplementaryThreshold}
                  onChange={(v) =>
                    setSettings({ ...settings, supplementaryThreshold: v })
                  }
                />
                <MinimalInput
                  label="Retake Limit"
                  value={settings.retakeThreshold}
                  onChange={(v) =>
                    setSettings({ ...settings, retakeThreshold: v })
                  }
                />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: GRADING SCALE */}
          <div className="col-span-12 lg:col-span-4">
            <section className="bg-green-darkest rounded-lg p-10 shadow-2xl sticky top-8 text-white">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/10 text-emerald-400 rounded-2xl">
                  <GraduationCap size={24} />
                </div>
                <h2 className="text-lg font-bold">Grading Scale</h2>
              </div>

              <div className="space-y-4">
                {settings.gradingScale?.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-[9px] font-bold uppercase text-white/40 block mb-1">
                        Min Score
                      </span>
                      <input
                        type="number"
                        value={row.min}
                        onChange={(e) => {
                          const newScale = [...settings.gradingScale!];
                          newScale[i].min = +e.target.value;
                          setSettings((s) => ({
                            ...s,
                            gradingScale: newScale,
                          }));
                        }}
                        className="bg-transparent  font-black outline-none w-full"
                      />
                    </div>
                    <div className="w-16 text-center border-l border-white/10 pl-4">
                      <span className="text-[9px] font-bold uppercase text-white/40 block mb-1">
                        Grade
                      </span>
                      <input
                        value={row.grade}
                        onChange={(e) => {
                          const newScale = [...settings.gradingScale!];
                          newScale[i].grade = e.target.value;
                          setSettings((s) => ({
                            ...s,
                            gradingScale: newScale,
                          }));
                        }}
                        className="bg-transparent  font-black text-emerald-400 outline-none w-full text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-green-dark rounded-lg flex items-center justify-between group cursor-pointer">
                <div>
                  <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-1">
                    Scale Validity
                  </p>
                  <p className="font-bold text-white text-sm">
                    Automated Integrity Check
                  </p>
                </div>
                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-white" />
              </div>
            </section>
          </div>
        </div>

        {message && (
          <div
            className={`fixed bottom-8 right-8 px-8 py-4 rounded-2xl text-white font-bold shadow-2xl animate-bounce ${message.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalInput({ label, value, onChange,}: {
  label: string; value: number; onChange: (v: number) => void;}) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 mb-2 block">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(+e.target.value || 0)}
        className="w-full bg-slate-100 border-none rounded-lg px-4 py-2 text-green-darkest font-bold  transition-all outline-none"
      />
    </div>
  );
}


