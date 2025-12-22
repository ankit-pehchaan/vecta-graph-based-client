// API Configuration
// Use VITE_API_BASE_URL environment variable or default to localhost for dev
const getApiBaseUrl = (): string => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
        return envUrl;
    }
    // Default to localhost for development
    return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// Debug mode - enables developer features like export chat
export const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true';

