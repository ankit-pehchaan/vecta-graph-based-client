import { useState, useEffect, useRef } from 'react';
import type { IntelligenceSummaryMessage } from '../services/api';

interface IntelligenceSummaryProps {
  summary: IntelligenceSummaryMessage | null;
}

export default function IntelligenceSummary({ summary }: IntelligenceSummaryProps) {
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIdRef = useRef<string | null>(null);

  // Handle streaming intelligence summary
  useEffect(() => {
    if (!summary) return;

    // Generate a unique stream ID based on timestamp
    const currentStreamId = summary.timestamp || Date.now().toString();

    if (summary.is_complete) {
      // Stream complete
      setIsStreaming(false);
      streamIdRef.current = null;
    } else if (summary.content) {
      // Check if this is a new stream
      if (streamIdRef.current === null) {
        // New stream - reset content
        streamIdRef.current = currentStreamId;
        setStreamingContent(summary.content);
        setIsStreaming(true);
      } else {
        // Continue existing stream
        setStreamingContent((prev) => prev + summary.content);
      }
    }
  }, [summary]);

  const displayContent = streamingContent || '';

  if (!summary && !displayContent) {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900">Intelligence Summary</h3>
        </div>
        <p className="text-sm text-gray-500">AI insights will appear here as you chat...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3 className="text-sm font-semibold text-gray-900">Intelligence Summary</h3>
        {isStreaming && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full animate-pulse">
            Analyzing...
          </span>
        )}
      </div>

      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {displayContent}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-0.5" />
        )}
      </div>

      {!isStreaming && summary?.timestamp && (
        <p className="text-xs text-gray-400 mt-3">
          Updated: {new Date(summary.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}
    </div>
  );
}
