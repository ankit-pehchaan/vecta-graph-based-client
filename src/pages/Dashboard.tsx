import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import ChatCanvas from '../components/ChatCanvas';
import ProfilePanel from '../components/ProfilePanel';
import IntelligenceSummary from '../components/IntelligenceSummary';
import ThemeToggle from '../components/ThemeToggle';
import type { DocumentType } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get everything from WebSocket context (persisted across route changes)
  const {
    isConnected,
    isConnecting,
    messages,
    greeting,
    agentResponse,
    intelligenceSummary,
    error,
    documentProcessing,
    documentExtraction,
    documentUploadPrompt,
    visualization,
    profile,
    sendMessage,
    sendDocumentUpload,
    sendDocumentConfirm,
    addUserMessage,
    clearDocumentExtraction,
    features,
  } = useWebSocketContext();

  // Document upload handler
  const handleDocumentUpload = (s3Url: string, documentType: DocumentType, filename: string) => {
    sendDocumentUpload(s3Url, documentType, filename);
  };

  // Document confirm handler
  const handleDocumentConfirm = (extractionId: string, confirmed: boolean) => {
    sendDocumentConfirm(extractionId, confirmed);
    clearDocumentExtraction();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      // Error handling is done in the auth context
    }
  };

  // Check if intelligence summary feature is enabled
  const showIntelligenceSummary = features.includes('intelligence_summary');

  return (
    <div className="h-screen bg-white dark:bg-black flex overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 bg-white dark:bg-gray-950">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
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
            onClick={(e) => { e.preventDefault(); navigate('/visualizations'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Visualization History
          </a>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <ThemeToggle />
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content - Chat Canvas with integrated sidebar */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex relative overflow-hidden">
          <div className="flex-1 h-full overflow-hidden" style={{ marginRight: sidebarOpen ? '320px' : '0', transition: 'margin-right 0.3s ease' }}>
            <ChatCanvas
              messages={messages}
              greeting={greeting}
              agentResponse={agentResponse}
              profileUpdate={profile ? { type: 'profile_update', profile } : null}
              error={error}
              documentProcessing={documentProcessing}
              documentExtraction={documentExtraction}
              documentUploadPrompt={documentUploadPrompt}
              visualization={visualization}
              onSendMessage={(content) => {
                addUserMessage(content);
                sendMessage(content);
              }}
              onDocumentUpload={handleDocumentUpload}
              onDocumentConfirm={handleDocumentConfirm}
              isConnected={isConnected}
              isConnecting={isConnecting}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>

          {/* Right Sidebar - Toggleable */}
          {sidebarOpen && (
            <aside className="absolute right-0 top-0 bottom-0 w-80 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm z-10">
              <div className="p-4 space-y-4">
                <ProfilePanel profile={profile} />
                {showIntelligenceSummary && (
                  <IntelligenceSummary summary={intelligenceSummary} />
                )}
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
