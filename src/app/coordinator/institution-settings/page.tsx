// clientside/src/app/coordinator/institution-settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  getInstitutionSettings,
  saveInstitutionSettings,
} from "@/api/institutionSettingsApi";
import type { InstitutionSettings, GradingScale } from "@/api/types";

export default function InstitutionSettingsPage() {
  const [settings, setSettings] = useState<InstitutionSettings>({
    cat1Max: 30,
    cat2Max: 40,
    cat3Max: 0,
    assignmentMax: 0,
    practicalMax: 0,
    examMax: 70,
    passMark: 40,
    supplementaryThreshold: 40,
    retakeThreshold: 5,
    gradingScale: [
      { min: 70, grade: "A", points: 4.0 }, //69.5
      { min: 65, grade: "B+", points: 3.5 },
      { min: 60, grade: "B", points: 3.0 }, // 59.5
      { min: 55, grade: "C+", points: 2.5 },
      { min: 50, grade: "C", points: 2.0 },  //49.5
      { min: 45, grade: "D+", points: 1.5 },
      { min: 40, grade: "D", points: 1.0 }, //39.5
      { min: 0, grade: "F", points: 0.0 }, //E
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    getInstitutionSettings()
      .then((data) => {
        if (data) setSettings({ ...settings, ...data });
      })
      .finally(() => setLoading(false));
  }, []);

  const hasAssignment = settings.assignmentMax > 0;
  const hasPractical = settings.practicalMax > 0;
  const fixedWeight = (hasAssignment ? 5 : 0) + (hasPractical ? 5 : 0);
  const remainingCA = 30 - fixedWeight;
  const activeCATs = [
    settings.cat1Max,
    settings.cat2Max,
    settings.cat3Max,
  ].filter((m) => m > 0).length;
  const catWeight = activeCATs > 0 ? (remainingCA / activeCATs).toFixed(1) : 0;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveInstitutionSettings(settings);
      setMessage({
        type: "success",
        text: "All institution settings have been saved successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to save settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-green-darkest">
            Loading institution settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl h-full ml-48 my-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-green-darkest">
            Institution Grading Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Configure assessment structure, passing rules, and grading scale
          </p>
        </div>

        {/* Assessment Structure */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-green-darkest mb-6">
            Assessment Components
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Continuous Assessment */}
            <div className="border border-green-darkest rounded-lg p-6 bg-gray-50">
              <h3 className="font-semibold text-lg text-green-darkest mb-4">
                Continuous Assessment (30% Total)
              </h3>

              <table className="w-full text-left">
                <tbody>
                  <tr>
                    <td className="py-2 pr-4 text-green-darkest">CAT 1</td>
                    <td className="py-2">
                      <InputNum
                        value={settings.cat1Max}
                        onChange={(v) =>
                          setSettings((s) => ({ ...s, cat1Max: v }))
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-green-darkest">CAT 2</td>
                    <td className="py-2">
                      <InputNum
                        value={settings.cat2Max}
                        onChange={(v) =>
                          setSettings((s) => ({ ...s, cat2Max: v }))
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-green-darkest">
                      CAT 3{" "}
                      <span className="text-xs text-gray-500">(optional)</span>
                    </td>
                    <td className="py-2">
                      <InputNum
                        value={settings.cat3Max}
                        onChange={(v) =>
                          setSettings((s) => ({ ...s, cat3Max: v }))
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-green-darkest">
                      Assignment{" "}
                      <span className="text-xs text-gray-500">
                        (5% if used)
                      </span>
                    </td>
                    <td className="py-2">
                      <InputNum
                        value={settings.assignmentMax}
                        onChange={(v) =>
                          setSettings((s) => ({ ...s, assignmentMax: v }))
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-green-darkest">
                      Practical{" "}
                      <span className="text-xs text-gray-500">
                        (5% if used)
                      </span>
                    </td>
                    <td className="py-2">
                      <InputNum
                        value={settings.practicalMax}
                        onChange={(v) =>
                          setSettings((s) => ({ ...s, practicalMax: v }))
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-900">
                  Active CATs: {activeCATs} → Each CAT worth:{" "}
                  <strong>{catWeight}%</strong>
                  <br />
                  Assignment: {hasAssignment ? "5%" : "0%"} • Practical:{" "}
                  {hasPractical ? "5%" : "0%"}
                </p>
              </div>
            </div>

            {/* Final Exam */}
            <div className="border border-gray-300 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">
                Final Examination
              </h3>
              <div className="text-center">
                <p className="text-6xl font-bold text-blue-900">70%</p>
                <p className="text-lg text-green-darkest mt-2">
                  Out of 70 marks
                </p>
                <p className="text-sm text-gray-600 mt-4 italic">
                  Fixed by institutional policy
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="border border-gray-300 rounded-lg p-6 bg-green-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">
                Weight Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-darkest">
                    Continuous Assessment
                  </span>
                  <strong>30%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-darkest">Final Examination</span>
                  <strong>70%</strong>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-green-800">
                    <span>Total</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grading Rules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Academic Progression Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-green-darkest mb-2">
                Pass Mark (%)
              </label>
              <InputNum
                value={settings.passMark}
                onChange={(v) => setSettings((s) => ({ ...s, passMark: v }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-darkest mb-2">
                Supplementary Threshold (%)
              </label>
              <InputNum
                value={settings.supplementaryThreshold}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, supplementaryThreshold: v }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-darkest mb-2">
                Retake Threshold (No. of Supplements)
              </label>
              <InputNum
                value={settings.retakeThreshold}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, retakeThreshold: v }))
                }
              />
            </div>
          </div>
        </div>

        {/* Grading Scale Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Grading Scale
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Minimum Mark
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Grade
                  </th>
                  <th className="border border-gray-300 px-6 py-4 text-left text-sm font-semibold text-gray-800">
                    Grade Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {settings.gradingScale?.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-6 py-4">
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
                        className="w-20 px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 px-6 py-4">
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
                        className="w-24 px-3 py-2 border border-gray-400 rounded focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </td>
                    <td className="border border-gray-300 px-6 py-4 text-green-darkest font-medium">
                      {row.points?.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-12 py-4 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold text-lg rounded-lg shadow-md transition duration-200"
          >
            {saving ? "Saving Settings..." : "Save All Configuration"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-8 p-6 text-center rounded-lg text-white font-medium text-lg ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Number Input
const InputNum = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(+e.target.value || 0)}
    className="w-full px-4 py-3 border border-gray-400 rounded-md focus:outline-none focus:border-blue-600 text-lg font-medium"
    min="0"
  />
);
