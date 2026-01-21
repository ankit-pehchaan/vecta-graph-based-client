"use client";

import { useState, useEffect } from "react";
import type { ChatMessage } from "@/types/websocket";
import Chart from "./Chart";
import { VectaAvatar, BookmarkButton } from "./chat";

interface MessageBubbleProps {
  message: ChatMessage;
  onGoalAction?: (action: string) => void;
}

export default function MessageBubble({ message, onGoalAction }: MessageBubbleProps) {
  const [formattedTime, setFormattedTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };
    setFormattedTime(formatTime(message.timestamp));
  }, [message.timestamp]);

  const renderTimestamp = () =>
    mounted && (
      <span className="text-[10px] text-slate-400 ml-2 select-none">
        {formattedTime}
      </span>
    );

  // System message
  if (message.type === "system" || message.type === "mode_switch" || message.type === "traversal_paused") {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <div className="bg-slate-100/80 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-2 text-xs text-slate-600 font-medium shadow-sm flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{message.content}</span>
          {message.metadata?.next_node && (
            <span className="flex items-center gap-1 text-indigo-600 pl-2 border-l border-slate-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="font-semibold">{message.metadata.next_node}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // Error message
  if (message.type === "error") {
    return (
      <div className="flex justify-center my-4 animate-shake">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 max-w-md shadow-sm flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="font-semibold mb-0.5">Something went wrong</p>
            <p className="opacity-80 text-xs">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Goal qualification message
  if (message.type === "goal_qualification") {
    return (
      <div className="flex justify-start my-4 animate-fade-in-up">
        <VectaAvatar size="sm" />
        <div className="ml-3 max-w-[80%] bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-indigo-100/50 flex items-center gap-2 bg-white/50">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="font-semibold text-indigo-900 text-sm">Goal Confirmation</span>
            {renderTimestamp()}
          </div>
          
          <div className="p-5">
            <p className="text-slate-800 font-medium mb-2">{message.content}</p>
            {message.metadata?.goal_description && (
              <p className="text-sm text-slate-600 mb-4 bg-white/70 p-3 rounded-xl border border-indigo-100/50">
                {message.metadata.goal_description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => onGoalAction?.("Yes, this is important to me")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                Yes, prioritize this
              </button>
              <button
                onClick={() => onGoalAction?.("No, not right now")}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-all active:scale-95"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculation message
  if (message.type === "calculation" && message.calculation) {
    const calc = message.calculation;
    return (
      <div className="flex justify-start my-4 animate-fade-in-up">
        <VectaAvatar size="sm" />
        <div className="ml-3 max-w-[85%] bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-emerald-50/50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-emerald-900 text-sm capitalize">{calc.calculation_type.replace(/_/g, " ")}</span>
            </div>
            {renderTimestamp()}
          </div>
          <div className="p-5">
            <p className="text-slate-700 mb-4">{calc.message}</p>
            
            {calc.can_calculate && calc.result ? (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(calc.result).map(([key, value]) => (
                  <div key={key} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100/50">
                    <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</p>
                    <p className="text-xl font-bold text-emerald-900">
                      {typeof value === "number" ? value.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200">
                <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Missing Information
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {calc.missing_data.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            )}
            
            {calc.data_used.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                Data sources: {calc.data_used.join(", ")}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Visualization message
  if (message.type === "visualization" && message.visualization) {
    const viz = message.visualization;
    const charts = viz.charts && viz.charts.length > 0
      ? viz.charts
      : [
          {
            chart_type: viz.chart_type,
            data: viz.data,
            title: viz.title,
            description: viz.description,
            config: viz.config,
          },
        ];
    const firstChart = charts[0];
    return (
      <div className="flex justify-start my-4 animate-fade-in-up">
        <VectaAvatar size="sm" />
        <div className="ml-3 max-w-[90%] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-lg">{firstChart.title}</h3>
              <p className="text-slate-500 text-sm mt-1">{firstChart.description}</p>
            </div>
            <BookmarkButton
              title={firstChart.title}
              description={firstChart.description}
              chartType={firstChart.chart_type}
              data={firstChart.data}
              config={firstChart.config}
            />
          </div>
          <div className="p-4 bg-slate-50/50 space-y-4">
            {charts.map((chart, index) => (
              <div key={`${chart.chart_type}-${index}`} className="bg-white rounded-xl p-4 border border-slate-100">
                <Chart
                  chartType={chart.chart_type}
                  data={chart.data}
                  title={chart.title}
                  config={chart.config}
                />
              </div>
            ))}
            {(viz.calculation_type || viz.inputs) && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 text-xs text-slate-500 space-y-1">
                {viz.calculation_type && (
                  <div>
                    <span className="font-semibold text-slate-700">Calculation:</span>{" "}
                    {viz.calculation_type.replace(/_/g, " ")}
                  </div>
                )}
                {viz.inputs && Object.keys(viz.inputs).length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700">Inputs:</span>{" "}
                    {Object.entries(viz.inputs)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="px-4 py-2 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="capitalize">{firstChart.chart_type.replace(/_/g, " ")}</span>
            </span>
            {renderTimestamp()}
          </div>
        </div>
      </div>
    );
  }

  // Regular chat message
  const isUser = message.type === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-3 animate-fade-in-up group`}>
      {!isUser && <VectaAvatar size="sm" />}
      
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm transition-all ${
          isUser
            ? "chat-bubble-user ml-3"
            : "chat-bubble-bot ml-3"
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
          {message.content}
        </div>
        
        {message.node_name && !isUser && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">
              {message.node_name}
            </span>
            {message.upcoming_nodes && message.upcoming_nodes.length > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {message.upcoming_nodes[0]}
                {message.upcoming_nodes.length > 1 && (
                  <span className="text-slate-300">+{message.upcoming_nodes.length - 1}</span>
                )}
              </span>
            )}
          </div>
        )}

        <div className={`text-[10px] mt-2 flex items-center gap-2 ${isUser ? "text-slate-400 justify-end" : "text-slate-400"}`}>
          {mounted && formattedTime}
          {message.extracted_data && Object.keys(message.extracted_data).length > 0 && (
            <span
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 px-1.5 py-0.5 rounded text-slate-500"
              title={JSON.stringify(message.extracted_data, null, 2)}
            >
              {Object.keys(message.extracted_data).length} updates
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
