import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { getFinancialProfile } from '../services/api';
import type { Asset, Liability } from '../services/api';

export default function FinancialProfile() {
  const navigate = useNavigate();
  const { logout, loading: authLoading, isAuthenticated } = useAuth();
  const { profile: wsProfile, setProfile } = useWebSocketContext();
  const [fetching, setFetching] = useState(false);
  const fetchedRef = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load profile from REST API only if we don't have a cached profile yet
  useEffect(() => {
    const loadProfile = async () => {
      // Only fetch if:
      // 1. We're authenticated
      // 2. We don't already have a cached profile
      // 3. We haven't already fetched in this session
      if (!isAuthenticated || wsProfile !== null || fetchedRef.current) {
        return;
      }

      fetchedRef.current = true;
      setFetching(true);

      try {
        const profileData = await getFinancialProfile();
        if (profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, wsProfile, setProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      // Error handling is done in the auth context
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatAssetType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Use wsProfile (updated in real-time via WS)
  const profile = wsProfile;

  // Calculate totals
  const totalAssets = profile?.assets.reduce((sum, asset) => sum + (asset.value || 0), 0) || 0;
  const totalLiabilities = profile?.liabilities.reduce((sum, liability) => sum + (liability.amount || 0), 0) || 0;
  const cashBalance = profile?.cash_balance || 0;
  const totalSuperannuation = profile?.superannuation?.reduce((sum, super_) => sum + (super_.balance || 0), 0) || 0;
  const netWorth = totalAssets + cashBalance + totalSuperannuation - totalLiabilities;

  // Group assets by type
  const assetsByType = profile?.assets.reduce((acc, asset) => {
    const type = asset.asset_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>) || {};

  // Group liabilities by type
  const liabilitiesByType = profile?.liabilities.reduce((acc, liability) => {
    const type = liability.liability_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(liability);
    return acc;
  }, {} as Record<string, Liability[]>) || {};

  // Render sidebar (shared between states)
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
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Financial Profile
        </a>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
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

  // Show empty state if no profile yet (first-time user or fetching)
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="flex">
          {renderSidebar()}

          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Financial Profile</h1>
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                {fetching ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 dark:text-gray-400">Profile will be built as you chat with your financial adviser.</p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </>
                )}
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

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Financial Profile</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive view of your financial information</p>
            </div>

            {/* Net Worth Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Net Worth</p>
                  <p className="text-4xl font-bold">{formatCurrency(netWorth)}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm mb-1">Last Updated</p>
                  <p className="text-sm">
                    {profile.updated_at
                      ? new Date(profile.updated_at).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAssets)}</p>
              </div>
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Cash Balance</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(cashBalance)}</p>
              </div>
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Superannuation</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalSuperannuation)}</p>
              </div>
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Liabilities</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalLiabilities)}</p>
              </div>
            </div>

            {/* Goals Section */}
            {profile.goals.length > 0 && (
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Financial Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.goals.map((goal, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">{goal.description || 'Financial goal'}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {goal.amount && (
                          <span className="bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                            Target: {formatCurrency(goal.amount)}
                          </span>
                        )}
                        {goal.timeline_years && (
                          <span className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-100 px-2 py-1 rounded">
                            {goal.timeline_years} years
                          </span>
                        )}
                        {goal.priority && (
                          <span
                            className={`px-2 py-1 rounded ${
                              goal.priority === 'High'
                                ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                : goal.priority === 'Medium'
                                ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                            }`}
                          >
                            {goal.priority}
                          </span>
                        )}
                      </div>
                      {goal.motivation && (
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 italic">"{goal.motivation}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assets Section */}
            {Object.keys(assetsByType).length > 0 && (
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assets</h2>
                <div className="space-y-6">
                  {Object.entries(assetsByType).map(([type, assets]) => (
                    <div key={type}>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {formatAssetType(type)} ({assets.length})
                      </h3>
                      <div className="space-y-3">
                        {assets.map((asset, idx) => (
                          <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{asset.description || asset.asset_type?.replace(/_/g, ' ') || 'Asset'}</p>
                                {asset.institution && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{asset.institution}</p>
                                )}
                              </div>
                              {asset.value && (
                                <span className="font-bold text-gray-900 dark:text-white text-lg ml-4">
                                  {formatCurrency(asset.value)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Subtotal</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(assets.reduce((sum, a) => sum + (a.value || 0), 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Assets</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Liabilities Section */}
            {Object.keys(liabilitiesByType).length > 0 && (
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Liabilities</h2>
                <div className="space-y-6">
                  {Object.entries(liabilitiesByType).map(([type, liabilities]) => (
                    <div key={type}>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {formatAssetType(type)} ({liabilities.length})
                      </h3>
                      <div className="space-y-3">
                        {liabilities.map((liability, idx) => (
                          <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white">{liability.description || liability.liability_type?.replace(/_/g, ' ') || 'Liability'}</p>
                                {liability.institution && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{liability.institution}</p>
                                )}
                                <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  {liability.interest_rate !== undefined && liability.interest_rate !== null && (
                                    <span>Rate: {liability.interest_rate}%</span>
                                  )}
                                  {liability.monthly_payment !== undefined && liability.monthly_payment !== null && (
                                    <span>Payment: {formatCurrency(liability.monthly_payment)}/mo</span>
                                  )}
                                </div>
                              </div>
                              {liability.amount && (
                                <span className="font-bold text-red-600 dark:text-red-400 text-lg ml-4">
                                  {formatCurrency(liability.amount)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Subtotal</span>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(liabilities.reduce((sum, l) => sum + (l.amount || 0), 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total Liabilities</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(totalLiabilities)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Section */}
            {profile.insurance.length > 0 && (
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Insurance Policies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.insurance.map((policy, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatAssetType(policy.insurance_type ?? 'insurance')}</p>
                          {policy.provider && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{policy.provider}</p>}
                        </div>
                        {policy.coverage_amount && (
                          <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(policy.coverage_amount)}</span>
                        )}
                      </div>
                      {policy.monthly_premium && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Premium</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(policy.monthly_premium)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Income & Expenses */}
            {(profile.income || profile.monthly_income || profile.expenses) && (
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Income & Expenses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.income && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Annual Income</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(profile.income)}</p>
                    </div>
                  )}
                  {profile.monthly_income && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Monthly Income</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(profile.monthly_income)}</p>
                    </div>
                  )}
                  {profile.expenses && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Monthly Expenses</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(profile.expenses)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Tolerance */}
            {profile.risk_tolerance && (
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Risk Profile</h2>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400">Risk Tolerance:</span>
                  <span
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      profile.risk_tolerance === 'High'
                        ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                        : profile.risk_tolerance === 'Medium'
                        ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                    }`}
                  >
                    {profile.risk_tolerance}
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
