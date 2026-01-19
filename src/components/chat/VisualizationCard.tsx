"use client";

import Chart from "../Chart";
import BookmarkButton from "./BookmarkButton";

interface VisualizationCardProps {
  chartType: string;
  data: Record<string, any>;
  title: string;
  description: string;
  config: Record<string, any>;
  timestamp: string;
}

export default function VisualizationCard({
  chartType,
  data,
  title,
  description,
  config,
  timestamp,
}: VisualizationCardProps) {
  return (
    <div className="max-w-[90%] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
          <p className="text-slate-500 text-sm mt-1">{description}</p>
        </div>
        <BookmarkButton
          title={title}
          description={description}
          chartType={chartType}
          data={data}
          config={config}
        />
      </div>

      {/* Chart */}
      <div className="p-4 bg-slate-50/50">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <Chart
            chartType={chartType}
            data={data}
            title={title}
            config={config}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="capitalize">{chartType.replace(/_/g, " ")}</span>
        </span>
        <span>{timestamp}</span>
      </div>
    </div>
  );
}

