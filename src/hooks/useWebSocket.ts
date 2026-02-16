"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ChatMessage,
  GoalState,
  WSIncomingMessage,
  WSOutgoingMessage,
} from "@/types/websocket";
import { useApp } from "@/contexts/AppContext";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://backend.vectatech.com.au/ws";

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
  const isConnectingRef = useRef<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Streaming state: track the message being built by stream_delta events
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamingContentRef = useRef<string>("");

  const normalizeGoalState = useCallback((state: GoalState) => {
    return {
      qualified_goals: state.qualified_goals || [],
      possible_goals: state.possible_goals || [],
      rejected_goals: state.rejected_goals || [],
      deferred_goals: (state as any).deferred_goals || [],
    };
  }, []);

  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev: ChatMessage[]) => [...prev, message]);
    },
    [setMessages]
  );

  /**
   * Update the last message in-place (used for streaming deltas).
   * Finds the message by ID and replaces it.
   */
  const updateMessageById = useCallback(
    (id: string, updater: (msg: ChatMessage) => ChatMessage) => {
      setMessages((prev: ChatMessage[]) =>
        prev.map((msg) => (msg.id === id ? updater(msg) : msg))
      );
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
            if (!isResumingRef.current) {
              addMessage({
                id: `system-${Date.now()}`,
                type: "system",
                content: "Session started. Vecta is ready to help you.",
                timestamp: new Date(),
                metadata: { session_id: data.session_id },
              });
            }
            isResumingRef.current = false;
            break;

          // --- Initial question (from orchestrator.start(), non-streaming) ---
          case "question":
            setIsAwaitingResponse(false);
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
                metadata: {
                  complete: data.complete || false,
                  goal_details: data.goal_details,
                },
              });
            }
            if (data.all_collected_data) {
              setCollectedData(data.all_collected_data);
            }
            if (data.node_name) {
              setCurrentNode(data.node_name);
            }
            if (data.goal_state) {
              setGoalState(normalizeGoalState(data.goal_state));
            }
            break;

          case "complete":
            setIsAwaitingResponse(false);
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
            setIsAwaitingResponse(false);
            addMessage({
              id: `error-${Date.now()}`,
              type: "error",
              content: data.message,
              timestamp: new Date(),
            });
            break;

          // --- Streaming: stream_start → stream_delta* → stream_end ---

          case "stream_start": {
            // Streaming has begun — hide the "thinking" indicator but keep input disabled
            setIsAwaitingResponse(false);
            setIsStreaming(true);

            const msgId = `stream-${Date.now()}`;
            streamingMessageIdRef.current = msgId;
            streamingContentRef.current = "";

            // Add a placeholder "streaming" message that will be updated
            addMessage({
              id: msgId,
              type: "streaming",
              content: "",
              timestamp: new Date(),
              metadata: {
                mode: data.mode,
                isStreaming: true,
              },
            });
            break;
          }

          case "stream_delta": {
            const currentId = streamingMessageIdRef.current;
            if (currentId && data.delta) {
              streamingContentRef.current += data.delta;
              const newContent = streamingContentRef.current;
              updateMessageById(currentId, (msg) => ({
                ...msg,
                content: newContent,
              }));
            }
            break;
          }

          case "stream_end": {
            setIsAwaitingResponse(false);
            setIsStreaming(false);
            const currentId = streamingMessageIdRef.current;

            // Determine the final text content
            const finalText =
              data.question ||
              streamingContentRef.current ||
              "";

            // Determine what type to convert to based on mode
            const mode = data.mode || "data_gathering";
            let finalType: ChatMessage["type"] = "bot";
            if (mode === "goal_exploration") {
              finalType = "bot"; // exploration questions render as bot messages
            } else if (mode === "scenario_framing") {
              finalType = "scenario_question";
            }

            if (currentId) {
              // Finalize the streaming message
              updateMessageById(currentId, (msg) => ({
                ...msg,
                type: finalType,
                content: finalText,
                node_name: data.node_name || undefined,
                extracted_data: data.extracted_data || undefined,
                upcoming_nodes: data.upcoming_nodes || undefined,
                all_collected_data: data.all_collected_data || undefined,
                metadata: {
                  ...msg.metadata,
                  isStreaming: false,
                  complete: data.complete || false,
                  mode,
                  exploration_context: data.exploration_context || undefined,
                  phase1_summary: data.phase1_summary || undefined,
                },
              }));
            } else {
              // No streaming message existed (e.g., goal exploration/scenario that
              // only yields stream_end without prior stream_start)
              addMessage({
                id: `bot-${Date.now()}`,
                type: finalType,
                content: finalText,
                timestamp: new Date(),
                node_name: data.node_name || undefined,
                extracted_data: data.extracted_data || undefined,
                upcoming_nodes: data.upcoming_nodes || undefined,
                all_collected_data: data.all_collected_data || undefined,
                metadata: {
                  complete: data.complete || false,
                  mode,
                  exploration_context: data.exploration_context || undefined,
                  phase1_summary: data.phase1_summary || undefined,
                },
              });
            }

            // Update app state
            if (data.all_collected_data) {
              setCollectedData(data.all_collected_data);
            }
            if (data.node_name) {
              setCurrentNode(data.node_name);
            }
            if (data.goal_state) {
              setGoalState(normalizeGoalState(data.goal_state));
            }

            // Reset streaming refs
            streamingMessageIdRef.current = null;
            streamingContentRef.current = "";
            break;
          }

          // --- Goal & Scenario messages ---

          case "goal_qualification": {
            setIsAwaitingResponse(false);
            setIsStreaming(false);
            const gqId = streamingMessageIdRef.current;
            const gqContent = data.question || streamingContentRef.current || "";
            const gqMeta = {
              goal_id: data.goal_id,
              goal_description: data.goal_description || undefined,
              isStreaming: false,
            };

            if (gqId) {
              // Finalize the in-progress streaming message
              updateMessageById(gqId, (msg) => ({
                ...msg,
                type: "goal_qualification" as ChatMessage["type"],
                content: gqContent,
                metadata: { ...msg.metadata, ...gqMeta },
              }));
            } else {
              addMessage({
                id: `goal-qual-${Date.now()}`,
                type: "goal_qualification",
                content: gqContent,
                timestamp: new Date(),
                metadata: gqMeta,
              });
            }

            if (data.goal_state) {
              setGoalState(normalizeGoalState(data.goal_state));
            }
            streamingMessageIdRef.current = null;
            streamingContentRef.current = "";
            break;
          }

          case "scenario_question": {
            setIsAwaitingResponse(false);
            setIsStreaming(false);
            const sqId = streamingMessageIdRef.current;
            const sqContent = data.question || streamingContentRef.current || "";
            const sqMeta = {
              goal_id: data.goal_id,
              goal_description: data.goal_description || undefined,
              turn: data.turn,
              max_turns: data.max_turns,
              goal_confirmed: data.goal_confirmed || undefined,
              goal_rejected: data.goal_rejected || undefined,
              isStreaming: false,
            };

            if (sqId) {
              // Finalize the in-progress streaming message
              updateMessageById(sqId, (msg) => ({
                ...msg,
                type: "scenario_question" as ChatMessage["type"],
                content: sqContent,
                metadata: { ...msg.metadata, ...sqMeta },
              }));
            } else {
              addMessage({
                id: `scenario-${Date.now()}`,
                type: "scenario_question",
                content: sqContent,
                timestamp: new Date(),
                metadata: sqMeta,
              });
            }

            if (data.goal_state) {
              setGoalState(normalizeGoalState(data.goal_state));
            }
            streamingMessageIdRef.current = null;
            streamingContentRef.current = "";
            break;
          }
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    },
    [addMessage, updateMessageById, setSessionId, setCollectedData, setCurrentNode, setGoalState, normalizeGoalState, setIsAwaitingResponse]
  );

  const connect = useCallback(
    (initialContext?: string, existingSessionId?: string) => {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }
      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        return;
      }

      isConnectingRef.current = true;
      setStatus("connecting");

      isResumingRef.current = !!existingSessionId;

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
        setIsAwaitingResponse(false);
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        isConnectingRef.current = false;
        console.error("WebSocket error:", error);
        setStatus("error");
        setIsAwaitingResponse(false);
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
      setIsAwaitingResponse(true);

      addMessage({
        id: `user-${Date.now()}`,
        type: "user",
        content: answer,
        timestamp: new Date(),
      });

      const message: WSOutgoingMessage = { type: "answer", answer };
      wsRef.current.send(JSON.stringify(message));
    }
  }, [addMessage]);

  // Start a new session (clears existing state)
  const startSession = useCallback(
    (userGoal?: string, forceNew = false) => {
      if (forceNew || !hasExistingSession) {
        clearSession();
      }
      connect(userGoal);
    },
    [connect, clearSession, hasExistingSession]
  );

  // Resume an existing session (keeps state, reconnects WebSocket)
  const resumeSession = useCallback(() => {
    if (sessionId && status === "disconnected" && !isConnectingRef.current) {
      connect(undefined, sessionId);
    }
  }, [sessionId, status, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
    isAwaitingResponse,
    isStreaming,
  };
}
