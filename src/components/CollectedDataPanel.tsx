"use client";

import { useState } from "react";

interface CollectedDataPanelProps {
  allData: Record<string, Record<string, any>>;
  currentNode?: string;
}

export default function CollectedDataPanel({ allData, currentNode }: CollectedDataPanelProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const nodeKeys = Object.keys(allData);

  const toggleNode = (nodeName: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(nodeName)) {
      newSet.delete(nodeName);
    } else {
      newSet.add(nodeName);
    }
    setExpandedNodes(newSet);
  };

  if (nodeKeys.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Collected Data
        </h2>
        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          {nodeKeys.length} {nodeKeys.length === 1 ? "section" : "sections"}
        </span>
      </div>

      {/* Nodes */}
      <div className="space-y-3">
        {nodeKeys.map((nodeName) => {
          const nodeData = allData[nodeName];
          const fieldKeys = Object.keys(nodeData);
          const isCurrentNode = nodeName === currentNode;
          const isExpanded = expandedNodes.has(nodeName) || isCurrentNode;

          return (
            <div
              key={nodeName}
              className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                isCurrentNode
                  ? "border-indigo-200 shadow-md ring-2 ring-indigo-100"
                  : "border-slate-200 shadow-sm hover:border-slate-300"
              }`}
            >
              {/* Node Header */}
              <button
                onClick={() => toggleNode(nodeName)}
                className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                  isCurrentNode ? "bg-indigo-50/50" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCurrentNode ? "bg-indigo-500 animate-pulse" : "bg-slate-300"
                    }`}
                  />
                  <h4
                    className={`text-sm font-medium ${
                      isCurrentNode ? "text-indigo-900" : "text-slate-700"
                    }`}
                  >
                    {formatNodeName(nodeName)}
                  </h4>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {fieldKeys.length}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Node Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-50">
                  {fieldKeys.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No data collected yet</p>
                  ) : (
                    fieldKeys.map((fieldKey) => {
                      const value = nodeData[fieldKey];
                      return (
                        <div key={fieldKey} className="group">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                            {formatFieldName(fieldKey)}
                          </p>
                          <div className="text-sm text-slate-700 font-medium break-words leading-snug">
                            {formatValue(value)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatNodeName(nodeName: string): string {
  return nodeName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "None";
    }
    if (Object.keys(value).length === 0) {
      return "None";
    }
    const entries = Object.entries(value).map(([k, v]) => {
      const formattedKey = k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const formattedValue = typeof v === "number" ? formatCurrency(v) : String(v);
      return `${formattedKey}: ${formattedValue}`;
    });
    return entries.join(" | ");
  }
  if (typeof value === "number") {
    if (value >= 100) {
      return formatCurrency(value);
    }
    return String(value);
  }
  return String(value);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
