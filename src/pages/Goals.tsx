import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import type { Goal } from '../services/api';

type GoalStatus = 'not_started' | 'discussing' | 'started' | 'in_progress' | 'completed';
type GoalSource = 'user_stated' | 'agent_discovered';

interface GoalWithDetails extends Goal {
  status?: GoalStatus;
  source?: GoalSource;
  relatedFacts?: Record<string, any>;
  createdAt?: string;
}

export default function Goals() {
  const navigate = useNavigate();
  const { logout, loading: authLoading, isAuthenticated } = useAuth();
  const { profile } = useWebSocketContext();
  const [selectedGoal, setSelectedGoal] = useState<GoalWithDetails | null>(null);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Process goals from profile
  const goals: GoalWithDetails[] = profile?.goals?.map((goal, idx) => {
    // Determine status based on goal data
    let status: GoalStatus = 'not_started';
    if (goal.timeline_years && goal.amount) {
      status = 'discussing';
    }
    if (goal.priority) {
      status = goal.priority === 'High' ? 'started' : 'discussing';
    }

    // Determine source (user-stated vs agent-discovered)
    // Check if goal has metadata indicating source, otherwise default to user_stated
    const source: GoalSource = (goal as any).source || 'user_stated';

    // Get related facts from metadata if available
    const relatedFacts = (goal as any).relatedFacts || {};

    return {
      ...goal,
      status,
      source,
      relatedFacts,
      createdAt: goal.created_at,
    };
  }) || [];

  // Also check for goals_with_timelines from metadata if available
  const goalsWithTimelines = (profile as any)?.goals_with_timelines || [];
  if (goalsWithTimelines.length > 0) {
    goalsWithTimelines.forEach((goalWithTimeline: any) => {
      // Check if this goal already exists in goals array
      const existing = goals.find(g => g.description === goalWithTimeline.description);
      if (!existing) {
        goals.push({
          description: goalWithTimeline.description || '',
          timeline_years: goalWithTimeline.timeline_years,
          amount: goalWithTimeline.amount,
          priority: goalWithTimeline.priority ? 
            (goalWithTimeline.priority === 1 ? 'High' : goalWithTimeline.priority === 2 ? 'Medium' : 'Low') : 
            undefined,
          status: goalWithTimeline.timeline_years ? 'discussing' : 'not_started',
          source: 'user_stated',
        });
      }
    });
  }

  // Separate goals by source
  const userStatedGoals = goals.filter(g => g.source === 'user_stated');
  const discoveredGoals = goals.filter(g => g.source === 'agent_discovered');

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'Not specified';
    return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
      case 'started':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'discussing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'not_started':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: GoalStatus) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'started':
        return 'Started';
      case 'discussing':
        return 'Discussing';
      case 'not_started':
      default:
        return 'Not Started';
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleGoalClick = (goal: GoalWithDetails) => {
    if (expandedGoalId === goal.id?.toString()) {
      setExpandedGoalId(null);
      setSelectedGoal(null);
    } else {
      setExpandedGoalId(goal.id?.toString() || null);
      setSelectedGoal(goal);
    }
  };

  const renderSidebar = () => (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Vecta</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('/financial-profile'); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Financial Profile
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Goals
        </a>
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-2">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </a>
        <button
          onClick={handleLogout}
          disabled={authLoading}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderSidebar()}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Goals</h1>
            <p className="text-gray-600">Track and manage all your financial objectives</p>
          </div>

          {goals.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-500 mb-6">Start a conversation to discover and set your financial goals.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* User Stated Goals */}
              {userStatedGoals.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Your Goals</h2>
                    <span className="text-sm text-gray-500">{userStatedGoals.length} goal{userStatedGoals.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userStatedGoals.map((goal, idx) => (
                      <GoalCard
                        key={goal.id || idx}
                        goal={goal}
                        isExpanded={expandedGoalId === (goal.id?.toString() || idx.toString())}
                        onClick={() => handleGoalClick(goal)}
                        formatCurrency={formatCurrency}
                        getStatusColor={getStatusColor}
                        getStatusLabel={getStatusLabel}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Discovered Goals */}
              {discoveredGoals.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Suggested Goals</h2>
                    <span className="text-sm text-gray-500">{discoveredGoals.length} goal{discoveredGoals.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discoveredGoals.map((goal, idx) => (
                      <GoalCard
                        key={goal.id || idx}
                        goal={goal}
                        isExpanded={expandedGoalId === (goal.id?.toString() || idx.toString())}
                        onClick={() => handleGoalClick(goal)}
                        formatCurrency={formatCurrency}
                        getStatusColor={getStatusColor}
                        getStatusLabel={getStatusLabel}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface GoalCardProps {
  goal: GoalWithDetails;
  isExpanded: boolean;
  onClick: () => void;
  formatCurrency: (amount: number | undefined) => string;
  getStatusColor: (status: GoalStatus) => string;
  getStatusLabel: (status: GoalStatus) => string;
  getPriorityColor: (priority: string | undefined) => string;
}

function GoalCard({
  goal,
  isExpanded,
  onClick,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
}: GoalCardProps) {
  const status = goal.status || 'not_started';

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isExpanded ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
            {goal.description || 'Financial Goal'}
          </h3>
          {goal.source === 'agent_discovered' && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Suggested
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>

        {/* Quick Info */}
        <div className="space-y-2 mb-4">
          {goal.amount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Target Amount</span>
              <span className="font-semibold text-gray-900">{formatCurrency(goal.amount)}</span>
            </div>
          )}
          {goal.timeline_years && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Timeline</span>
              <span className="font-semibold text-gray-900">{goal.timeline_years} years</span>
            </div>
          )}
          {goal.priority && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Priority</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                {goal.priority}
              </span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2">
            {/* Motivation */}
            {goal.motivation && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1">Motivation</h4>
                <p className="text-sm text-gray-600 italic">"{goal.motivation}"</p>
              </div>
            )}

            {/* Timeline Details */}
            {goal.timeline_years && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Timeline Details</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Target Date</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(Date.now() + goal.timeline_years * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                  {goal.amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Years Remaining</span>
                      <span className="text-sm font-semibold text-gray-900">{goal.timeline_years} years</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Breakdown */}
            {goal.amount && goal.timeline_years && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Financial Breakdown</h4>
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Target Amount</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(goal.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Savings Needed</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Math.round((goal.amount / (goal.timeline_years * 12)) * 100) / 100)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Annual Savings Needed</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Math.round((goal.amount / goal.timeline_years) * 100) / 100)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Related Facts */}
            {goal.relatedFacts && Object.keys(goal.relatedFacts).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Related Information</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-1">
                    {Object.entries(goal.relatedFacts).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Created Date */}
            {goal.createdAt && (
              <div className="text-xs text-gray-500">
                Created: {new Date(goal.createdAt).toLocaleDateString('en-AU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse Indicator */}
        <div className="mt-4 flex items-center justify-center">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

