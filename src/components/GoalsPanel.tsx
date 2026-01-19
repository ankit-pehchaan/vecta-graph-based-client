"use client";

import { useState } from "react";

interface Goal {
  goal_id: string;
  priority?: number;
  description?: string;
  type?: string;
  confidence?: number;
  deduced_from?: string[];
  [key: string]: any;
}

interface GoalsPanelProps {
  qualifiedGoals: Goal[];
  possibleGoals: Goal[];
  rejectedGoals: string[];
  onToggle?: () => void;
  isVisible?: boolean;
}

export default function GoalsPanel({
  qualifiedGoals,
  possibleGoals,
  rejectedGoals,
  onToggle,
  isVisible = true,
}: GoalsPanelProps) {
  const [activeTab, setActiveTab] = useState<"qualified" | "possible">("qualified");

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-20 z-20 p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-600 hover:text-indigo-600 transition-all hover:shadow-xl"
        title="Show Goals Panel"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="h-full bg-white border-l border-slate-200 w-80 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Goals
        </h2>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-slate-100 mx-4 mt-4 rounded-xl">
        <button
          onClick={() => setActiveTab("qualified")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "qualified"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Active ({qualifiedGoals.length})
        </button>
        <button
          onClick={() => setActiveTab("possible")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "possible"
              ? "bg-white text-amber-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Detected ({possibleGoals.length})
        </button>
      </div>

      {/* Goals List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === "qualified" ? (
          <>
            {qualifiedGoals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm font-medium">No active goals yet</p>
                <p className="text-xs mt-1">Confirmed goals will appear here</p>
              </div>
            ) : (
              qualifiedGoals
                .sort((a, b) => (a.priority || 99) - (b.priority || 99))
                .map((goal) => (
                  <div
                    key={goal.goal_id}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800 text-sm">
                        {formatGoalId(goal.goal_id)}
                      </h3>
                      <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        P{goal.priority || "?"}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>
                ))
            )}
          </>
        ) : (
          <>
            {possibleGoals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">No detected goals</p>
                <p className="text-xs mt-1">Inferred goals will appear here</p>
              </div>
            ) : (
              possibleGoals.map((goal) => (
                <div
                  key={goal.goal_id}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 transition-all hover:shadow-md relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {formatGoalId(goal.goal_id)}
                    </h3>
                    {goal.confidence && (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-200/50 px-2 py-0.5 rounded-full">
                        {Math.round(goal.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {goal.description}
                    </p>
                  )}

                  {goal.deduced_from && goal.deduced_from.length > 0 && (
                    <div className="pt-2 border-t border-amber-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                        Detected From
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {goal.deduced_from.slice(0, 3).map((trigger: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white/80 text-slate-500 px-2 py-0.5 rounded-md border border-amber-100 truncate max-w-[120px]"
                          >
                            {trigger}
                          </span>
                        ))}
                        {goal.deduced_from.length > 3 && (
                          <span className="text-[10px] text-amber-600 font-medium">
                            +{goal.deduced_from.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* Rejected Goals */}
        {rejectedGoals.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Dismissed
            </h3>
            <div className="flex flex-wrap gap-2">
              {rejectedGoals.map((id) => (
                <span
                  key={id}
                  className="text-xs bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg line-through"
                >
                  {formatGoalId(id)}
                </span>
              ))}
            </div>
          </div>
        )}
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
