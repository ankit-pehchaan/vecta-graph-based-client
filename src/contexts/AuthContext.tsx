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
  initializing: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  initiateRegistration: (name: string, email: string, password: string) => Promise<void>;
  verifyRegistration: (otp: string) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  handleGoogleCallback: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // For action loading states
  const [initializing, setInitializing] = useState(true); // For initial session check
  const [error, setError] = useState<string | null>(null);

  // Restore user session on mount by checking with backend
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Simply call /me endpoint - backend will check cookies
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.data;
          setUser({
            email: userData.email,
            name: userData.name,
          });
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        // Clear user info from localStorage
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(email, password, name);
      // Store user info in localStorage (tokens are in cookies)
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
      // Store user info in localStorage (tokens are in cookies)
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
      // Store user info in localStorage (tokens are in cookies)
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
      // Clear user info from localStorage (cookies are cleared by backend)
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

  const handleGoogleCallback = async () => {
    setLoading(true);
    setError(null);
    try {
      // After Google OAuth, the backend sets cookies automatically
      // We need to fetch the current user to get their info
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      const userData = data.data;

      // Store user info in localStorage (tokens are in cookies)
      localStorage.setItem('user_name', userData.name);
      localStorage.setItem('user_email', userData.email);
      
      setUser({
        email: userData.email,
        name: userData.name,
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        initializing,
        register,
        initiateRegistration: initiateRegistrationHandler,
        verifyRegistration: verifyRegistrationHandler,
        resendOTP: resendOTPHandler,
        login,
        logout,
        handleGoogleCallback,
        error,
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

