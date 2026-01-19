"use client";

import DataTable from "./DataTable";
import SectionChart from "./SectionChart";

interface ProfileSectionProps {
  name: string;
  data: Record<string, any>;
  icon?: React.ReactNode;
}

export default function ProfileSection({ name, data, icon }: ProfileSectionProps) {
  const fieldCount = Object.keys(data).length;

  // Separate simple values from nested objects
  const simpleData: Record<string, any> = {};
  const nestedData: Record<string, Record<string, any>> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      nestedData[key] = value;
    } else {
      simpleData[key] = value;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">{formatSectionName(name)}</h2>
              <p className="text-sm text-slate-500">{fieldCount} fields collected</p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>

        {/* Chart */}
        <SectionChart data={data} type={Object.keys(nestedData).length > 0 ? "doughnut" : "bar"} />
      </div>

      {/* Simple Data Table */}
      {Object.keys(simpleData).length > 0 && (
        <DataTable data={simpleData} title="Details" />
      )}

      {/* Nested Data Tables */}
      {Object.entries(nestedData).map(([key, values]) => (
        <DataTable key={key} data={values} title={formatSectionName(key)} />
      ))}
    </div>
  );
}

function formatSectionName(name: string): string {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

