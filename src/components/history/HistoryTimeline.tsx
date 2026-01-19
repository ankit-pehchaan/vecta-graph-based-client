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

interface HistoryTimelineProps {
  events: TimelineEvent[];
}

export default function HistoryTimeline({ events }: HistoryTimelineProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-AU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Group events by date
  const groupedEvents: Map<string, TimelineEvent[]> = new Map();
  events.forEach((event) => {
    const dateKey = new Intl.DateTimeFormat("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(event.timestamp);
    
    if (!groupedEvents.has(dateKey)) {
      groupedEvents.set(dateKey, []);
    }
    groupedEvents.get(dateKey)!.push(event);
  });

  return (
    <div className="space-y-8">
      {Array.from(groupedEvents.entries()).map(([date, dayEvents]) => (
        <div key={date}>
          <div className="sticky top-0 bg-slate-50 py-2 z-10">
            <h3 className="text-sm font-semibold text-slate-500">{date}</h3>
          </div>
          
          <div className="space-y-3 mt-3">
            {dayEvents.map((event, idx) => (
              <div
                key={event.id}
                className={`bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                  event.isConflict
                    ? "border-amber-200 bg-gradient-to-r from-amber-50/50 to-transparent"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                      {formatNodeName(event.node)}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {formatFieldName(event.field)}
                    </span>
                    {event.isConflict && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Updated
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(event.timestamp)}</span>
                </div>

                <div className="flex items-center gap-3">
                  {event.previousValue !== undefined && event.previousValue !== null && (
                    <>
                      <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Previous</p>
                        <p className="text-sm text-slate-500 line-through">{formatValue(event.previousValue)}</p>
                      </div>
                      <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                  <div className={`flex-1 rounded-lg p-2 border ${
                    event.previousValue !== undefined 
                      ? "bg-emerald-50 border-emerald-100" 
                      : "bg-slate-50 border-slate-100"
                  }`}>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      {event.previousValue !== undefined ? "New Value" : "Value"}
                    </p>
                    <p className={`text-sm font-medium ${
                      event.previousValue !== undefined ? "text-emerald-700" : "text-slate-700"
                    }`}>
                      {formatValue(event.value)}
                    </p>
                  </div>
                </div>

                {event.source && event.source !== "collected" && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      Source: <span className="capitalize">{event.source.replace(/_/g, " ")}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatNodeName(name: string): string {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFieldName(name: string): string {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

