"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { useApp } from "@/contexts/AppContext";
import { GoalCard, GoalsKanban, GoalModal } from "@/components/goals";

interface Goal {
  goal_id: string;
  priority?: number;
  description?: string;
  type?: string;
  confidence?: number;
  deduced_from?: string[];
  [key: string]: any;
}

export default function GoalsPage() {
  const { sessionId, status, goalState } = useApp();
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filter, setFilter] = useState<"all" | "qualified" | "possible" | "rejected">("all");

  const allGoals = [
    ...goalState.qualified_goals.map((g) => ({ goal_id: g.goal_id || "", ...g, status: "qualified" as const })),
    ...goalState.possible_goals.map((g) => ({ goal_id: g.goal_id || "", ...g, status: "possible" as const })),
    ...goalState.rejected_goals.map((id) => ({ goal_id: id, status: "rejected" as const })),
  ];

  const filteredGoals = filter === "all" 
    ? allGoals 
    : allGoals.filter((g) => g.status === filter);

  const stats = {
    total: allGoals.length,
    qualified: goalState.qualified_goals.length,
    possible: goalState.possible_goals.length,
    rejected: goalState.rejected_goals.length,
  };

  return (
    <DashboardLayout sessionId={sessionId} status={status}>
      <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Financial Goals</h1>
            <p className="text-slate-500 mt-1">Track and manage your financial objectives</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "kanban" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Goals ({stats.total})</option>
              <option value="qualified">Active ({stats.qualified})</option>
              <option value="possible">Detected ({stats.possible})</option>
              <option value="rejected">Rejected ({stats.rejected})</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Goals</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600">Active Goals</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.qualified}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Detected</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">{stats.possible}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Rejected</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {allGoals.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No goals yet</h3>
              <p className="text-slate-500 max-w-md">
                Start chatting with Vecta on the main page. As you share your financial situation, goals will be automatically detected and tracked here.
              </p>
            </div>
          ) : viewMode === "kanban" ? (
            <GoalsKanban
              qualifiedGoals={goalState.qualified_goals as Goal[]}
              possibleGoals={goalState.possible_goals as Goal[]}
              rejectedGoals={goalState.rejected_goals}
              onGoalClick={setSelectedGoal}
            />
          ) : (
            <div className="grid gap-4 overflow-y-auto h-full pb-4">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.goal_id}
                  goal={goal as Goal}
                  status={goal.status}
                  onClick={() => setSelectedGoal(goal as Goal)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedGoal && (
          <GoalModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}

