"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";
import CollectedDataPanel from "./CollectedDataPanel";
import GoalsPanel from "./GoalsPanel";
import { VectaAvatar } from "./chat";

export default function ChatInterface() {
  const {
    messages,
    status,
    sessionId,
    goalState,
    collectedData,
    currentNode,
    sendMessage,
    startSession,
    resumeSession,
    hasExistingSession,
    clearSession,
  } = useWebSocket();

  const [userGoal, setUserGoal] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasResumedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for existing session and resume if available (only once on mount)
  useEffect(() => {
    // Only run once when component mounts and has existing session
    if (mounted && hasExistingSession && !hasResumedRef.current) {
      setShowGoalInput(false);
      hasResumedRef.current = true;
      
      // Resume WebSocket connection - resumeSession will check if disconnected
      // Use a small delay to ensure state is stable
      const timer = setTimeout(() => {
        resumeSession();
      }, 100);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, hasExistingSession]); // Only depend on mount and hasExistingSession - run once

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartSession = () => {
    const trimmed = userGoal.trim();
    startSession(trimmed || undefined, true); // Force new session
    setShowGoalInput(false);
  };

  const handleNewSession = () => {
    clearSession();
    setShowGoalInput(true);
    setUserGoal("");
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const isConnected = status === "connected";
  const isSessionComplete = messages.some(
    (m) => m.metadata?.complete === true
  );

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <VectaAvatar size="lg" animate />
          <p className="text-slate-500 font-medium mt-4">Initializing Vecta...</p>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (showGoalInput) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 bg-gradient-mesh">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
          <div className="space-y-6">
            <div className="flex justify-center">
              <VectaAvatar size="lg" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
                Welcome to <span className="gradient-text">Vecta</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your AI-powered financial advisor. Tell me about your financial goals and I will help you create a comprehensive plan.
              </p>
            </div>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200/50 flex gap-2 w-full max-w-xl mx-auto">
            <input
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartSession()}
              placeholder="What financial goal would you like to achieve?"
              className="flex-1 px-6 py-4 rounded-xl focus:outline-none text-slate-800 placeholder:text-slate-400 bg-transparent text-lg"
              autoFocus
            />
            <button
              onClick={handleStartSession}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all font-semibold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              Start
            </button>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            {["Retirement planning", "Buying a house", "Investment strategy", "Debt reduction", "Emergency fund"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setUserGoal(suggestion)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-xl mx-auto">
            <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">Smart Analysis</h3>
              <p className="text-xs text-slate-500">AI-powered insights for your finances</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">Visualizations</h3>
              <p className="text-xs text-slate-500">Interactive charts and graphs</p>
            </div>
            <div className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">Real-time</h3>
              <p className="text-xs text-slate-500">Live updates as you chat</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Left panel - Collected Data */}
      <div
        className={`flex-shrink-0 border-r border-slate-200 bg-white transition-all duration-300 relative ${
          showLeftPanel ? "w-80" : "w-0"
        }`}
      >
        <div className={`h-full overflow-y-auto p-4 ${showLeftPanel ? "w-80" : "w-0 overflow-hidden"}`}>
          {Object.keys(collectedData).length > 0 ? (
            <CollectedDataPanel allData={collectedData} currentNode={currentNode || undefined} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
              <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>Data will appear here</p>
              <p className="text-xs mt-1">as you chat with Vecta</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1.5 shadow-md z-10 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${!showLeftPanel ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header with New Session button */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className="text-sm text-slate-500">
              {isConnected ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={handleNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Session
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-2 pb-4">
            {messages.length === 0 && isConnected && (
              <div className="text-center py-20 animate-fade-in">
                <VectaAvatar size="lg" animate />
                <p className="text-slate-500 mt-4">Vecta is getting ready...</p>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onGoalAction={(action) => handleSendMessage(action)}
              />
            ))}

            {isSessionComplete && (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-fade-in-up">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-emerald-800 font-medium">Data collection complete</p>
                  <p className="text-emerald-600 text-sm">You can continue chatting or view your profile</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
          <div className="max-w-3xl mx-auto">
            <InputBox
              onSend={handleSendMessage}
              disabled={!isConnected}
              placeholder={
                isSessionComplete
                  ? "Ask for visualizations, projections, or more details..."
                  : isConnected
                  ? "Type your message to Vecta..."
                  : "Connecting to Vecta..."
              }
            />
          </div>
        </div>
      </div>

      {/* Right panel - Goals */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ${
          showRightPanel ? "w-80" : "w-0"
        }`}
      >
        <div className={`h-full ${showRightPanel ? "" : "overflow-hidden"}`}>
          <GoalsPanel
            qualifiedGoals={goalState.qualified_goals as any[]}
            possibleGoals={goalState.possible_goals as any[]}
            rejectedGoals={goalState.rejected_goals}
            onToggle={() => setShowRightPanel(!showRightPanel)}
            isVisible={showRightPanel}
          />
        </div>
      </div>
    </div>
  );
}
