"use client";

import { useEffect } from "react";

interface Goal {
  goal_id: string;
  priority?: number;
  description?: string;
  type?: string;
  confidence?: number;
  deduced_from?: string[];
  status?: "qualified" | "possible" | "rejected" | "deferred";
  [key: string]: any;
}

interface GoalModalProps {
  goal: Goal;
  onClose: () => void;
}

export default function GoalModal({ goal, onClose }: GoalModalProps) {
  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const statusConfig = {
    qualified: {
      label: "Active Goal",
      color: "bg-indigo-500",
      bg: "bg-indigo-50",
    },
    possible: {
      label: "Detected Goal",
      color: "bg-amber-500",
      bg: "bg-amber-50",
    },
    rejected: {
      label: "Rejected Goal",
      color: "bg-slate-400",
      bg: "bg-slate-50",
    },
    deferred: {
      label: "Deferred Goal",
      color: "bg-slate-500",
      bg: "bg-slate-50",
    },
  };

  const config = statusConfig[goal.status || "possible"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={`${config.bg} p-6 border-b border-slate-100`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${config.color}`}>
              {config.label}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{formatGoalId(goal.goal_id)}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Description */}
          {goal.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-slate-700 leading-relaxed">{goal.description}</p>
            </div>
          )}

          {/* Priority */}
          {goal.priority && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Priority
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600">#{goal.priority}</span>
                <span className="text-slate-500">
                  {goal.priority === 1 ? "Highest priority" : `Priority level ${goal.priority}`}
                </span>
              </div>
            </div>
          )}

          {/* Confidence */}
          {goal.confidence && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Confidence Score
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.round(goal.confidence * 100)}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-amber-600">
                  {Math.round(goal.confidence * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Deduced From */}
          {goal.deduced_from && goal.deduced_from.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Detected From
              </h3>
              <div className="flex flex-wrap gap-2">
                {goal.deduced_from.map((trigger: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Properties */}
          {Object.keys(goal).filter((k) => !["goal_id", "priority", "description", "type", "confidence", "deduced_from", "status"].includes(k)).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Additional Details
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                {Object.entries(goal)
                  .filter(([k]) => !["goal_id", "priority", "description", "type", "confidence", "deduced_from", "status"].includes(k))
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-500">{formatGoalId(key)}</span>
                      <span className="text-slate-700 font-medium">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function formatGoalId(id: string): string {
  return id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

