import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import ChatCanvas from '../components/ChatCanvas';
import ProfilePanel from '../components/ProfilePanel';
import IntelligenceSummary from '../components/IntelligenceSummary';
import SuggestedNextSteps from '../components/SuggestedNextSteps';
import { getCurrentUser } from '../services/api';
import type {
  GreetingMessage,
  AgentResponseMessage,
  ProfileUpdateMessage,
  IntelligenceSummaryMessage,
  SuggestedNextStepsMessage,
  ErrorMessage,
  FinancialProfile,
} from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading, getAccessToken } = useAuth();
  const token = getAccessToken();
  const [verifyingAuth, setVerifyingAuth] = useState(true);

  // State for WebSocket messages
  const [greeting, setGreeting] = useState<GreetingMessage | null>(null);
  const [agentResponse, setAgentResponse] = useState<AgentResponseMessage | null>(null);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [intelligenceSummary, setIntelligenceSummary] = useState<IntelligenceSummaryMessage | null>(null);
  const [suggestedNextSteps, setSuggestedNextSteps] = useState<SuggestedNextStepsMessage | null>(null);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // WebSocket connection
  const { sendMessage, isConnected, isConnecting, disconnect } = useWebSocket({
    token,
    enabled: !!token && !!user && !verifyingAuth, // Only enable after auth verification
    handlers: {
      onGreeting: (msg) => {
        setGreeting(msg);
      },
      onAgentResponse: (msg) => {
        setAgentResponse(msg);
      },
      onProfileUpdate: (msg) => {
        setProfile(msg.profile);
      },
      onIntelligenceSummary: (msg) => {
        setIntelligenceSummary(msg);
      },
      onSuggestedNextSteps: (msg) => {
        setSuggestedNextSteps(msg);
      },
      onError: (msg) => {
        setError(msg);
      },
    },
  });

  // Verify authentication with backend on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await getCurrentUser();
        setVerifyingAuth(false);
      } catch (error) {
        // If /me fails (401), redirect to login
        console.error('Authentication verification failed:', error);
        navigate('/login', { replace: true });
      }
    };

    verifyAuth();
  }, [navigate]);

  // Cleanup WebSocket on unmount or when user logs out
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Reset agent response when a new one starts (when is_complete is false after a complete)
  useEffect(() => {
    if (agentResponse?.is_complete) {
      // Reset after a short delay to allow UI to update
      const timer = setTimeout(() => {
        setAgentResponse(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [agentResponse]);

  const handleLogout = async () => {
    try {
      // Disconnect WebSocket before logging out
      disconnect();
      await logout();
      navigate('/login');
    } catch (err) {
      // Error handling is done in the auth context
    }
  };

  // Show loading while verifying authentication - AFTER all hooks are called
  if (verifyingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-gray-200 flex flex-col">
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Financial Profile
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Strategy Advice
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

      {/* Main Content - Chat Canvas with integrated sidebar */}
      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 flex relative">
          <div className="flex-1" style={{ marginRight: sidebarOpen ? '320px' : '0', transition: 'margin-right 0.3s ease' }}>
            <ChatCanvas
              greeting={greeting}
              agentResponse={agentResponse}
              profileUpdate={profile ? { type: 'profile_update', profile } : null}
              intelligenceSummary={intelligenceSummary}
              suggestedNextSteps={suggestedNextSteps}
              error={error}
              onSendMessage={sendMessage}
              isConnected={isConnected}
              isConnecting={isConnecting}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
          
          {/* Right Sidebar - Toggleable */}
          {sidebarOpen && (
            <aside className="absolute right-0 top-0 bottom-0 w-80 border-l border-gray-200 overflow-y-auto bg-white/95 backdrop-blur-sm z-10">
              <div className="p-4 space-y-4">
                <ProfilePanel profile={profile} />
                <IntelligenceSummary summary={intelligenceSummary} />
                <SuggestedNextSteps nextSteps={suggestedNextSteps} />
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
