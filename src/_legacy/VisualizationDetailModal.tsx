import { useEffect } from 'react';
import VisualizationCard from './VisualizationCard';
import type { VisualizationDetailResponse, VisualizationMessage } from '../services/api';

interface VisualizationDetailModalProps {
  detail: VisualizationDetailResponse;
  onClose: () => void;
}

export default function VisualizationDetailModal({
  detail,
  onClose,
}: VisualizationDetailModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const downloadAsCSV = (viz: VisualizationMessage) => {
    if (!viz.series || viz.series.length === 0) return;

    // Build CSV with all series
    const firstSeries = viz.series[0];
    const headers = ['x', ...viz.series.map((s) => s.name)];
    const rows = firstSeries.data.map((_, i) => {
      const rowValues = [
        String(firstSeries.data[i].x),
        ...viz.series!.map((s) => String(s.data[i]?.y ?? '')),
      ];
      return rowValues.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viz.title.replace(/\s+/g, '_')}_${viz.viz_id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsJSON = (viz: VisualizationMessage) => {
    const blob = new Blob([JSON.stringify(viz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viz.title.replace(/\s+/g, '_')}_${viz.viz_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasSeriesData = detail.data.series && detail.data.series.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div
          className="bg-white dark:bg-gray-950 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {detail.title}
              </h2>
              {detail.subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{detail.subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Visualization */}
            <VisualizationCard viz={detail.data} />

            {/* Metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
                {detail.viz_type}
              </span>
              {detail.calc_kind && (
                <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                  {detail.calc_kind}
                </span>
              )}
              {detail.parent_viz_id && (
                <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                  Follow-up
                </span>
              )}
              <span className="text-xs">
                Created: {new Date(detail.created_at).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Download buttons */}
            <div className="mt-6 flex gap-3">
              {hasSeriesData && (
                <button
                  onClick={() => downloadAsCSV(detail.data)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV
                </button>
              )}
              <button
                onClick={() => downloadAsJSON(detail.data)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
