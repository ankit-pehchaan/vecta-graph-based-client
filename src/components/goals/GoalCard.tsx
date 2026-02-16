"use client";

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

interface GoalCardProps {
  goal: Goal;
  status: "qualified" | "possible" | "rejected" | "deferred";
  onClick?: () => void;
}

export default function GoalCard({ goal, status, onClick }: GoalCardProps) {
  const statusConfig = {
    qualified: {
      gradient: "from-indigo-50 to-purple-50",
      border: "border-indigo-100 hover:border-indigo-200",
      badge: "bg-indigo-500 text-white",
      icon: (
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    possible: {
      gradient: "from-amber-50 to-orange-50",
      border: "border-amber-100 hover:border-amber-200",
      badge: "bg-amber-500 text-white",
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    rejected: {
      gradient: "from-slate-50 to-slate-100",
      border: "border-slate-200 hover:border-slate-300",
      badge: "bg-slate-400 text-white",
      icon: (
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    deferred: {
      gradient: "from-white to-slate-50",
      border: "border-slate-200 hover:border-slate-300",
      badge: "bg-slate-300 text-slate-700",
      icon: (
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status];

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${config.gradient} rounded-xl p-4 border ${config.border} transition-all cursor-pointer hover:shadow-md`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {config.icon}
          <h3 className="font-semibold text-slate-800">{formatGoalId(goal.goal_id)}</h3>
        </div>
        <div className="flex items-center gap-2">
          {goal.priority && status === "qualified" && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${config.badge}`}>
              P{goal.priority}
            </span>
          )}
          {goal.confidence && status === "possible" && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white">
              {Math.round(goal.confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{goal.description}</p>
      )}

      {goal.deduced_from && goal.deduced_from.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {goal.deduced_from.slice(0, 3).map((trigger: string, idx: number) => (
            <span
              key={idx}
              className="text-[10px] bg-white/80 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100"
            >
              {trigger}
            </span>
          ))}
          {goal.deduced_from.length > 3 && (
            <span className="text-[10px] text-slate-400">+{goal.deduced_from.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

function formatGoalId(id: string): string {
  return id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

