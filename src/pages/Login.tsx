import { Link, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import PasswordInput from '../components/PasswordInput';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { validateEmail, validateLoginPassword } from '../utils/validation';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validateLoginPassword(password);

    const newErrors = {
      email: emailError,
      password: passwordError,
    };

    setErrors(newErrors);

    if (!emailError && !passwordError) {
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err) {
        // Error from auth context will be shown
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="max-w-md w-full p-8 bg-gray-50 dark:bg-gray-950 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sign in to your Vecta account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2.5 bg-white dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            error={errors.password}
          />

          {error && !errors.email && !errors.password && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 font-medium">OR</span>
          </div>
        </div>

        <GoogleLoginButton mode="login" />

        <div className="text-center mt-5">
          <span className="text-sm text-gray-600 dark:text-gray-400">Don't have an account? </span>
          <Link to="/register" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
