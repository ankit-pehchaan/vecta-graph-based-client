"use client";

import { useState, useEffect } from "react";
import type { ChatMessage } from "@/types/websocket";
import { VectaAvatar } from "./chat";

interface MessageBubbleProps {
  message: ChatMessage;
  onGoalAction?: (action: string) => void;
}

export default function MessageBubble({ message, onGoalAction }: MessageBubbleProps) {
  const [formattedTime, setFormattedTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const goalDetails = message.metadata?.goal_details;

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

  const formatGoalId = (id?: string) => {
    if (!id) return "Goal";
    return id
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatNodeLabel = (node?: string) => {
    if (!node) return "";
    if (node === "Retirement") return "Super";
    return node
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // System message
  if (message.type === "system") {
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

  // Scenario framing message
  if (message.type === "scenario_question") {
    const goalLabel =
      message.metadata?.goal_description ||
      message.metadata?.goal_id ||
      "Inferred goal";
    const turn = message.metadata?.turn;
    const maxTurns = message.metadata?.max_turns;
    return (
      <div className="flex justify-start my-4 animate-fade-in-up">
        <VectaAvatar size="sm" />
        <div className="ml-3 max-w-[80%] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-100/60 flex items-center gap-2 bg-white/60">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-amber-900 text-sm">Scenario framing</span>
            {renderTimestamp()}
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-700 mb-3">
              <span className="bg-white/80 border border-amber-200 rounded-full px-3 py-1">
                {goalLabel}
              </span>
              {turn && maxTurns && (
                <span className="bg-white/80 border border-amber-200 rounded-full px-3 py-1">
                  Turn {turn} of {maxTurns}
                </span>
              )}
            </div>
            <p className="text-slate-800 font-medium">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Streaming message (in-progress response being built token by token)
  if (message.type === "streaming") {
    const isStillStreaming = message.metadata?.isStreaming;
    return (
      <div className="flex justify-start my-3 animate-fade-in-up group">
        <VectaAvatar size="sm" />
        <div className="max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm chat-bubble-bot ml-3">
          <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
            {message.content || (
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            )}
          </div>
          {isStillStreaming && message.content && (
            <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    );
  }

  // Regular chat message (user or bot)
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
        
        {!isUser && (message.node_name || goalDetails) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            {goalDetails?.goal_id && (
              <>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-md">
                  Goal details
                </span>
                <span className="text-[10px] text-slate-500">
                  {formatGoalId(goalDetails.goal_id)}
                </span>
              </>
            )}
            {message.node_name && (
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">
                {formatNodeLabel(message.node_name)}
              </span>
            )}
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
