import type { IntelligenceSummaryMessage } from '../services/api';

interface IntelligenceSummaryProps {
  summary: IntelligenceSummaryMessage | null;
}

export default function IntelligenceSummary({ summary }: IntelligenceSummaryProps) {
  if (!summary) {
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
      </div>

      <p className="text-sm text-gray-700 mb-3">{summary.summary}</p>

      {summary.insights && summary.insights.length > 0 && (
        <ul className="space-y-2">
          {summary.insights.map((insight, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      )}

      {summary.timestamp && (
        <p className="text-xs text-gray-400 mt-3">
          Generated: {new Date(summary.timestamp).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}

