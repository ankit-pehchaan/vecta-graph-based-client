"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout";
import { useApp } from "@/contexts/AppContext";
import { HistoryTimeline, FieldHistoryCard, HistoryChart } from "@/components/history";
import { getFieldHistory, type FieldHistoryEntry } from "@/lib/api";

export default function HistoryPage() {
  const { sessionId, status, collectedData, fieldHistory, setFieldHistory } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // Fetch field history from server
  useEffect(() => {
    async function fetchHistory() {
      if (!sessionId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getFieldHistory(sessionId);
        setFieldHistory(data.field_history);
      } catch (err) {
        // History endpoint might not exist yet - use mock data from collectedData
        console.log("Field history endpoint not available, using collected data");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [sessionId, setFieldHistory]);

  // Build timeline from field history or collected data
  const timelineEvents = useMemo(() => {
    const events: Array<{
      id: string;
      node: string;
      field: string;
      value: any;
      previousValue?: any;
      timestamp: Date;
      source?: string;
      isConflict?: boolean;
    }> = [];

    // Use field history if available
    if (Object.keys(fieldHistory).length > 0) {
      Object.entries(fieldHistory).forEach(([node, fields]) => {
        Object.entries(fields).forEach(([field, history]) => {
          (history as FieldHistoryEntry[]).forEach((entry, idx) => {
            events.push({
              id: `${node}-${field}-${idx}`,
              node,
              field,
              value: entry.value,
              previousValue: entry.previous_value,
              timestamp: new Date(entry.timestamp),
              source: entry.source,
              isConflict: entry.conflict_resolved,
            });
          });
        });
      });
    } else {
      // Fallback: create events from collected data (no history, just current state)
      Object.entries(collectedData).forEach(([node, fields]) => {
        Object.entries(fields).forEach(([field, value]) => {
          events.push({
            id: `${node}-${field}`,
            node,
            field,
            value,
            timestamp: new Date(), // Current time as fallback
            source: "collected",
          });
        });
      });
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [fieldHistory, collectedData]);

  const nodes = useMemo(() => {
    const nodeSet = new Set(timelineEvents.map((e) => e.node));
    return Array.from(nodeSet);
  }, [timelineEvents]);

  const filteredEvents = useMemo(() => {
    let filtered = timelineEvents;
    if (selectedNode) {
      filtered = filtered.filter((e) => e.node === selectedNode);
    }
    if (selectedField) {
      filtered = filtered.filter((e) => e.field === selectedField);
    }
    return filtered;
  }, [timelineEvents, selectedNode, selectedField]);

  const fieldsForSelectedNode = useMemo(() => {
    if (!selectedNode) return [];
    const fieldSet = new Set(
      timelineEvents.filter((e) => e.node === selectedNode).map((e) => e.field)
    );
    return Array.from(fieldSet);
  }, [timelineEvents, selectedNode]);

  return (
    <DashboardLayout sessionId={sessionId} status={status}>
      <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Life History</h1>
            <p className="text-slate-500 mt-1">Track changes to your financial data over time</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Node Filter */}
            <select
              value={selectedNode || ""}
              onChange={(e) => {
                setSelectedNode(e.target.value || null);
                setSelectedField(null);
              }}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Sections</option>
              {nodes.map((node) => (
                <option key={node} value={node}>
                  {formatNodeName(node)}
                </option>
              ))}
            </select>

            {/* Field Filter */}
            {selectedNode && fieldsForSelectedNode.length > 0 && (
              <select
                value={selectedField || ""}
                onChange={(e) => setSelectedField(e.target.value || null)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Fields</option>
                {fieldsForSelectedNode.map((field) => (
                  <option key={field} value={field}>
                    {formatFieldName(field)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-sm text-slate-500">Total Events</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{timelineEvents.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-sm text-slate-500">Sections</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{nodes.length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-600">Conflicts Resolved</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">
              {timelineEvents.filter((e) => e.isConflict).length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-sm text-indigo-600">Latest Update</p>
            <p className="text-lg font-bold text-indigo-900 mt-1">
              {timelineEvents.length > 0
                ? formatTimeAgo(timelineEvents[0].timestamp)
                : "No data"}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading history...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-rose-600">
              <p>{error}</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No history yet</h3>
            <p className="text-slate-500 max-w-md">
              As you share information with Vecta, your data history will appear here showing how values have changed over time.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Timeline */}
            <div className="flex-1 overflow-y-auto">
              <HistoryTimeline events={filteredEvents} />
            </div>

            {/* Side panel - Field details */}
            {selectedNode && selectedField && (
              <div className="w-80 flex-shrink-0">
                <FieldHistoryCard
                  node={selectedNode}
                  field={selectedField}
                  events={filteredEvents.filter(
                    (e) => e.node === selectedNode && e.field === selectedField
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
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

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

