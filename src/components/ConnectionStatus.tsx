"use client";

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected" | "error";
  sessionId: string | null;
}

export default function ConnectionStatus({ status, sessionId }: ConnectionStatusProps) {
  const statusConfig = {
    connecting: {
      color: "bg-amber-400",
      text: "Connecting...",
      pulse: true,
      bg: "bg-amber-50 border-amber-200",
      textColor: "text-amber-700",
    },
    connected: {
      color: "bg-emerald-400",
      text: "Connected",
      pulse: false,
      bg: "bg-emerald-50 border-emerald-200",
      textColor: "text-emerald-700",
    },
    disconnected: {
      color: "bg-slate-400",
      text: "Disconnected",
      pulse: false,
      bg: "bg-slate-50 border-slate-200",
      textColor: "text-slate-600",
    },
    error: {
      color: "bg-red-400",
      text: "Error",
      pulse: false,
      bg: "bg-red-50 border-red-200",
      textColor: "text-red-700",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-3 px-3 py-2 rounded-xl border ${config.bg} shadow-sm`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? "animate-pulse" : ""}`} />
        <span className={`text-xs font-medium ${config.textColor}`}>{config.text}</span>
      </div>
      
      {sessionId && (
        <div className="pl-3 border-l border-slate-200">
          <span className="text-xs font-mono text-slate-500" title={sessionId}>
            {sessionId.slice(0, 8)}
          </span>
        </div>
      )}
    </div>
  );
}
