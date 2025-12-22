import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import VisualizationCard from './VisualizationCard';
import type { ChatMessage as ChatMessageType } from '../contexts/WebSocketContext';
import type {
  GreetingMessage,
  AgentResponseMessage,
  ProfileUpdateMessage,
  ErrorMessage,
  DocumentProcessingMessage,
  DocumentExtractionMessage,
  VisualizationMessage,
  UIAction,
  DocumentType,
} from '../services/api';

interface ChatCanvasProps {
  messages: ChatMessageType[];
  greeting?: GreetingMessage | null;
  agentResponse?: AgentResponseMessage | null;
  profileUpdate?: ProfileUpdateMessage | null;
  error?: ErrorMessage | null;
  documentProcessing?: DocumentProcessingMessage | null;
  documentExtraction?: DocumentExtractionMessage | null;
  visualization?: VisualizationMessage | null;
  onSendMessage: (content: string) => void;
  onDocumentUpload?: (s3Url: string, documentType: DocumentType, filename: string) => void;
  onDocumentConfirm?: (extractionId: string, confirmed: boolean) => void;
  isConnected: boolean;
  isConnecting: boolean;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function ChatCanvas({
  messages,
  agentResponse,
  documentProcessing,
  documentExtraction,
  onSendMessage,
  onDocumentUpload,
  onDocumentConfirm,
  isConnected,
  isConnecting,
  sidebarOpen = false,
  onToggleSidebar,
}: ChatCanvasProps) {
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [documentStatus, setDocumentStatus] = useState<string>('');
  const [pendingExtractionId, setPendingExtractionId] = useState<string | null>(null);
  const [confirmedExtractions, setConfirmedExtractions] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track agent thinking state based on agentResponse
  useEffect(() => {
    if (agentResponse) {
      if (agentResponse.is_complete) {
        setIsAgentThinking(false);
      } else if (agentResponse.content) {
        // First content arrived, no longer "thinking"
        setIsAgentThinking(false);
      }
    }
  }, [agentResponse]);

  // Handle document processing status
  useEffect(() => {
    if (documentProcessing) {
      if (documentProcessing.status === 'error' || documentProcessing.status === 'complete') {
        setIsProcessingDocument(false);
        setDocumentStatus('');
      } else {
        setIsProcessingDocument(true);
        setDocumentStatus(documentProcessing.message);
      }
    }
  }, [documentProcessing]);

  // Handle document extraction
  useEffect(() => {
    if (documentExtraction) {
      setIsProcessingDocument(false);
      setDocumentStatus('');
      setPendingExtractionId(documentExtraction.extraction_id);
    }
  }, [documentExtraction]);

  const handleDocumentConfirm = (extractionId: string, confirmed: boolean) => {
    if (onDocumentConfirm) {
      onDocumentConfirm(extractionId, confirmed);
      setPendingExtractionId(null);
      setConfirmedExtractions(prev => new Set(prev).add(extractionId));
    }
  };

  const handleDocumentUpload = (s3Url: string, documentType: DocumentType, filename: string) => {
    if (onDocumentUpload) {
      setIsProcessingDocument(true);
      setDocumentStatus('Uploading document...');
      onDocumentUpload(s3Url, documentType, filename);
    }
  };

  const handleSend = (content: string) => {
    setIsAgentThinking(true);
    onSendMessage(content);
  };

  const renderActionButton = (action: UIAction) => {
    const base =
      'text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const style =
      action.style === 'primary'
        ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
        : action.style === 'ghost'
        ? 'bg-transparent border-gray-200 text-gray-700 hover:bg-gray-50'
        : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100';

    return (
      <button
        key={action.id}
        type="button"
        disabled={!!action.disabled}
        className={`${base} ${style}`}
        onClick={() => {
          if (action.action_type === 'send_message' && action.message) {
            handleSend(action.message);
          } else if (action.action_type === 'open_url' && action.url) {
            window.open(action.url, '_blank', 'noopener,noreferrer');
          }
        }}
        aria-label={action.label}
        title={action.label}
      >
        {action.label}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Vecta</h2>
            {isConnected ? (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                Active
              </span>
            ) : isConnecting ? (
              <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                Connecting...
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                Disconnected
              </span>
            )}
          </div>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        {messages.length === 0 && !isConnecting && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Start a conversation — share a goal or choose an option above.
          </div>
        )}
        {isConnecting && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Connecting to Vecta...
          </div>
        )}
        {messages.map((message) => {
          if (message.type === 'profile_update') {
            return (
              <div key={message.id} className="flex justify-center mb-4">
                <div className="max-w-[80%] bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-green-900 mb-1">Profile Updated</p>
                      <div className="text-sm text-green-800 whitespace-pre-wrap">
                        {message.content.split('\n').map((line, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="text-green-600">•</span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          if (message.type === 'document_extraction' && message.documentExtraction) {
            const extractionId = message.documentExtraction.extractionId;
            const isPending = pendingExtractionId === extractionId && !confirmedExtractions.has(extractionId);
            return (
              <div key={message.id} className="flex justify-start mb-4">
                <div className="max-w-[80%]">
                  <div className="rounded-2xl px-4 py-3 bg-blue-50 text-gray-900 rounded-bl-sm border border-blue-200">
                    <div className="flex items-start gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs font-semibold text-blue-900">Document Analysis</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap mb-3">{message.content}</div>
                    {isPending && onDocumentConfirm && (
                      <div className="flex gap-2 pt-2 border-t border-blue-200">
                        <button
                          onClick={() => handleDocumentConfirm(extractionId, true)}
                          className="flex-1 py-2 px-3 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Looks correct
                        </button>
                        <button
                          onClick={() => handleDocumentConfirm(extractionId, false)}
                          className="flex-1 py-2 px-3 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Not right
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          if (message.type === 'visualization' && message.visualization) {
            return (
              <div key={message.id} className="flex justify-start mb-4">
                <div className="max-w-[80%]">
                  <VisualizationCard viz={message.visualization} onExploreNext={(t) => handleSend(t)} />
                </div>
              </div>
            );
          }
          if (message.type === 'ui_actions' && message.uiActions) {
            const actions = message.uiActions.actions || [];
            if (actions.length === 0) return null;
            return (
              <div key={message.id} className="flex justify-start mb-4">
                <div className="max-w-[80%]">
                  <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                    {message.uiActions.hint && (
                      <div className="text-xs text-gray-600 mb-2">{message.uiActions.hint}</div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {actions.map(renderActionButton)}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <ChatMessage
              key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              isStreaming={message.isStreaming}
            />
          );
        })}
        {isAgentThinking && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%]">
              <div className="rounded-2xl px-4 py-3 bg-gray-50 text-gray-900 rounded-bl-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-gray-500">Agent is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {isProcessingDocument && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%]">
              <div className="rounded-2xl px-4 py-3 bg-amber-50 text-gray-900 rounded-bl-sm border border-amber-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-amber-800">{documentStatus || 'Processing document...'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onDocumentUpload={onDocumentUpload ? handleDocumentUpload : undefined}
        disabled={!isConnected}
      />
    </div>
  );
}
