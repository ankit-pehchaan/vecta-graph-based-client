"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { ChatMessage, GoalState } from "@/types/websocket";

export interface Bookmark {
  id: string;
  title: string;
  description: string;
  chartType: string;
  data: Record<string, any>;
  config: Record<string, any>;
  timestamp: Date;
}

interface AppContextType {
  // Session state
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  status: "connecting" | "connected" | "disconnected" | "error";
  setStatus: (status: "connecting" | "connected" | "disconnected" | "error") => void;
  
  // Messages
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addMessage: (message: ChatMessage) => void;
  
  // Goals
  goalState: GoalState;
  setGoalState: (state: GoalState) => void;
  
  // Collected Data
  collectedData: Record<string, Record<string, any>>;
  setCollectedData: (data: Record<string, Record<string, any>>) => void;
  
  // Field History
  fieldHistory: Record<string, Record<string, any[]>>;
  setFieldHistory: (history: Record<string, Record<string, any[]>>) => void;
  
  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, "id" | "timestamp">) => void;
  removeBookmark: (id: string) => void;
  
  // Current node
  currentNode: string | null;
  setCurrentNode: (node: string | null) => void;
  
  // Session management
  clearSession: () => void;
  hasExistingSession: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [goalState, setGoalState] = useState<GoalState>({
    qualified_goals: [],
    possible_goals: [],
    rejected_goals: [],
  });
  const [collectedData, setCollectedData] = useState<Record<string, Record<string, any>>>({});
  const [fieldHistory, setFieldHistory] = useState<Record<string, Record<string, any[]>>>({});
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);

  // Load session and bookmarks from localStorage on mount
  useEffect(() => {
    // Load bookmarks
    const savedBookmarks = localStorage.getItem("vecta-bookmarks");
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setBookmarks(parsed.map((b: any) => ({ ...b, timestamp: new Date(b.timestamp) })));
      } catch (e) {
        console.error("Failed to parse bookmarks:", e);
      }
    }
    
    // Load session state
    const savedSession = localStorage.getItem("vecta-session");
    if (savedSession) {
      try {
        const { sessionId: savedId, messages: savedMessages, goalState: savedGoals, collectedData: savedData, currentNode: savedNode } = JSON.parse(savedSession);
        if (savedId) setSessionId(savedId);
        if (savedMessages) setMessages(savedMessages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        if (savedGoals) setGoalState(savedGoals);
        if (savedData) setCollectedData(savedData);
        if (savedNode) setCurrentNode(savedNode);
      } catch (e) {
        console.error("Failed to parse session:", e);
      }
    }
  }, []);

  // Save bookmarks to localStorage when they change
  useEffect(() => {
    localStorage.setItem("vecta-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save session state to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("vecta-session", JSON.stringify({
        sessionId,
        messages,
        goalState,
        collectedData,
        currentNode,
      }));
    }
  }, [sessionId, messages, goalState, collectedData, currentNode]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "id" | "timestamp">) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setBookmarks((prev) => [...prev, newBookmark]);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Clear session and start fresh
  const clearSession = useCallback(() => {
    localStorage.removeItem("vecta-session");
    setSessionId(null);
    setMessages([]);
    setGoalState({
      qualified_goals: [],
      possible_goals: [],
      rejected_goals: [],
    });
    setCollectedData({});
    setCurrentNode(null);
  }, []);

  // Check if there's an existing session
  const hasExistingSession = sessionId !== null && messages.length > 0;

  return (
    <AppContext.Provider
      value={{
        sessionId,
        setSessionId,
        status,
        setStatus,
        messages,
        setMessages,
        addMessage,
        goalState,
        setGoalState,
        collectedData,
        setCollectedData,
        fieldHistory,
        setFieldHistory,
        bookmarks,
        addBookmark,
        removeBookmark,
        currentNode,
        setCurrentNode,
        clearSession,
        hasExistingSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

