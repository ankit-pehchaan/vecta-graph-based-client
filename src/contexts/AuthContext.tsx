import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { registerUser, loginUser, logoutUser, ApiError } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

interface User {
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (username: string, password: string, name: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with true to check localStorage
  const [error, setError] = useState<string | null>(null);

  // Restore user session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          // Token exists, try to decode it to get username
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const username = payload.sub;
              if (username) {
                // Get stored name or use username as fallback
                const storedName = localStorage.getItem('user_name');
                setUser({
                  username,
                  name: storedName || username,
                });
              }
            } catch (e) {
              // Invalid token, clear it
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_name');
            }
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_name');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const register = async (username: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(username, password, name);
      // Store tokens and user info in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_name', name); // Store name for session restoration
      setUser({
        username: response.username,
        name: name,
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(username, password);
      // Store tokens and user info in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      if (response.name) {
        localStorage.setItem('user_name', response.name);
      }
      setUser({
        username: response.username,
        name: response.name || response.username, // Use name from response or username as fallback
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      // Clear tokens and user info from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_name');
      setUser(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = () => {
    return localStorage.getItem('access_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        register,
        login,
        logout,
        error,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

