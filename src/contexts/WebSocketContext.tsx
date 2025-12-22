import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  createWebSocketUrl,
  getFinancialProfile,
  type WebSocketMessage,
  type GreetingMessage,
  type AgentResponseMessage,
  type ProfileUpdateMessage,
  type IntelligenceSummaryMessage,
  type ErrorMessage,
  type UserMessage,
  type DocumentUploadMessage,
  type DocumentConfirmMessage,
  type DocumentProcessingMessage,
  type DocumentExtractionMessage,
  type DocumentUploadPromptMessage,
  type VisualizationMessage,
  type UIActionsMessage,
  type UIAction,
  type DocumentType,
  type FinancialProfile,
} from '../services/api';

// Chat message type for storing messages
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
  type?: 'message' | 'profile_update' | 'document_processing' | 'document_extraction' | 'visualization' | 'ui_actions' | 'document_upload_prompt';
  profileUpdate?: {
    changes?: Record<string, unknown>;
  };
  documentExtraction?: {
    extractionId: string;
    extractedData: unknown;
    documentType: string;
  };
  visualization?: VisualizationMessage;
  uiActions?: {
    actions: UIAction[];
    hint?: string;
    ephemeral?: boolean;
  };
  documentUploadPrompt?: {
    suggestedTypes: DocumentType[];
  };
}

interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Chat state
  messages: ChatMessage[];
  greeting: GreetingMessage | null;
  agentResponse: AgentResponseMessage | null;
  intelligenceSummary: IntelligenceSummaryMessage | null;
  error: ErrorMessage | null;
  documentProcessing: DocumentProcessingMessage | null;
  documentExtraction: DocumentExtractionMessage | null;
  documentUploadPrompt: DocumentUploadPromptMessage | null;
  visualization: VisualizationMessage | null;
  uiActions: UIActionsMessage | null;
  
  // Profile state
  profile: FinancialProfile | null;
  
  // Actions
  sendMessage: (content: string) => void;
  sendDocumentUpload: (s3Url: string, documentType: DocumentType, filename: string) => void;
  sendDocumentConfirm: (extractionId: string, confirmed: boolean, corrections?: Record<string, unknown>) => void;
  addUserMessage: (content: string) => void;
  clearDocumentExtraction: () => void;
  setProfile: (profile: FinancialProfile | null) => void;
  
  // Feature flags
  features: string[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Chat state - persisted across route changes
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [greeting, setGreeting] = useState<GreetingMessage | null>(null);
  const [agentResponse, setAgentResponse] = useState<AgentResponseMessage | null>(null);
  const [intelligenceSummary, setIntelligenceSummary] = useState<IntelligenceSummaryMessage | null>(null);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [documentProcessing, setDocumentProcessing] = useState<DocumentProcessingMessage | null>(null);
  const [documentExtraction, setDocumentExtraction] = useState<DocumentExtractionMessage | null>(null);
  const [documentUploadPrompt, setDocumentUploadPrompt] = useState<DocumentUploadPromptMessage | null>(null);
  const [visualization, setVisualization] = useState<VisualizationMessage | null>(null);
  const [uiActions, setUiActions] = useState<UIActionsMessage | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  
  // Feature flags (will be populated from /auth/me)
  const [features, setFeatures] = useState<string[]>([]);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualDisconnectRef = useRef(false);
  const greetingReceivedRef = useRef(false);
  const currentStreamingMessageIdRef = useRef<string | null>(null);
  const streamingContentRef = useRef<string>('');
  
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  // Handle incoming messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'greeting': {
        const greetingMsg = message as GreetingMessage;
        // Only set greeting once per session to avoid "Welcome back" on reconnect
        if (!greetingReceivedRef.current) {
          setGreeting(greetingMsg);
          greetingReceivedRef.current = true;
          // Add greeting to messages
          setMessages(prev => [
            ...prev,
            {
              id: `greeting-${Date.now()}`,
              content: greetingMsg.message,
              isUser: false,
              timestamp: greetingMsg.timestamp || new Date().toISOString(),
            }
          ]);
        }
        break;
      }
      case 'agent_response': {
        const agentMsg = message as AgentResponseMessage;
        setAgentResponse(agentMsg);
        
        if (agentMsg.is_complete) {
          // Final chunk - complete the streaming message
          if (currentStreamingMessageIdRef.current) {
            setMessages(prev =>
              prev.map(m =>
                m.id === currentStreamingMessageIdRef.current
                  ? { ...m, content: streamingContentRef.current, isStreaming: false }
                  : m
              )
            );
            currentStreamingMessageIdRef.current = null;
            streamingContentRef.current = '';
          }
        } else if (agentMsg.content) {
          // Streaming chunk with content
          if (!currentStreamingMessageIdRef.current) {
            // Start new streaming message
            const id = `agent-${Date.now()}`;
            currentStreamingMessageIdRef.current = id;
            streamingContentRef.current = '';
            setMessages(prev => [
              ...prev,
              {
                id,
                content: '',
                isUser: false,
                timestamp: agentMsg.timestamp || new Date().toISOString(),
                isStreaming: true,
              }
            ]);
          }
          
          // Accumulate the chunk
          streamingContentRef.current += agentMsg.content;
          
          // Update the message with new content
          setMessages(prev =>
            prev.map(m =>
              m.id === currentStreamingMessageIdRef.current
                ? { ...m, content: streamingContentRef.current, isStreaming: true }
                : m
            )
          );
        }
        break;
      }
      case 'profile_update': {
        const profileMsg = message as ProfileUpdateMessage;
        setProfile(profileMsg.profile);
        // Intentionally do NOT append any \"Profile Updated\" chat messages for now.
        // Profile updates should be treated as a background update and reflected in UI panels/screens.
        break;
      }
      case 'intelligence_summary': {
        // Only process if feature is enabled
        if (features.includes('intelligence_summary')) {
          setIntelligenceSummary(message as IntelligenceSummaryMessage);
        }
        break;
      }
      case 'error':
        setError(message as ErrorMessage);
        setMessages(prev => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            content: `Error: ${(message as ErrorMessage).message}`,
            isUser: false,
            timestamp: (message as ErrorMessage).timestamp || new Date().toISOString(),
          }
        ]);
        break;
      case 'document_processing':
        setDocumentProcessing(message as DocumentProcessingMessage);
        break;
      case 'document_extraction':
        setDocumentExtraction(message as DocumentExtractionMessage);
        break;
      case 'document_upload_prompt': {
        const promptMsg = message as DocumentUploadPromptMessage;
        setDocumentUploadPrompt(promptMsg);
        // Add to messages for display in chat
        setMessages(prev => [
          ...prev,
          {
            id: `doc-upload-prompt-${Date.now()}`,
            content: promptMsg.message,
            isUser: false,
            timestamp: promptMsg.timestamp || new Date().toISOString(),
            type: 'document_upload_prompt',
            documentUploadPrompt: {
              suggestedTypes: promptMsg.suggested_types,
            },
          }
        ]);
        break;
      }
      case 'visualization':
        setVisualization(message as VisualizationMessage);
        // Add visualization to messages
        setMessages(prev => [
          ...prev,
          {
            id: `viz-${Date.now()}`,
            content: '',
            isUser: false,
            timestamp: (message as VisualizationMessage).timestamp || new Date().toISOString(),
            type: 'visualization',
            visualization: message as VisualizationMessage,
          }
        ]);
        break;
      case 'ui_actions': {
        const uiMsg = message as UIActionsMessage;
        setUiActions(uiMsg);

        // Replace older ephemeral UI actions (keep only the latest set).
        setMessages(prev => {
          const filtered = uiMsg.ephemeral === false ? prev : prev.filter(m => m.type !== 'ui_actions');
          return [
            ...filtered,
            {
              id: `ui-${Date.now()}`,
              content: '',
              isUser: false,
              timestamp: uiMsg.timestamp || new Date().toISOString(),
              type: 'ui_actions',
              uiActions: {
                actions: uiMsg.actions || [],
                hint: uiMsg.hint,
                ephemeral: uiMsg.ephemeral,
              },
            },
          ];
        });
        break;
      }
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, [features]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      isManualDisconnectRef.current = false;
      
      const url = createWebSocketUrl('/api/v1/advice/ws');
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message.type);
          handleMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        if (ws.readyState === WebSocket.OPEN) {
          setConnectionError('WebSocket connection error');
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);

        if (isManualDisconnectRef.current || !isAuthenticated) {
          return;
        }

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (isAuthenticated && !isManualDisconnectRef.current) {
              connect();
            }
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Failed to reconnect. Please refresh the page.');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setConnectionError('Failed to create WebSocket connection');
      setIsConnecting(false);
    }
  }, [isAuthenticated, handleMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'User disconnected');
      }
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
    
    // Reset greeting flag so next session gets a fresh greeting
    greetingReceivedRef.current = false;
    
    // Clear all state on disconnect (logout)
    setMessages([]);
    setGreeting(null);
    setAgentResponse(null);
    setIntelligenceSummary(null);
    setError(null);
    setDocumentProcessing(null);
    setDocumentExtraction(null);
    setDocumentUploadPrompt(null);
    setVisualization(null);
    setUiActions(null);
    setProfile(null);
  }, []);

  // Send user message
  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: UserMessage = {
        type: 'user_message',
        content,
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
      setConnectionError('Not connected. Please wait for connection.');
    }
  }, []);

  // Send document upload
  const sendDocumentUpload = useCallback((s3Url: string, documentType: DocumentType, filename: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: DocumentUploadMessage = {
        type: 'document_upload',
        s3_url: s3Url,
        document_type: documentType,
        filename,
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send document upload.');
      setConnectionError('Not connected. Please wait for connection.');
    }
  }, []);

  // Send document confirm
  const sendDocumentConfirm = useCallback((extractionId: string, confirmed: boolean, corrections?: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: DocumentConfirmMessage = {
        type: 'document_confirm',
        extraction_id: extractionId,
        confirmed,
        corrections,
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send document confirmation.');
      setConnectionError('Not connected. Please wait for connection.');
    }
  }, []);

  // Add user message to chat (for display)
  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        content,
        isUser: true,
        timestamp: new Date().toISOString(),
      }
    ]);
  }, []);

  // Clear document extraction
  const clearDocumentExtraction = useCallback(() => {
    setDocumentExtraction(null);
  }, []);

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, user, connect, disconnect]);

  // Fetch feature flags from /auth/me when user is authenticated
  useEffect(() => {
    const fetchFeatures = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
            method: 'GET',
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.features) {
              setFeatures(data.data.features);
            }
          }
        } catch (err) {
          console.error('Error fetching features:', err);
        }
      }
    };
    fetchFeatures();
  }, [isAuthenticated]);

  // Bootstrap profile when authenticated (only if not already loaded)
  const profileFetchedRef = useRef(false);
  useEffect(() => {
    const bootstrapProfile = async () => {
      // Only fetch if authenticated, profile is null, and we haven't fetched yet
      if (!isAuthenticated || profile !== null || profileFetchedRef.current) {
        return;
      }
      
      profileFetchedRef.current = true;
      
      try {
        const profileData = await getFinancialProfile();
        if (profileData) {
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Error bootstrapping profile:', err);
      }
    };
    
    bootstrapProfile();
  }, [isAuthenticated, profile]);

  // Reset agent response after completion
  useEffect(() => {
    if (agentResponse?.is_complete) {
      const timer = setTimeout(() => {
        setAgentResponse(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [agentResponse]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        isConnecting,
        connectionError,
        messages,
        greeting,
        agentResponse,
        intelligenceSummary,
        error,
        documentProcessing,
        documentExtraction,
        documentUploadPrompt,
        visualization,
        uiActions,
        profile,
        sendMessage,
        sendDocumentUpload,
        sendDocumentConfirm,
        addUserMessage,
        clearDocumentExtraction,
        setProfile,
        features,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

