// clientside/src/app/admin/settings/page.tsx 
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Building2, Plus, Save, Upload, Settings } from "lucide-react";
import {
  useInstitutionSettings,
  useSaveSettings,
  useUploadLogo,
  useUpsertSchool,
  useUpsertDepartment,
} from "@/hooks/queries/useInstitutionSettings";
import { getLogoPreviewUrl } from "@/api/institutionSettingsApi";
import type { DocumentMeta, School, Department } from "@/api/types";
import Image from "next/image";
import PageHeader from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

const DEFAULT_DOC_META: DocumentMeta = {
  universityName: "", universityAbbr: "", schoolName: "", departmentName: "",
  registrar: "Academic Registrar", postalAddress: "", telephone: "",
  email: "", website: "", country: "Kenya", city: "",
};

type Tab = "identity" | "structure";

export default function AdminSettingsPage() {
  const { addToast } = useToast();
  const { data: existing, isLoading } = useInstitutionSettings();
  const { mutateAsync: saveSettings, isPending: saving } = useSaveSettings();
  const { mutateAsync: uploadLogo, isPending: uploading } = useUploadLogo();
  const { mutateAsync: upsertSchool } = useUpsertSchool();
  const { mutateAsync: upsertDepartment } = useUpsertDepartment();

  const [tab, setTab] = useState<Tab>("identity");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [hasLogo, setHasLogo] = useState(false);
  const [docMeta, setDocMeta] = useState<DocumentMeta>(DEFAULT_DOC_META);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  const [newSchool, setNewSchool] = useState({ name: "", shortName: "", code: "", dean: "" });
  const [newDept, setNewDept] = useState<Record<string, { name: string; shortName: string; code: string; hod: string }>>({});

  useEffect(() => {
    if (!existing) return;
    if (existing.docMeta) setDocMeta({ ...DEFAULT_DOC_META, ...existing.docMeta });
    setHasLogo(!!existing.branding?.universityLogoPath);
  }, [existing]);

  if (isLoading) return <LoadingState message="Loading settings..." />;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const updateDocMeta = (k: keyof DocumentMeta, v: string) =>
    setDocMeta(p => ({ ...p, [k]: v }));

  const handleSaveAll = async () => {
    try {
      if (logoFile) await uploadLogo(logoFile);
      await saveSettings({ docMeta });
      addToast("Settings saved successfully", "success");
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    }
  };

  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.code) {
      addToast("School name and code are required", "error");
      return;
    }
    try {
      await upsertSchool({
        name: newSchool.name,
        shortName: newSchool.shortName || newSchool.name.split(" ").map(w => w[0]).join(""),
        code: newSchool.code.toUpperCase(),
        dean: newSchool.dean || undefined,
      });
      setNewSchool({ name: "", shortName: "", code: "", dean: "" });
      addToast(`School ${newSchool.name} added`, "success");
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    }
  };

  const handleAddDept = async (schoolCode: string) => {
    const d = newDept[schoolCode];
    if (!d?.name || !d?.code) {
      addToast("Department name and code are required", "error");
      return;
    }

    try {
      await upsertDepartment({
        schoolCode,
        department: {
          name: d.name,
          shortName: d.shortName || d.name.split(" ").slice(-2).join(" "),
          code: d.code.toUpperCase(),
          hod: d.hod || undefined,
          regNoPatterns: [], // Admin does NOT set patterns - coordinator handles this
        },
      });
      setNewDept(prev => ({ ...prev, [schoolCode]: { name: "", shortName: "", code: "", hod: "" } }));
      addToast(`Department ${d.name} added`, "success");
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    }
  };

  const schools: School[] = existing?.schools ?? [];

  const inputCls = "w-full bg-slate-100 rounded-lg px-3 py-2 text-sm text-green-darkest font-semibold outline-none";
  const labelCls = "text-[10px] font-bold uppercase tracking-tighter text-slate-400 mb-1.5 block";

  const tabs: { id: Tab; label: string }[] = [
    { id: "identity", label: "Identity & Logo" },
    { id: "structure", label: "Schools & Departments" },
  ];

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="max-w-8xl lg:ml-48 mt-10">
        <div className="bg-[#F8F9FA] rounded shadow-2xl p-10 min-h-screen">
          <PageHeader
            title="Institution" highlightedTitle="Settings"
            subtitle="Configure your university's identity and academic structure"
            actions={
              tab === "identity" ? (
                <button onClick={handleSaveAll} disabled={saving || uploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50">
                  {saving || uploading ? "Saving..." : <><Save size={16} /> Save Settings</>}
                </button>
              ) : null
            }
          />

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

          {/* ── Tab: Identity & Logo ──────────────────────────────────────── */}
          {tab === "identity" && (
            <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={16} /></div>
                <h2 className="text-sm font-bold text-green-darkest">University Identity</h2>
                <span className="text-[9px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full ml-auto">
                  Printed on all senate documents and CMS exports
                </span>
              </div>

              {/* Logo */}
              <div className="flex items-start gap-6 mb-8 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="relative w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                  {logoPreview ? (
                    <Image src={logoPreview} alt="Preview" fill className="object-contain" unoptimized />
                  ) : hasLogo ? (
                    <Image src={getLogoPreviewUrl()} alt="Current logo" fill className="object-contain" unoptimized />
                  ) : (
                    <Settings size={28} className="text-slate-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-green-darkest mb-1">University Logo</p>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    PNG, JPG, or SVG — max 2MB. This logo appears on every senate document
                    and all CMS Excel exports.
                  </p>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-green-darkest text-yellow-gold rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-colors">
                    <Upload size={12} />
                    {hasLogo || logoPreview ? "Change Logo" : "Upload Logo"}
                    <input type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden"
                      onChange={handleLogoChange} />
                  </label>
                  {logoPreview && (
                    <p className="text-[10px] text-amber-600 mt-2">
                      ⚠ New logo selected — click Save Settings to apply
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className={labelCls}>University Full Name *</label>
                  <input className={inputCls} value={docMeta.universityName}
                    onChange={e => updateDocMeta("universityName", e.target.value)}
                    placeholder="University of Nairobi" />
                </div>
                <div>
                  <label className={labelCls}>Abbreviation</label>
                  <input className={inputCls} value={docMeta.universityAbbr}
                    onChange={e => updateDocMeta("universityAbbr", e.target.value)}
                    placeholder="UoN" />
                </div>
                <div>
                  <label className={labelCls}>Default School Name (for documents)</label>
                  <input className={inputCls} value={docMeta.schoolName}
                    onChange={e => updateDocMeta("schoolName", e.target.value)}
                    placeholder="School of Engineering" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Default Department Name</label>
                  <input className={inputCls} value={docMeta.departmentName}
                    onChange={e => updateDocMeta("departmentName", e.target.value)}
                    placeholder="Department of Civil Engineering" />
                </div>
                <div>
                  <label className={labelCls}>Registrar Title</label>
                  <input className={inputCls} value={docMeta.registrar}
                    onChange={e => updateDocMeta("registrar", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Official Email</label>
                  <input className={inputCls} value={docMeta.email}
                    onChange={e => updateDocMeta("email", e.target.value)}
                    placeholder="info@university.ac.ke" />
                </div>
                <div>
                  <label className={labelCls}>Telephone</label>
                  <input className={inputCls} value={docMeta.telephone}
                    onChange={e => updateDocMeta("telephone", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Postal Address</label>
                  <input className={inputCls} value={docMeta.postalAddress}
                    onChange={e => updateDocMeta("postalAddress", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input className={inputCls} value={docMeta.city}
                    onChange={e => updateDocMeta("city", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input className={inputCls} value={docMeta.country}
                    onChange={e => updateDocMeta("country", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Schools & Departments ────────────────────────────────── */}
          {tab === "structure" && (
            <div className="space-y-6">
              {/* Add school form */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-green-darkest mb-4">Add School</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>School Name *</label>
                    <input className={inputCls} value={newSchool.name}
                      onChange={e => setNewSchool(p => ({ ...p, name: e.target.value }))}
                      placeholder="School of Engineering" />
                  </div>
                  <div>
                    <label className={labelCls}>Short Name</label>
                    <input className={inputCls} value={newSchool.shortName}
                      onChange={e => setNewSchool(p => ({ ...p, shortName: e.target.value }))}
                      placeholder="SoE" />
                  </div>
                  <div>
                    <label className={labelCls}>Code *</label>
                    <input className={inputCls} value={newSchool.code}
                      onChange={e => setNewSchool(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="ENG" maxLength={10} />
                  </div>
                  <div className="col-span-3">
                    <label className={labelCls}>Dean (Optional)</label>
                    <input className={inputCls} value={newSchool.dean}
                      onChange={e => setNewSchool(p => ({ ...p, dean: e.target.value }))}
                      placeholder="Prof. John Doe" />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <button onClick={handleAddSchool}
                      className="flex items-center gap-2 px-4 py-2 bg-green-darkest text-yellow-gold rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-colors">
                      <Plus size={14} /> Add School
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing schools */}
              {schools.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-200">
                  <Building2 className="mx-auto text-slate-200 mb-3" size={40} />
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest">
                    No schools configured yet
                  </p>
                </div>
              ) : schools.map((school: School) => {
                const isExpanded = expandedSchool === school.code;
                const deptForm = newDept[school.code] ?? { name: "", shortName: "", code: "", hod: "" };

                return (
                  <div key={school.code} className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                      <button onClick={() => setExpandedSchool(isExpanded ? null : school.code)}
                        className="flex items-center gap-3 text-left">
                        {isExpanded
                          ? <ChevronDown size={16} className="text-green-darkest" />
                          : <ChevronRight size={16} className="text-slate-400" />
                        }
                        <div>
                          <span className="font-bold text-green-darkest text-sm">{school.name}</span>
                          <span className="ml-3 text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {school.code}
                          </span>
                          {school.dean && (
                            <span className="ml-2 text-[10px] text-slate-400">Dean: {school.dean}</span>
                          )}
                        </div>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-6 space-y-4">
                        {/* Existing departments */}
                        {(school.departments ?? []).map((dept: Department) => (
                          <div key={dept.code} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-sm font-semibold text-green-darkest">{dept.name}</span>
                              <span className="ml-2 text-[10px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border">
                                {dept.code}
                              </span>
                              {dept.hod && (
                                <span className="ml-2 text-[10px] text-slate-400">HoD: {dept.hod}</span>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add department form - NO PATTERN UI HERE */}
                        <div className="p-4 bg-green-darkest/5 rounded-lg border border-green-darkest/10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-green-darkest/50 mb-3">
                            Add Department to {school.name}
                          </p>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className={labelCls}>Department Name *</label>
                              <input className={inputCls} value={deptForm.name}
                                onChange={e => setNewDept(p => ({
                                  ...p, [school.code]: { ...deptForm, name: e.target.value }
                                }))}
                                placeholder="Department of Civil Engineering" />
                            </div>
                            <div>
                              <label className={labelCls}>Short Name</label>
                              <input className={inputCls} value={deptForm.shortName}
                                onChange={e => setNewDept(p => ({
                                  ...p, [school.code]: { ...deptForm, shortName: e.target.value }
                                }))}
                                placeholder="Civil Eng" />
                            </div>
                            <div>
                              <label className={labelCls}>Code *</label>
                              <input className={inputCls} value={deptForm.code}
                                onChange={e => setNewDept(p => ({
                                  ...p, [school.code]: { ...deptForm, code: e.target.value.toUpperCase() }
                                }))}
                                placeholder="CE" maxLength={10} />
                            </div>
                            <div>
                              <label className={labelCls}>Head of Dept (HoD)</label>
                              <input className={inputCls} value={deptForm.hod}
                                onChange={e => setNewDept(p => ({
                                  ...p, [school.code]: { ...deptForm, hod: e.target.value }
                                }))}
                                placeholder="Dr. Jane Smith" />
                            </div>
                          </div>

                          <div className="text-xs text-slate-500 mb-3 p-2 bg-blue-50 rounded-lg">
                            <strong>Note:</strong> Registration number patterns for this department can be configured by the department coordinator.
                          </div>

                          <button onClick={() => handleAddDept(school.code)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-darkest text-yellow-gold rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-colors">
                            <Plus size={12} /> Add Department
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}