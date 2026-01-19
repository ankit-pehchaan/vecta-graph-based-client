/**
 * WebSocket message type definitions matching backend schemas.
 */

export type WSMessageType = 
  | "answer"
  | "question"
  | "complete"
  | "error"
  | "session_start"
  | "calculation"
  | "visualization"
  | "mode_switch"
  | "traversal_paused"
  | "resume_prompt"
  | "goal_qualification"
  | "goal_update"
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
  upcoming_nodes?: string[];  // Frontier for user visibility
  all_collected_data?: Record<string, Record<string, any>>;  // All data across all nodes
  planned_target_node?: string | null;
  planned_target_field?: string | null;
}

export interface WSComplete extends WSMessage {
  type: "complete";
  node_complete: boolean;
  visited_all: boolean;
  next_node: string | null;
  upcoming_nodes?: string[];  // Remaining frontier
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

export interface WSCalculation extends WSMessage {
  type: "calculation";
  calculation_type: string;
  result: Record<string, any>;
  can_calculate: boolean;
  missing_data: string[];
  message: string;
  data_used: string[];
}

export interface WSVisualization extends WSMessage {
  type: "visualization";
  chart_type: string;
  data: Record<string, any>;
  title: string;
  description: string;
  config: Record<string, any>;
}

export interface WSModeSwitch extends WSMessage {
  type: "mode_switch";
  mode: string;
  previous_mode?: string | null;
}

export interface WSGoalQualification extends WSMessage {
  type: "goal_qualification";
  question: string;
  goal_id: string;
  goal_description?: string | null;
}

export interface WSGoalUpdate extends WSMessage {
  type: "goal_update";
  qualified_goals: Array<Record<string, any>>;
  possible_goals: Array<Record<string, any>>;
  rejected_goals: string[];
}

export interface WSTraversalPaused extends WSMessage {
  type: "traversal_paused";
  paused_node?: string | null;
  message: string;
}

export interface WSResumePrompt extends WSMessage {
  type: "resume_prompt";
  message: string;
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
}

export type WSIncomingMessage = 
  | WSQuestion 
  | WSComplete 
  | WSError 
  | WSSessionStart
  | WSCalculation
  | WSVisualization
  | WSModeSwitch
  | WSTraversalPaused
  | WSResumePrompt
  | WSGoalQualification
  | WSGoalUpdate
  | WSScenarioQuestion;

export type WSOutgoingMessage = WSAnswer | { initial_context?: string; user_goal?: string };

export interface ChatMessage {
  id: string;
  type: "user" | "bot" | "system" | "error" | "calculation" | "visualization" | "goal_qualification" | "mode_switch" | "traversal_paused" | "scenario_question";
  content: string;
  timestamp: Date;
  node_name?: string;
  extracted_data?: Record<string, any>;
  upcoming_nodes?: string[];  // Frontier for display
  all_collected_data?: Record<string, Record<string, any>>;  // All data across all nodes
  metadata?: {
    session_id?: string;
    next_node?: string;
    complete?: boolean;  // phase1_complete - data gathering done
    goal_id?: string;
    goal_description?: string;
    // Scenario question metadata
    turn?: number;
    max_turns?: number;
    goal_confirmed?: boolean;
    goal_rejected?: boolean;
  };
  // Calculation data
  calculation?: {
    calculation_type: string;
    result: Record<string, any>;
    can_calculate: boolean;
    missing_data: string[];
    message: string;
    data_used: string[];
  };
  // Visualization data
  visualization?: {
    chart_type: string;
    data: Record<string, any>;
    title: string;
    description: string;
    config: Record<string, any>;
  };
}

export interface GoalState {
  qualified_goals: Array<Record<string, any>>;
  possible_goals: Array<Record<string, any>>;
  rejected_goals: string[];
}
