"use client";

import GoalCard from "./GoalCard";

interface Goal {
  goal_id: string;
  priority?: number;
  description?: string;
  type?: string;
  confidence?: number;
  deduced_from?: string[];
  [key: string]: any;
}

interface GoalsKanbanProps {
  qualifiedGoals: Goal[];
  possibleGoals: Goal[];
  rejectedGoals: string[];
  onGoalClick?: (goal: Goal) => void;
}

export default function GoalsKanban({
  qualifiedGoals,
  possibleGoals,
  rejectedGoals,
  onGoalClick,
}: GoalsKanbanProps) {
  return (
    <div className="grid grid-cols-3 gap-6 h-full overflow-hidden">
      {/* Active Goals Column */}
      <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <h3 className="font-semibold text-slate-800">Active Goals</h3>
            </div>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
              {qualifiedGoals.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Confirmed and prioritized</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {qualifiedGoals.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="text-sm">No active goals</p>
            </div>
          ) : (
            qualifiedGoals
              .sort((a, b) => (a.priority || 99) - (b.priority || 99))
              .map((goal) => (
                <GoalCard
                  key={goal.goal_id}
                  goal={goal}
                  status="qualified"
                  onClick={() => onGoalClick?.({ ...goal, status: "qualified" })}
                />
              ))
          )}
        </div>
      </div>

      {/* Detected Goals Column */}
      <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <h3 className="font-semibold text-slate-800">Detected Goals</h3>
            </div>
            <span className="text-sm font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              {possibleGoals.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Awaiting confirmation</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {possibleGoals.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm">No detected goals</p>
            </div>
          ) : (
            possibleGoals.map((goal) => (
              <GoalCard
                key={goal.goal_id}
                goal={goal}
                status="possible"
                onClick={() => onGoalClick?.({ ...goal, status: "possible" })}
              />
            ))
          )}
        </div>
      </div>

      {/* Rejected Goals Column */}
      <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <h3 className="font-semibold text-slate-800">Rejected Goals</h3>
            </div>
            <span className="text-sm font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
              {rejectedGoals.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Dismissed by user</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {rejectedGoals.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-sm">No rejected goals</p>
            </div>
          ) : (
            rejectedGoals.map((goalId) => (
              <GoalCard
                key={goalId}
                goal={{ goal_id: goalId }}
                status="rejected"
                onClick={() => onGoalClick?.({ goal_id: goalId, status: "rejected" })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

