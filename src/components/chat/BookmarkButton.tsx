"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

interface BookmarkButtonProps {
  title: string;
  description: string;
  chartType: string;
  data: Record<string, any>;
  config: Record<string, any>;
}

export default function BookmarkButton({
  title,
  description,
  chartType,
  data,
  config,
}: BookmarkButtonProps) {
  const { bookmarks, addBookmark, removeBookmark } = useApp();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const found = bookmarks.find((b) => b.title === title && b.chartType === chartType);
    setIsBookmarked(!!found);
  }, [bookmarks, title, chartType]);

  const handleToggle = () => {
    if (isBookmarked) {
      const bookmark = bookmarks.find((b) => b.title === title && b.chartType === chartType);
      if (bookmark) {
        removeBookmark(bookmark.id);
        setToastMessage("Removed from bookmarks");
      }
    } else {
      addBookmark({ title, description, chartType, data, config });
      setToastMessage("Saved to bookmarks");
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className={`p-2 rounded-lg transition-all ${
          isBookmarked
            ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
        }`}
        title={isBookmarked ? "Remove bookmark" : "Save to bookmarks"}
      >
        <svg
          className="w-5 h-5"
          fill={isBookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>
      
      {/* Toast notification */}
      {showToast && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap animate-fade-in-up shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

