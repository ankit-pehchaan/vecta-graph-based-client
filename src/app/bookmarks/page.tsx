"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { useApp } from "@/contexts/AppContext";
import Chart from "@/components/Chart";

export default function BookmarksPage() {
  const { sessionId, status, bookmarks, removeBookmark } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBookmark, setSelectedBookmark] = useState<typeof bookmarks[0] | null>(null);

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.chartType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-AU", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <DashboardLayout sessionId={sessionId} status={status}>
      <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Saved Insights</h1>
            <p className="text-slate-500 mt-1">Your bookmarked visualizations and charts</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookmarks..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredBookmarks.length === 0 ? (
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
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {searchTerm ? "No matching bookmarks" : "No bookmarks yet"}
            </h3>
            <p className="text-slate-500 max-w-md">
              {searchTerm
                ? "Try a different search term"
                : "When Vecta shows you visualizations in the chat, click the bookmark icon to save them here for later reference."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedBookmark(bookmark)}
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <div className="h-40">
                    <Chart
                      chartType={bookmark.chartType}
                      data={bookmark.data}
                      title=""
                      config={{ ...bookmark.config, plugins: { legend: { display: false }, title: { display: false } } }}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-1">{bookmark.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(bookmark.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{bookmark.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="capitalize px-2 py-1 bg-slate-100 rounded">
                      {bookmark.chartType.replace(/_/g, " ")}
                    </span>
                    <span>{formatDate(bookmark.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pb-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                onClick={() => setSelectedBookmark(bookmark)}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-24 h-16 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                  <Chart
                    chartType={bookmark.chartType}
                    data={bookmark.data}
                    title=""
                    config={{
                      ...bookmark.config,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false }, title: { display: false } },
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{bookmark.title}</h3>
                  <p className="text-sm text-slate-500 truncate">{bookmark.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-xs text-slate-400 capitalize px-2 py-1 bg-slate-100 rounded">
                    {bookmark.chartType.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(bookmark.timestamp)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(bookmark.id);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedBookmark && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setSelectedBookmark(null)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedBookmark.title}</h2>
                  <p className="text-slate-500 mt-1">{selectedBookmark.description}</p>
                </div>
                <button
                  onClick={() => setSelectedBookmark(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <Chart
                    chartType={selectedBookmark.chartType}
                    data={selectedBookmark.data}
                    title={selectedBookmark.title}
                    config={selectedBookmark.config}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="capitalize px-3 py-1 bg-white rounded-lg border border-slate-200">
                    {selectedBookmark.chartType.replace(/_/g, " ")}
                  </span>
                  <span>Saved {formatDate(selectedBookmark.timestamp)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      removeBookmark(selectedBookmark.id);
                      setSelectedBookmark(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedBookmark(null)}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

