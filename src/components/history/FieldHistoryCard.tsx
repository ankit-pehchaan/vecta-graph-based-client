"use client";

interface TimelineEvent {
  id: string;
  node: string;
  field: string;
  value: any;
  previousValue?: any;
  timestamp: Date;
  source?: string;
  isConflict?: boolean;
}

interface FieldHistoryCardProps {
  node: string;
  field: string;
  events: TimelineEvent[];
}

export default function FieldHistoryCard({ node, field, events }: FieldHistoryCardProps) {
  const currentValue = events[0]?.value;
  const changeCount = events.filter((e) => e.previousValue !== undefined).length;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") {
      if (value >= 1000) {
        return new Intl.NumberFormat("en-AU", {
          style: "currency",
          currency: "AUD",
          minimumFractionDigits: 0,
        }).format(value);
      }
      return value.toLocaleString();
    }
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-AU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-0">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          {formatNodeName(node)}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{formatFieldName(field)}</h3>
      </div>

      {/* Current Value */}
      <div className="p-4 border-b border-slate-100">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Value</p>
        <p className="text-2xl font-bold text-slate-900">{formatValue(currentValue)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{events.length}</p>
          <p className="text-xs text-slate-500">Total Updates</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{changeCount}</p>
          <p className="text-xs text-slate-500">Value Changes</p>
        </div>
      </div>

      {/* History */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Change History
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {events.map((event, idx) => (
            <div
              key={event.id}
              className={`relative pl-4 pb-3 ${
                idx !== events.length - 1 ? "border-l-2 border-slate-200" : ""
              }`}
            >
              <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-indigo-500 -translate-x-[3px]" />
              <div className="text-xs text-slate-400 mb-1">{formatDate(event.timestamp)}</div>
              <div className="flex items-center gap-2">
                {event.previousValue !== undefined && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      {formatValue(event.previousValue)}
                    </span>
                    <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
                <span className={`text-sm font-medium ${event.previousValue !== undefined ? "text-emerald-600" : "text-slate-700"}`}>
                  {formatValue(event.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatNodeName(name: string): string {
  return name.replace(/_/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function formatFieldName(name: string): string {
  return name.replace(/_/g, " ").split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

