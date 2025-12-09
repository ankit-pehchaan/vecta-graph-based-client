import { Link, useNavigate } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import PasswordInput from '../components/PasswordInput';
import {
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateEmail,
} from '../utils/validation';
import { useAuth } from '../hooks/useAuth';
import { getFieldError } from '../utils/errorHandler';

export default function Register() {
  const navigate = useNavigate();
  const { initiateRegistration, loading, error } = useAuth();

  const [name, setName] = useState('Test User');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Test@1234');
  const [confirmPassword, setConfirmPassword] = useState('Test@1234');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    const newErrors = {
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    };

    setErrors(newErrors);

    if (!nameError && !emailError && !passwordError && !confirmPasswordError) {
      try {
        await initiateRegistration(name, email, password);
        navigate('/verify-otp');
      } catch (err: any) {
        const errorMessage = err?.message || '';
        if (errorMessage.includes('Verification already in progress') || errorMessage.includes('already in progress')) {
          navigate('/verify-otp');
          return;
        }

        // Get backend validation errors if any
        const backendNameError = getFieldError(err, 'name');
        const backendEmailError = getFieldError(err, 'email');
        const backendPasswordError = getFieldError(err, 'password');

        // Update field errors with backend validation errors
        if (backendNameError || backendEmailError || backendPasswordError) {
          setErrors({
            name: backendNameError || nameError,
            email: backendEmailError || emailError,
            password: backendPasswordError || passwordError,
            confirmPassword: confirmPasswordError,
          });
        }

        // Error from auth context will be shown if no field-specific errors
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full p-8 bg-gray-50 rounded-3xl shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold text-blue-500">Vecta</span>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Vecta Account</h1>
          <p className="text-sm text-gray-500">Join Vecta to manage your finances securely.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                errors.email ? 'border-red-500' : 'border-gray-300'
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
            placeholder="Enter a strong password"
            error={errors.password}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
          />

          {error && !errors.name && !errors.email && !errors.password && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Continue'}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link to="/login" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
