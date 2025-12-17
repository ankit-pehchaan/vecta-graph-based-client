import { API_BASE_URL } from '../config';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface TokenResponse {
  email: string;
  name: string;
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface InitiateRegistrationRequest {
  name: string;
  email: string;
  password: string;
}

interface InitiateRegistrationResponse {
  verification_token: string;
}

interface VerifyOTPRequest {
  otp: string;
}

// VerifyOTPResponse is the same as TokenResponse
type VerifyOTPResponse = TokenResponse;

interface LoginRequest {
  email: string;
  password: string;
}

class ApiError extends Error {
  statusCode?: number;
  data?: any;

  constructor(
    message: string,
    statusCode?: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
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
  email: string,
  password: string,
  name: string
): Promise<TokenResponse> {
  const requestBody: RegisterRequest = {
    email,
    password,
    name,
  };

  return apiClient<TokenResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

export async function initiateRegistration(
  name: string,
  email: string,
  password: string
): Promise<InitiateRegistrationResponse> {
  const requestBody: InitiateRegistrationRequest = {
    name,
    email,
    password,
  };

  return apiClient<InitiateRegistrationResponse>('/api/v1/auth/register/initiate', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

export async function verifyOTP(
  otp: string
): Promise<VerifyOTPResponse> {
  const requestBody: VerifyOTPRequest = {
    otp: otp,
  };

  return apiClient<VerifyOTPResponse>('/api/v1/auth/register/verify', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

interface ResendOTPResponse {
  message: string;
}

export async function resendOTP(): Promise<ResendOTPResponse> {
  return apiClient<ResendOTPResponse>('/api/v1/auth/register/resend-otp', {
    method: 'POST',
  });
}

export async function loginUser(
  email: string,
  password: string
): Promise<TokenResponse> {
  const requestBody: LoginRequest = {
    email,
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

// Google OAuth
interface GoogleAuthUrlResponse {
  auth_url: string;
  state: string;
}

export async function getGoogleAuthUrl(): Promise<GoogleAuthUrlResponse> {
  return apiClient<GoogleAuthUrlResponse>('/api/v1/auth/google/login', {
    method: 'GET',
  });
}

export interface CurrentUserResponse {
  email: string;
  name: string;
  account_status: string;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiClient<CurrentUserResponse>('/api/v1/auth/me', {
    method: 'GET',
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
  content: string;  // Chunk of content when streaming
  is_complete: boolean;  // True when this is the final chunk
  summary?: string;  // Full summary (for non-streaming/final)
  insights?: string[];
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

// Document Upload Types
export type DocumentType = 'bank_statement' | 'tax_return' | 'investment_statement' | 'payslip';

export interface DocumentUploadMessage extends WebSocketMessage {
  type: 'document_upload';
  s3_url: string;
  document_type: DocumentType;
  filename: string;
}

export interface DocumentConfirmMessage extends WebSocketMessage {
  type: 'document_confirm';
  extraction_id: string;
  confirmed: boolean;
  corrections?: Record<string, unknown>;
}

export interface DocumentProcessingMessage extends WebSocketMessage {
  type: 'document_processing';
  status: 'downloading' | 'parsing' | 'analyzing' | 'complete' | 'error';
  message: string;
}

export interface ExtractedData {
  goals: Array<{
    description: string;
    amount?: number;
    timeline_years?: number;
    priority?: 'High' | 'Medium' | 'Low';
  }>;
  assets: Array<{
    asset_type: string;
    description: string;
    value?: number;
    institution?: string;
  }>;
  liabilities: Array<{
    liability_type: string;
    description: string;
    amount?: number;
    monthly_payment?: number;
    interest_rate?: number;
  }>;
  insurance: Array<{
    insurance_type: string;
    provider?: string;
    coverage_amount?: number;
  }>;
  superannuation: Array<{
    fund_name: string;
    balance?: number;
    employer_contribution_rate?: number;
    personal_contribution_rate?: number;
    investment_option?: string;
  }>;
  income?: number;
  monthly_income?: number;
  expenses?: number;
}

export interface DocumentExtractionMessage extends WebSocketMessage {
  type: 'document_extraction';
  extraction_id: string;
  summary: string;
  extracted_data: ExtractedData;
  document_type: string;
  requires_confirmation: boolean;
}

// Financial Profile types
export interface Goal {
  description?: string;
  amount?: number;
  timeline_years?: number;
  priority?: string;
  motivation?: string;
  created_at?: string;
}

export interface Asset {
  asset_type?: string; // australian_shares, managed_funds, family_home, investment_property, superannuation, savings, term_deposits, bonds, cryptocurrency, other
  description?: string;
  value?: number;
  institution?: string;
  account_number?: string;
  created_at?: string;
}

export interface Liability {
  liability_type?: string; // home_loan, car_loan, personal_loan, credit_card, investment_loan, other
  description?: string;
  amount?: number; // Outstanding balance
  monthly_payment?: number;
  interest_rate?: number;
  institution?: string;
  account_number?: string;
  created_at?: string;
}

export interface Insurance {
  insurance_type?: string; // life, health, income_protection, TPD, trauma, home_insurance, car_insurance, other
  provider?: string;
  coverage_amount?: number;
  monthly_premium?: number;
  policy_number?: string;
  created_at?: string;
}

export interface FinancialProfile {
  email: string;
  goals: Goal[];
  assets: Asset[];
  liabilities: Liability[];
  cash_balance?: number; // Total cash in bank accounts/savings
  superannuation?: number; // Total superannuation balance
  income?: number;
  monthly_income?: number;
  expenses?: number;
  risk_tolerance?: string;
  insurance: Insurance[];
  financial_stage?: string;
  updated_at?: string;
  created_at?: string;
}

// WebSocket connection helper - cookies are sent automatically
export function createWebSocketUrl(path: string): string {
  const baseUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
  return `${baseUrl}${path}`;
}

export { ApiError };

