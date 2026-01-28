const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.vectatech.com.au";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterVerifyPayload {
  otp: string;
}

export function getCsrfToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  // Read CSRF token from cookie set by backend (CSRF_COOKIE_HTTP_ONLY=false)
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

async function request<T>(path: string, options: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(data?.message || response.statusText);
  }
  return data;
}

export async function registerInitiate(payload: RegisterPayload): Promise<ApiResponse> {
  return request("/api/v1/auth/register/initiate", {
    method: "POST",
    headers: {
      "X-CSRF-Token": getCsrfToken(),
    },
    body: JSON.stringify(payload),
  });
}

export async function registerVerify(payload: RegisterVerifyPayload): Promise<ApiResponse> {
  return request("/api/v1/auth/register/verify", {
    method: "POST",
    headers: {
      "X-CSRF-Token": getCsrfToken(),
    },
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<ApiResponse> {
  return request("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "X-CSRF-Token": getCsrfToken(),
    },
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<ApiResponse> {
  return request("/api/v1/auth/logout", {
    method: "POST",
    headers: {
      "X-CSRF-Token": getCsrfToken(),
    },
  });
}

export async function getCurrentUser(): Promise<ApiResponse> {
  return request("/api/v1/auth/me", {
    method: "GET",
  });
}

export async function getGoogleAuthUrl(): Promise<string> {
  const response = await request<{ auth_url: string }>(
    "/api/v1/auth/google/login",
    {
      method: "GET",
    }
  );
  return response.data?.auth_url || "";
}

