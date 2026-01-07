import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import chart components (keep existing charts from VisualizationCard)
// We'll use the existing chart implementations

export interface VisualizationData {
  type: string;
  title?: string;
  description?: string;
  
  // For CHARTS ONLY
  points?: Array<{ label?: string; value?: number; hover?: string; x?: any; y?: any }>;
  x_axis?: string;
  y_axis?: string;
  
  // For NON-CHART CONTENT (tables, scenarios, boards, notes, timelines)
  markdown_content?: string;
  html_content?: string;
  
  // Universal
  summary?: string;
  metadata?: Record<string, any>;
}

export default function VisualizationRenderer({ data }: { data: VisualizationData }) {
  const isChartType = useMemo(() => {
    const chartTypes = ['line', 'bar', 'pie', 'donut', 'area', 'stacked_bar', 'grouped_bar', 'scatter'];
    return chartTypes.includes(data.type?.toLowerCase() || '');
  }, [data.type]);

  const vizComponent = useMemo(() => {
    const type = data.type?.toLowerCase();

    // CHARTS - Use existing implementations from VisualizationCard
    if (isChartType) {
      // For now, show placeholder until we integrate with existing charts
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-gray-600">Chart: {type}</p>
          <p className="text-xs text-gray-500 mt-1">{data.points?.length || 0} data points</p>
        </div>
      );
    }

    // NON-CHART CONTENT - Render markdown or HTML
    if (data.markdown_content) {
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-gray-50" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-3 text-sm text-gray-900 border-t border-gray-200" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside space-y-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-sm text-gray-700" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-sm text-gray-700 mb-3" {...props} />
              ),
              h1: ({ node, ...props }) => (
                <h1 className="text-xl font-bold text-gray-900 mb-3" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-lg font-semibold text-gray-900 mb-2" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-base font-semibold text-gray-900 mb-2" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-gray-900" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
              ),
            }}
          >
            {data.markdown_content}
          </ReactMarkdown>
        </div>
      );
    }

    if (data.html_content) {
      return (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: data.html_content }}
        />
      );
    }

    return (
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
        No content to display
      </div>
    );
  }, [data, isChartType]);

  return (
    <div className="visualization-wrapper rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      {(data.title || data.description) && (
        <div className="px-4 py-3 border-b border-gray-100">
          {data.title && (
            <h3 className="text-base font-semibold text-gray-900">{data.title}</h3>
          )}
          {data.description && (
            <p className="text-sm text-gray-600 mt-1">{data.description}</p>
          )}
        </div>
      )}

      {/* Visualization Body */}
      <div className="p-4">
        {vizComponent}
      </div>

      {/* Footer - Summary */}
      {data.summary && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-700">{data.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

