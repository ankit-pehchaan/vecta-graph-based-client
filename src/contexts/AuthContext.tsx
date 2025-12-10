import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { registerUser, loginUser, logoutUser, initiateRegistration, verifyOTP, resendOTP } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  initiateRegistration: (name: string, email: string, password: string) => Promise<void>;
  verifyRegistration: (otp: string) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
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
          // Token exists, try to decode it to get email
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const email = payload.sub;
              if (email) {
                // Get stored name or use email as fallback
                const storedName = localStorage.getItem('user_name');
                const storedEmail = localStorage.getItem('user_email');
                setUser({
                  email: storedEmail || email,
                  name: storedName || email,
                });
              }
            } catch (e) {
              // Invalid token, clear it
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_name');
              localStorage.removeItem('user_email');
            }
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(email, password, name);
      // Store tokens and user info in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_name', response.name);
      localStorage.setItem('user_email', response.email);
      setUser({
        email: response.email,
        name: response.name,
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const initiateRegistrationHandler = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await initiateRegistration(name, email, password);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyRegistrationHandler = async (otp: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await verifyOTP(otp);
      // Store tokens and user info in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_name', response.name);
      localStorage.setItem('user_email', response.email);
      setUser({
        email: response.email,
        name: response.name,
      });
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendOTPHandler = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await resendOTP();
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(email, password);
      // Store tokens and user info in localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_name', response.name);
      localStorage.setItem('user_email', response.email);
      setUser({
        email: response.email,
        name: response.name,
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
      localStorage.removeItem('user_email');
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
        initiateRegistration: initiateRegistrationHandler,
        verifyRegistration: verifyRegistrationHandler,
        resendOTP: resendOTPHandler,
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

