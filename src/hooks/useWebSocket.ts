"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ChatMessage,
  GoalState,
  WSIncomingMessage,
  WSOutgoingMessage,
} from "@/types/websocket";
import { useApp } from "@/contexts/AppContext";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export function useWebSocket() {
  const {
    sessionId,
    setSessionId,
    status,
    setStatus,
    messages,
    setMessages,
    goalState,
    setGoalState,
    collectedData,
    setCollectedData,
    currentNode,
    setCurrentNode,
    clearSession,
    hasExistingSession,
  } = useApp();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResumingRef = useRef<boolean>(false);
  const isConnectingRef = useRef<boolean>(false); // Prevent multiple simultaneous connections
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    },
    [setMessages]
  );

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data: WSIncomingMessage = JSON.parse(event.data);

        switch (data.type) {
          case "session_start":
            setSessionId(data.session_id);
            // Only show "Session started" message for new sessions, not resumes
            if (!isResumingRef.current) {
              addMessage({
                id: `system-${Date.now()}`,
                type: "system",
                content: "Session started. Vecta is ready to help you.",
                timestamp: new Date(),
                metadata: { session_id: data.session_id },
              });
            }
            isResumingRef.current = false; // Reset after handling
            break;

          case "question":
            if (data.question) {
              addMessage({
                id: `bot-${Date.now()}`,
                type: "bot",
                content: data.question,
                timestamp: new Date(),
                node_name: data.node_name,
                extracted_data: data.extracted_data,
                upcoming_nodes: data.upcoming_nodes,
                all_collected_data: data.all_collected_data,
                metadata: { complete: data.complete || false },
              });
            }
            if (data.all_collected_data) {
              setCollectedData(data.all_collected_data);
            }
            if (data.node_name) {
              setCurrentNode(data.node_name);
            }
            if (data.goal_state) {
              setGoalState(data.goal_state);
            }
            break;

          case "complete":
            // Legacy handler - most completion is now handled via WSQuestion.complete
            addMessage({
              id: `system-${Date.now()}`,
              type: "system",
              content: data.visited_all
                ? "All information has been gathered."
                : `Moving to ${data.next_node}`,
              timestamp: new Date(),
              metadata: {
                next_node: data.next_node || undefined,
                complete: data.visited_all,
              },
            });
            break;

          case "error":
            addMessage({
              id: `error-${Date.now()}`,
              type: "error",
              content: data.message,
              timestamp: new Date(),
            });
            break;

          case "calculation":
            addMessage({
              id: `calc-${Date.now()}`,
              type: "calculation",
              content: data.message,
              timestamp: new Date(),
              calculation: {
                calculation_type: data.calculation_type,
                result: data.result,
                can_calculate: data.can_calculate,
                missing_data: data.missing_data,
                message: data.message,
                data_used: data.data_used,
              },
            });
            break;

          case "visualization":
            addMessage({
              id: `viz-${Date.now()}`,
              type: "visualization",
              content: data.description,
              timestamp: new Date(),
              visualization: {
                calculation_type: data.calculation_type,
                inputs: data.inputs,
                chart_type: data.chart_type,
                data: data.data,
                title: data.title,
                description: data.description,
                config: data.config,
                charts: data.charts,
              },
            });
            break;

          case "mode_switch":
            addMessage({
              id: `mode-${Date.now()}`,
              type: "system",
              content: `Mode: ${data.mode}`,
              timestamp: new Date(),
            });
            break;

          case "traversal_paused":
            addMessage({
              id: `paused-${Date.now()}`,
              type: "system",
              content: data.message,
              timestamp: new Date(),
            });
            break;

          case "resume_prompt":
            addMessage({
              id: `resume-${Date.now()}`,
              type: "bot",
              content: data.message,
              timestamp: new Date(),
            });
            break;

          case "goal_qualification":
            addMessage({
              id: `goal-qual-${Date.now()}`,
              type: "goal_qualification",
              content: data.question,
              timestamp: new Date(),
              metadata: {
                goal_id: data.goal_id,
                goal_description: data.goal_description || undefined,
              },
            });
            if (data.goal_state) {
              setGoalState(data.goal_state);
            }
            break;

          case "scenario_question":
            // Scenario-based question for inferred goals
            addMessage({
              id: `scenario-${Date.now()}`,
              type: "scenario_question",
              content: data.question,
              timestamp: new Date(),
              metadata: {
                goal_id: data.goal_id,
                goal_description: data.goal_description || undefined,
                turn: data.turn,
                max_turns: data.max_turns,
                goal_confirmed: data.goal_confirmed || undefined,
                goal_rejected: data.goal_rejected || undefined,
              },
            });
            if (data.goal_state) {
              setGoalState(data.goal_state);
            }
            break;

        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    },
    [addMessage, setSessionId, setCollectedData, setCurrentNode, setGoalState]
  );

  const connect = useCallback(
    (initialContext?: string, existingSessionId?: string) => {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      // If already connecting or connected, don't start another connection
      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        return;
      }

      isConnectingRef.current = true;
      setStatus("connecting");
      
      // Track if we're resuming to suppress duplicate "Session started" messages
      isResumingRef.current = !!existingSessionId;
      
      // Connect with session_id as path parameter if resuming existing session
      // Backend expects: /ws/{session_id} for existing sessions, /ws for new sessions
      const wsUrl = existingSessionId 
        ? `${WS_URL}/${existingSessionId}`
        : WS_URL;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        isConnectingRef.current = false;
        setStatus("connected");
        setReconnectAttempts(0);
        
        // Only send initial context for new sessions (not resuming)
        if (!existingSessionId) {
          ws.send(
            JSON.stringify({
              initial_context: initialContext || null,
              user_goal: initialContext || null,
            })
          );
        }
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        isConnectingRef.current = false;
        setStatus("disconnected");
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        isConnectingRef.current = false;
        console.error("WebSocket error:", error);
        setStatus("error");
      };

      wsRef.current = ws;
    },
    [handleMessage, setStatus]
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setStatus("disconnected");
  }, [setStatus]);

  const sendMessage = useCallback((answer: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Add user message to chat
      addMessage({
        id: `user-${Date.now()}`,
        type: "user",
        content: answer,
        timestamp: new Date(),
      });

      // Send to server
      const message: WSOutgoingMessage = { type: "answer", answer };
      wsRef.current.send(JSON.stringify(message));
    }
  }, [addMessage]);

  // Start a new session (clears existing state)
  const startSession = useCallback(
    (userGoal?: string, forceNew = false) => {
      // Clear state for new sessions
      if (forceNew || !hasExistingSession) {
        clearSession();
      }
      connect(userGoal);
    },
    [connect, clearSession, hasExistingSession]
  );

  // Resume an existing session (keeps state, reconnects WebSocket)
  const resumeSession = useCallback(() => {
    // Only resume if we have a sessionId, are disconnected, and not already connecting
    if (sessionId && status === "disconnected" && !isConnectingRef.current) {
      connect(undefined, sessionId);
    }
  }, [sessionId, status, connect]);

  // Cleanup on unmount - only close WebSocket, don't clear state
  useEffect(() => {
    return () => {
      // Just close WebSocket, state is preserved in localStorage
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  return {
    messages,
    status,
    sessionId,
    goalState,
    collectedData,
    currentNode,
    sendMessage,
    startSession,
    resumeSession,
    disconnect,
    hasExistingSession,
    clearSession,
  };
}
