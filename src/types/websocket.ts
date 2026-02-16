/**
 * WebSocket message type definitions matching backend schemas.
 *
 * Backend sends these event types:
 * - session_start: new session created
 * - question: initial question (from orchestrator.start())
 * - stream_start: streaming response about to begin
 * - stream_delta: incremental text chunk
 * - stream_end: streaming complete with full metadata
 * - goal_qualification: ask user to confirm a deduced goal
 * - scenario_question: scenario framing for inferred goals
 * - error: something went wrong
 * - complete: legacy completion (rarely used)
 */

export type WSMessageType =
  | "answer"
  | "question"
  | "complete"
  | "error"
  | "session_start"
  | "stream_start"
  | "stream_delta"
  | "stream_end"
  | "goal_qualification"
  | "scenario_question";

export interface WSMessage {
  type: WSMessageType;
}

export interface WSAnswer extends WSMessage {
  type: "answer";
  answer: string;
}

export interface WSQuestion extends WSMessage {
  type: "question";
  question: string | null;
  node_name: string;
  extracted_data: Record<string, any>;
  complete: boolean;
  upcoming_nodes?: string[];
  all_collected_data?: Record<string, Record<string, any>>;
  planned_target_node?: string | null;
  planned_target_field?: string | null;
  goal_state?: GoalState;
  goal_details?: {
    goal_id: string;
    missing_fields?: string[];
  };
}

export interface WSComplete extends WSMessage {
  type: "complete";
  node_complete: boolean;
  visited_all: boolean;
  next_node: string | null;
  upcoming_nodes?: string[];
  reason: string | null;
}

export interface WSError extends WSMessage {
  type: "error";
  message: string;
}

export interface WSSessionStart extends WSMessage {
  type: "session_start";
  session_id: string;
  initial_context: string | null;
}

// --- Streaming messages ---

export interface WSStreamStart extends WSMessage {
  type: "stream_start";
  mode: string;
}

export interface WSStreamDelta extends WSMessage {
  type: "stream_delta";
  delta: string;
}

export interface WSStreamEnd extends WSMessage {
  type: "stream_end";
  mode: string;
  question?: string | null;
  node_name?: string | null;
  extracted_data?: Record<string, any>;
  complete?: boolean;
  upcoming_nodes?: string[] | null;
  all_collected_data?: Record<string, Record<string, any>>;
  goal_state?: GoalState | null;
  exploration_context?: {
    goal_id?: string;
    turn?: number;
    max_turns?: number;
  } | null;
  scenario_context?: Record<string, any> | null;
  phase1_summary?: string | null;
}

// --- Goal & Scenario messages ---

export interface WSGoalQualification extends WSMessage {
  type: "goal_qualification";
  question: string;
  goal_id: string;
  goal_description?: string | null;
  goal_state?: GoalState;
}

export interface WSScenarioQuestion extends WSMessage {
  type: "scenario_question";
  question: string;
  goal_id: string;
  goal_description?: string | null;
  turn: number;
  max_turns: number;
  goal_confirmed?: boolean | null;
  goal_rejected?: boolean | null;
  goal_state?: GoalState;
}

export type WSIncomingMessage =
  | WSQuestion
  | WSComplete
  | WSError
  | WSSessionStart
  | WSStreamStart
  | WSStreamDelta
  | WSStreamEnd
  | WSGoalQualification
  | WSScenarioQuestion;

export type WSOutgoingMessage = WSAnswer | { initial_context?: string; user_goal?: string };

export interface ChatMessage {
  id: string;
  type: "user" | "bot" | "system" | "error" | "goal_qualification" | "scenario_question" | "streaming";
  content: string;
  timestamp: Date;
  node_name?: string;
  extracted_data?: Record<string, any>;
  upcoming_nodes?: string[];
  all_collected_data?: Record<string, Record<string, any>>;
  metadata?: {
    session_id?: string;
    next_node?: string;
    complete?: boolean;
    goal_id?: string;
    goal_description?: string;
    // Scenario question metadata
    turn?: number;
    max_turns?: number;
    goal_confirmed?: boolean;
    goal_rejected?: boolean;
    goal_details?: {
      goal_id: string;
      missing_fields?: string[];
    };
    // Streaming metadata
    mode?: string;
    isStreaming?: boolean;
    exploration_context?: {
      goal_id?: string;
      turn?: number;
      max_turns?: number;
    };
    phase1_summary?: string;
  };
}

export interface GoalState {
  qualified_goals: Array<Record<string, any>>;
  possible_goals: Array<Record<string, any>>;
  rejected_goals: string[];
  deferred_goals: Array<Record<string, any>>;
}
