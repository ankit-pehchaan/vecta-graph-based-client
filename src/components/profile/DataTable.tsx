"use client";

import { useState, useMemo } from "react";

interface DataTableProps {
  data: Record<string, any>;
  title?: string;
}

export default function DataTable({ data, title }: DataTableProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const entries = Object.entries(data).map(([key, value]) => ({
      field: formatFieldName(key),
      value: formatValue(value),
      rawValue: value,
    }));

    if (sortField) {
      entries.sort((a, b) => {
        const aVal = sortField === "field" ? a.field : a.rawValue;
        const bVal = sortField === "field" ? b.field : b.rawValue;
        
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return entries;
  }, [data, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th
                onClick={() => handleSort("field")}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Field
                  {sortField === "field" && (
                    <svg className={`w-3 h-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("value")}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Value
                  {sortField === "value" && (
                    <svg className={`w-3 h-3 ${sortDirection === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600">{row.field}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (value >= 1000) {
      return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  }
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "None";
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "None";
    return entries
      .map(([k, v]) => `${formatFieldName(k)}: ${typeof v === "number" ? formatValue(v) : String(v)}`)
      .join(" | ");
  }
  return String(value);
}

