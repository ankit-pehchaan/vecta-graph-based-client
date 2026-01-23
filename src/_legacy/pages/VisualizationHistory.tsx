import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';
import VisualizationDetailModal from '../components/VisualizationDetailModal';
import {
  getVisualizationHistory,
  getVisualizationDetail,
  trackVisualizationInteraction,
} from '../services/api';
import type {
  VisualizationHistoryItem,
  VisualizationDetailResponse,
} from '../services/api';

const LIMIT = 20;

export default function VisualizationHistory() {
  const navigate = useNavigate();
  const { logout, loading: authLoading, isAuthenticated } = useAuth();

  const [items, setItems] = useState<VisualizationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedViz, setSelectedViz] = useState<VisualizationDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      if (!isAuthenticated) return;

      setLoading(offset === 0);
      setLoadingMore(offset > 0);
      setError(null);

      try {
        const response = await getVisualizationHistory(LIMIT, offset);
        if (offset === 0) {
          setItems(response.visualizations);
        } else {
          setItems((prev) => [...prev, ...response.visualizations]);
        }
        setTotalCount(response.count);
      } catch (err) {
        console.error('Failed to load visualization history:', err);
        setError('Failed to load visualization history');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    loadHistory();
  }, [isAuthenticated, offset]);

  const handleViewViz = async (vizId: string) => {
    setLoadingDetail(true);
    try {
      // Track interaction
      trackVisualizationInteraction(vizId).catch(console.error);

      const detail = await getVisualizationDetail(vizId);
      setSelectedViz(detail);
    } catch (err) {
      console.error('Failed to load visualization detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      // Error handling is done in the auth context
    }
  };

  const hasMore = items.length < totalCount;

  const formatChartType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  const getChartTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'line':
      case 'area':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'bar':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'table':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'scorecard':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'timeline':
        return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  // Render sidebar
  const renderSidebar = () => (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Vecta</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('/financial-profile'); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Financial Profile
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Visualization History
        </a>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          disabled={authLoading}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="flex">
          {renderSidebar()}
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Visualization History</h1>
              <div className="flex justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="flex">
          {renderSidebar()}
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Visualization History</h1>
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => setOffset(0)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="flex">
          {renderSidebar()}
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Visualization History</h1>
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No visualizations yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  Start chatting with your financial adviser to generate visualizations
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="flex">
        {renderSidebar()}

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visualization History</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {totalCount} visualization{totalCount !== 1 ? 's' : ''} generated
              </p>
            </div>

            {/* Grid of visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.viz_id}
                  onClick={() => handleViewViz(item.viz_id)}
                  className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate" title={item.title}>
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5" title={item.subtitle}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getChartTypeBadgeColor(item.viz_type)}`}>
                      {formatChartType(item.viz_type)}
                    </span>
                    {item.calc_kind && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {item.calc_kind}
                      </span>
                    )}
                    {item.parent_viz_id && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        Follow-up
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
                    <span>
                      {new Date(item.created_at).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {item.helpfulness_score !== null && (
                      <span>Score: {(item.helpfulness_score * 100).toFixed(0)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load more / Pagination */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setOffset((prev) => prev + LIMIT)}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></span>
                      Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedViz && (
        <VisualizationDetailModal
          detail={selectedViz}
          onClose={() => setSelectedViz(null)}
        />
      )}

      {/* Loading overlay for detail fetch */}
      {loadingDetail && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-950 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></span>
              <span className="text-gray-700 dark:text-gray-300">Loading visualization...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
