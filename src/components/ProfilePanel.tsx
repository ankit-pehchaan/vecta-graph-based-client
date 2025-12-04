import { useEffect, useState } from 'react';
import type { FinancialProfile, ProfileUpdateMessage } from '../services/api';

interface ProfilePanelProps {
  profile: FinancialProfile | null;
  onProfileUpdate?: (update: ProfileUpdateMessage) => void;
}

export default function ProfilePanel({ profile, onProfileUpdate }: ProfilePanelProps) {
  const [localProfile, setLocalProfile] = useState<FinancialProfile | null>(profile);

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
  const netWorth = totalAssets - totalLiabilities;

  // Calculate profile completion
  const factsCollected = calculateFactsCollected(localProfile);
  const profileCompletion = calculateProfileCompletion(localProfile);

  return (
    <div className="space-y-4">
      {/* Financial Summary */}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Financial Summary</h3>
          <div className="flex gap-1">
            {['Overview', 'Assets', 'Liabilities', 'Cash', 'Insurance', 'Tasks'].map((tab) => (
              <button
                key={tab}
                className={`px-2 py-1 text-xs rounded ${
                  tab === 'Overview'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Net Worth</span>
            </div>
            <span className="font-semibold text-gray-900">
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Total Assets</span>
            </div>
            <span className="font-semibold text-gray-900">
              ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {localProfile.risk_tolerance && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Risk Score</span>
              </div>
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

  // Income
  total += 1;
  if (profile.income) facts += 1;

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

  // Income (15 points)
  max += 15;
  if (profile.income) score += 15;

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

