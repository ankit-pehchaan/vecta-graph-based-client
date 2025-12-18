import { useEffect, useState } from 'react';
import type { FinancialProfile, ProfileUpdateMessage, Asset, Liability, Insurance, Goal, Superannuation } from '../services/api';

interface ProfilePanelProps {
  profile: FinancialProfile | null;
  onProfileUpdate?: (update: ProfileUpdateMessage) => void;
}

type TabType = 'Overview' | 'Assets' | 'Liabilities' | 'Cash' | 'Insurance' | 'Goals';

export default function ProfilePanel({ profile, onProfileUpdate }: ProfilePanelProps) {
  const [localProfile, setLocalProfile] = useState<FinancialProfile | null>(profile);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (onProfileUpdate) {
      // This will be called from parent when profile updates arrive
    }
  }, [onProfileUpdate]);

  if (!localProfile) {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Financial Profile</h3>
        <p className="text-sm text-gray-500">Profile will be built as you chat...</p>
      </div>
    );
  }

  // Calculate totals
  const totalAssets = localProfile.assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalLiabilities = localProfile.liabilities.reduce(
    (sum, liability) => sum + (liability.amount || 0),
    0
  );
  const totalSuperannuation = localProfile.superannuation?.reduce((sum, super_) => sum + (super_.balance || 0), 0) || 0;
  const netWorth = totalAssets + (localProfile.cash_balance || 0) + totalSuperannuation - totalLiabilities;

  // Calculate profile completion
  const factsCollected = calculateFactsCollected(localProfile);
  const profileCompletion = calculateProfileCompletion(localProfile);

  // Group assets by type
  const assetsByType = localProfile.assets.reduce((acc, asset) => {
    const type = asset.asset_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  // Group liabilities by type
  const liabilitiesByType = localProfile.liabilities.reduce((acc, liability) => {
    const type = liability.liability_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(liability);
    return acc;
  }, {} as Record<string, Liability[]>);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatAssetType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Financial Summary with Tabs */}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Financial Profile</h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-200 pb-2 overflow-x-auto">
          {(['Overview', 'Assets', 'Liabilities', 'Cash', 'Insurance', 'Goals'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'Overview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Net Worth</span>
                <span className="font-semibold text-gray-900 text-lg">
                  {formatCurrency(netWorth)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Total Assets</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalAssets)}
                </span>
              </div>

              {localProfile.cash_balance !== undefined && localProfile.cash_balance !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Cash Balance</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(localProfile.cash_balance)}
                  </span>
                </div>
              )}

              {totalSuperannuation > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Superannuation</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(totalSuperannuation)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Total Liabilities</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalLiabilities)}
                </span>
              </div>

              {localProfile.income && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Annual Income</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(localProfile.income)}
                  </span>
                </div>
              )}

              {localProfile.monthly_income && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Monthly Income</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(localProfile.monthly_income)}
                  </span>
                </div>
              )}

              {localProfile.expenses && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Monthly Expenses</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(localProfile.expenses)}
                  </span>
                </div>
              )}

              {localProfile.risk_tolerance && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Risk Tolerance</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      localProfile.risk_tolerance === 'High'
                        ? 'bg-red-100 text-red-700'
                        : localProfile.risk_tolerance === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {localProfile.risk_tolerance}
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Assets' && (
            <div className="space-y-4">
              {Object.keys(assetsByType).length === 0 ? (
                <p className="text-sm text-gray-500">No assets recorded yet.</p>
              ) : (
                Object.entries(assetsByType).map(([type, assets]) => (
                  <div key={type} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      {formatAssetType(type)} ({assets.length})
                    </h4>
                    <div className="space-y-2">
                      {assets.map((asset, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">{asset.description || formatAssetType(asset.asset_type || 'other')}</p>
                              {asset.institution && (
                                <p className="text-gray-500 text-xs">{asset.institution}</p>
                              )}
                              {asset.account_number && (
                                <p className="text-gray-400 text-xs">Account: {asset.account_number}</p>
                              )}
                            </div>
                            {asset.value !== undefined && asset.value !== null && (
                              <span className="font-semibold text-gray-900 ml-2">
                                {formatCurrency(asset.value)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(assets.reduce((sum, a) => sum + (a.value || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {totalAssets > 0 && (
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total Assets</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(totalAssets)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Liabilities' && (
            <div className="space-y-4">
              {Object.keys(liabilitiesByType).length === 0 ? (
                <p className="text-sm text-gray-500">No liabilities recorded yet.</p>
              ) : (
                Object.entries(liabilitiesByType).map(([type, liabilities]) => (
                  <div key={type} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      {formatAssetType(type)} ({liabilities.length})
                    </h4>
                    <div className="space-y-2">
                      {liabilities.map((liability, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">{liability.description || formatAssetType(liability.liability_type || 'other')}</p>
                              {liability.institution && (
                                <p className="text-gray-500 text-xs">{liability.institution}</p>
                              )}
                              {liability.account_number && (
                                <p className="text-gray-400 text-xs">Account: {liability.account_number}</p>
                              )}
                              <div className="flex gap-3 mt-1">
                                {liability.interest_rate !== undefined && liability.interest_rate !== null && (
                                  <span className="text-gray-500 text-xs">
                                    Rate: {liability.interest_rate}%
                                  </span>
                                )}
                                {liability.monthly_payment !== undefined && liability.monthly_payment !== null && (
                                  <span className="text-gray-500 text-xs">
                                    Payment: {formatCurrency(liability.monthly_payment)}/mo
                                  </span>
                                )}
                              </div>
                            </div>
                            {liability.amount !== undefined && liability.amount !== null && (
                              <span className="font-semibold text-red-600 ml-2">
                                {formatCurrency(liability.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(liabilities.reduce((sum, l) => sum + (l.amount || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {totalLiabilities > 0 && (
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total Liabilities</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(totalLiabilities)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Cash' && (
            <div className="space-y-3">
              {localProfile.cash_balance !== undefined && localProfile.cash_balance !== null ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 text-sm font-medium">Cash Balance</span>
                    <span className="font-semibold text-blue-900 text-lg">
                      {formatCurrency(localProfile.cash_balance)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Total cash in bank accounts and savings
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No cash balance recorded yet.</p>
              )}

              {localProfile.superannuation && localProfile.superannuation.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Superannuation</h4>
                  <div className="space-y-2">
                    {localProfile.superannuation.map((super_, idx) => (
                      <div key={super_.id || idx} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {super_.fund_name || 'Superannuation Fund'}
                            </p>
                            {super_.investment_option && (
                              <p className="text-xs text-gray-500">{super_.investment_option}</p>
                            )}
                            <div className="flex gap-3 mt-1">
                              {super_.employer_contribution_rate !== undefined && super_.employer_contribution_rate !== null && (
                                <span className="text-xs text-gray-500">
                                  Employer: {super_.employer_contribution_rate}%
                                </span>
                              )}
                              {super_.personal_contribution_rate !== undefined && super_.personal_contribution_rate !== null && (
                                <span className="text-xs text-gray-500">
                                  Personal: {super_.personal_contribution_rate}%
                                </span>
                              )}
                            </div>
                          </div>
                          {super_.balance !== undefined && super_.balance !== null && (
                            <span className="font-semibold text-green-900 ml-2">
                              {formatCurrency(super_.balance)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalSuperannuation > 0 && localProfile.superannuation.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Total Superannuation</span>
                        <span className="font-semibold text-green-900">
                          {formatCurrency(totalSuperannuation)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Insurance' && (
            <div className="space-y-3">
              {localProfile.insurance.length === 0 ? (
                <p className="text-sm text-gray-500">No insurance policies recorded yet.</p>
              ) : (
                localProfile.insurance.map((policy, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatAssetType(policy.insurance_type || 'other')}
                        </p>
                        {policy.provider && (
                          <p className="text-xs text-gray-500">{policy.provider}</p>
                        )}
                        {policy.policy_number && (
                          <p className="text-xs text-gray-400">Policy: {policy.policy_number}</p>
                        )}
                      </div>
                      {policy.coverage_amount !== undefined && policy.coverage_amount !== null && (
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(policy.coverage_amount)}
                        </span>
                      )}
                    </div>
                    {policy.monthly_premium !== undefined && policy.monthly_premium !== null && (
                      <div className="flex justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                        <span>Monthly Premium:</span>
                        <span className="font-medium">{formatCurrency(policy.monthly_premium)}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Goals' && (
            <div className="space-y-3">
              {localProfile.goals.length === 0 ? (
                <p className="text-sm text-gray-500">No financial goals recorded yet.</p>
              ) : (
                localProfile.goals.map((goal, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{goal.description || 'Financial goal'}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-2">
                      {goal.amount !== undefined && goal.amount !== null && (
                        <span className="font-medium text-gray-900">
                          Target: {formatCurrency(goal.amount)}
                        </span>
                      )}
                      {goal.timeline_years !== undefined && goal.timeline_years !== null && (
                        <span>Timeline: {goal.timeline_years} years</span>
                      )}
                      {goal.priority && (
                        <span className={`px-2 py-0.5 rounded ${
                          goal.priority === 'High' ? 'bg-red-100 text-red-700' :
                          goal.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {goal.priority} Priority
                        </span>
                      )}
                    </div>
                    {goal.motivation && (
                      <p className="text-xs text-gray-500 mt-2 italic">"{goal.motivation}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Progress */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Progress</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Facts Collected</span>
              <span className="text-xs font-medium text-gray-900">{factsCollected}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${factsCollected}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{factsCollected}% of required facts collected.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Profile Completion</span>
              <span className="text-xs font-medium text-gray-900">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{profileCompletion}% of client profile information complete.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateFactsCollected(profile: FinancialProfile): number {
  let facts = 0;
  let total = 0;

  // Goals
  total += 1;
  if (profile.goals.length > 0) facts += 1;

  // Assets
  total += 1;
  if (profile.assets.length > 0) facts += 1;

  // Liabilities
  total += 1;
  if (profile.liabilities.length > 0) facts += 1;

  // Cash balance
  total += 1;
  if (profile.cash_balance !== undefined && profile.cash_balance !== null) facts += 1;

  // Superannuation
  total += 1;
  if (profile.superannuation && profile.superannuation.length > 0) facts += 1;

  // Income
  total += 1;
  if (profile.income || profile.monthly_income) facts += 1;

  // Risk tolerance
  total += 1;
  if (profile.risk_tolerance) facts += 1;

  // Insurance
  total += 1;
  if (profile.insurance.length > 0) facts += 1;

  return Math.round((facts / total) * 100);
}

function calculateProfileCompletion(profile: FinancialProfile): number {
  let score = 0;
  let max = 0;

  // Goals (20 points)
  max += 20;
  if (profile.goals.length > 0) score += 10;
  if (profile.goals.length > 1) score += 10;

  // Assets (20 points)
  max += 20;
  if (profile.assets.length > 0) score += 10;
  if (profile.assets.length > 1) score += 10;

  // Liabilities (15 points)
  max += 15;
  if (profile.liabilities.length > 0) score += 15;

  // Cash balance (10 points)
  max += 10;
  if (profile.cash_balance !== undefined && profile.cash_balance !== null) score += 10;

  // Superannuation (10 points)
  max += 10;
  if (profile.superannuation && profile.superannuation.length > 0) score += 10;

  // Income (15 points)
  max += 15;
  if (profile.income || profile.monthly_income) score += 15;

  // Risk tolerance (10 points)
  max += 10;
  if (profile.risk_tolerance) score += 10;

  // Insurance (10 points)
  max += 10;
  if (profile.insurance.length > 0) score += 10;

  // Financial stage (10 points)
  max += 10;
  if (profile.financial_stage) score += 10;

  return Math.round((score / max) * 100);
}
