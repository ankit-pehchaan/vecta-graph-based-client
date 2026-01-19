"use client";

import { usePathname } from "next/navigation";

interface TopBarProps {
  sessionId: string | null;
  status: "connecting" | "connected" | "disconnected" | "error";
  sidebarCollapsed: boolean;
}

const pageTitle: Record<string, string> = {
  "/": "Chat with Vecta",
  "/goals": "Financial Goals",
  "/profile": "Financial Profile",
  "/history": "Life History",
  "/bookmarks": "Saved Insights",
};

export default function TopBar({ sessionId, status, sidebarCollapsed }: TopBarProps) {
  const pathname = usePathname();
  const title = pageTitle[pathname] || "Dashboard";

  const statusConfig = {
    connecting: {
      color: "bg-amber-400",
      text: "Connecting...",
      pulse: true,
    },
    connected: {
      color: "bg-emerald-400",
      text: "Connected",
      pulse: false,
    },
    disconnected: {
      color: "bg-slate-400",
      text: "Disconnected",
      pulse: false,
    },
    error: {
      color: "bg-red-400",
      text: "Error",
      pulse: false,
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-30 transition-all duration-300 ${
        sidebarCollapsed ? "left-[72px]" : "left-[240px]"
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Page Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            <div className={`w-2 h-2 rounded-full ${currentStatus.color} ${currentStatus.pulse ? "animate-pulse" : ""}`} />
            <span className="text-xs font-medium text-slate-600">{currentStatus.text}</span>
          </div>

          {/* Session ID */}
          {sessionId && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-xs font-mono text-indigo-600 truncate max-w-[100px]">{sessionId.slice(0, 8)}</span>
            </div>
          )}

          {/* New Session Button */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>
    </header>
  );
}

