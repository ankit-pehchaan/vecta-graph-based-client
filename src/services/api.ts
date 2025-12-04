import { API_BASE_URL } from '../config';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface TokenResponse {
  username: string;
  name?: string;
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  name: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: send/receive cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch (jsonError) {
    // If response is not JSON, create a generic error
    throw new ApiError(
      `Server error: ${response.statusText}`,
      response.status,
      {}
    );
  }

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data.data || {}
    );
  }

  return data.data as T;
}

export async function registerUser(
  username: string,
  password: string,
  name: string
): Promise<TokenResponse> {
  const requestBody: RegisterRequest = {
    username,
    password,
    name,
  };

  return apiClient<TokenResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

export async function loginUser(
  username: string,
  password: string
): Promise<TokenResponse> {
  const requestBody: LoginRequest = {
    username,
    password,
  };

  return apiClient<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

export async function logoutUser(): Promise<void> {
  await apiClient('/api/v1/auth/logout', {
    method: 'POST',
  });
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  timestamp?: string;
}

export interface GreetingMessage extends WebSocketMessage {
  type: 'greeting';
  message: string;
  is_first_time: boolean;
}

export interface AgentResponseMessage extends WebSocketMessage {
  type: 'agent_response';
  content: string;
  is_complete: boolean;
}

export interface ProfileUpdateMessage extends WebSocketMessage {
  type: 'profile_update';
  profile: FinancialProfile;
  changes?: Record<string, any>;
}

export interface IntelligenceSummaryMessage extends WebSocketMessage {
  type: 'intelligence_summary';
  summary: string;
  insights: string[];
}

export interface SuggestedNextStepsMessage extends WebSocketMessage {
  type: 'suggested_next_steps';
  steps: string[];
  priority?: string;
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  message: string;
  code?: string;
}

export interface UserMessage extends WebSocketMessage {
  type: 'user_message';
  content: string;
}

// Financial Profile types
export interface Goal {
  description: string;
  amount?: number;
  timeline_years?: number;
  priority?: string;
  motivation?: string;
  created_at?: string;
}

export interface Asset {
  asset_type: string;
  description: string;
  value?: number;
  institution?: string;
  created_at?: string;
}

export interface Liability {
  liability_type: string;
  description: string;
  amount?: number;
  monthly_payment?: number;
  interest_rate?: number;
  institution?: string;
  created_at?: string;
}

export interface Insurance {
  insurance_type: string;
  provider?: string;
  coverage_amount?: number;
  monthly_premium?: number;
  created_at?: string;
}

export interface FinancialProfile {
  username: string;
  goals: Goal[];
  assets: Asset[];
  liabilities: Liability[];
  income?: number;
  monthly_income?: number;
  expenses?: number;
  risk_tolerance?: string;
  insurance: Insurance[];
  financial_stage?: string;
  updated_at?: string;
  created_at?: string;
}

// WebSocket connection helper
export function createWebSocketUrl(path: string, token: string | null): string {
  const baseUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
  const url = new URL(path, baseUrl);
  if (token) {
    url.searchParams.set('token', token);
  }
  return url.toString();
}

export { ApiError };

