import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createWebSocketUrl,
  type WebSocketMessage,
  type GreetingMessage,
  type AgentResponseMessage,
  type ProfileUpdateMessage,
  type IntelligenceSummaryMessage,
  type ErrorMessage,
  type UserMessage,
  type FinancialProfile,
} from '../services/api';

export type MessageHandler = {
  onGreeting?: (message: GreetingMessage) => void;
  onAgentResponse?: (message: AgentResponseMessage) => void;
  onProfileUpdate?: (message: ProfileUpdateMessage) => void;
  onIntelligenceSummary?: (message: IntelligenceSummaryMessage) => void;
  onError?: (message: ErrorMessage) => void;
};

interface UseWebSocketOptions {
  enabled?: boolean;
  handlers?: MessageHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  sendMessage: (content: string) => void;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useWebSocket(
  options: UseWebSocketOptions
): UseWebSocketReturn {
  const { enabled = true, handlers, onConnect, onDisconnect, onError } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualDisconnectRef = useRef(false);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  // Use ref for handlers to avoid stale closures - MUST be defined before handleMessage
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  // handleMessage MUST be defined before connect
  const handleMessage = useCallback((message: WebSocketMessage) => {
    const currentHandlers = handlersRef.current;
    switch (message.type) {
      case 'greeting':
        currentHandlers?.onGreeting?.(message as GreetingMessage);
        break;
      case 'agent_response':
        currentHandlers?.onAgentResponse?.(message as AgentResponseMessage);
        break;
      case 'profile_update':
        currentHandlers?.onProfileUpdate?.(message as ProfileUpdateMessage);
        break;
      case 'intelligence_summary':
        currentHandlers?.onIntelligenceSummary?.(message as IntelligenceSummaryMessage);
        break;
      case 'error':
        currentHandlers?.onError?.(message as ErrorMessage);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    // Also check if connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return; // Already connecting
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Reset manual disconnect flag when attempting new connection
      isManualDisconnectRef.current = false;
      
      const url = createWebSocketUrl('/api/v1/advice/ws');
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message.type, message);
          handleMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        // Don't set error state immediately for connection refused, as onclose will handle reconnection
        if (ws.readyState === WebSocket.OPEN) {
          setError('WebSocket connection error');
        }
        onError?.(event);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();

        // Don't reconnect if it was a manual disconnect or if enabled is false
        if (isManualDisconnectRef.current || !enabled) {
          return;
        }

        // Attempt to reconnect if not a normal closure and enabled
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts && enabled) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (enabled && !isManualDisconnectRef.current) {
              connect();
            }
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to reconnect. Please refresh the page.');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
      setIsConnecting(false);
    }
  }, [enabled, onConnect, onDisconnect, onError, handleMessage]);

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
      setError('Not connected. Please wait for connection.');
    }
  }, []);

  const disconnect = useCallback(() => {
    // Mark as manual disconnect to prevent reconnection
    isManualDisconnectRef.current = true;
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close WebSocket connection if it exists
    if (wsRef.current) {
      // Remove event handlers to prevent memory leaks
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      
      // Close connection if not already closed
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'User disconnected');
      }
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      // Disconnect if disabled or no token
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]); // Removed connect/disconnect from deps to avoid infinite loops

  return {
    sendMessage,
    isConnected,
    isConnecting,
    error,
    reconnect,
    disconnect,
  };
}
