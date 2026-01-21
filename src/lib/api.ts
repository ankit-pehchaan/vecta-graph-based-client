const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SessionSummary {
  user_goal: string | null;
  goal_state: {
    qualified_goals: Array<Record<string, any>>;
    possible_goals: Array<Record<string, any>>;
    rejected_goals: string[];
  } | null;
  nodes_collected: string[];
  traversal_order: string[];
  edges: Array<{ from_node: string; to_node: string; reason: string }>;
  data: Record<string, Record<string, any>>;
}

export interface FieldHistoryEntry {
  value: any;
  timestamp: string;
  source: string;
  previous_value: any | null;
  conflict_resolved: boolean;
  reasoning: string | null;
}

export interface FieldHistoryResponse {
  field_history: Record<string, Record<string, FieldHistoryEntry[]>>;
  conflicts: Record<string, Record<string, any>>;
}

export async function getSessionSummary(sessionId: string): Promise<SessionSummary> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/summary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch session summary: ${response.statusText}`);
  }
  return response.json();
}

export async function getFieldHistory(sessionId: string): Promise<FieldHistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/history`);
  if (!response.ok) {
    throw new Error(`Failed to fetch field history: ${response.statusText}`);
  }
  return response.json();
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("API health check failed");
  }
  return response.json();
}

export function getWebSocketUrl(sessionId?: string): string {
  const wsBase = API_BASE_URL.replace(/^http/, "ws");
  return sessionId ? `${wsBase}/ws/${sessionId}` : `${wsBase}/ws`;
}

