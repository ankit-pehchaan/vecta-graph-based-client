import { Link } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import PasswordInput from '../components/PasswordInput';
import { validateUsername, validatePassword, validateConfirmPassword } from '../utils/validation';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '', confirmPassword: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);

    const newErrors = {
      username: usernameError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    };

    setErrors(newErrors);

    if (!usernameError && !passwordError && !confirmPasswordError) {
      console.log('Register Form Data:', {
        username,
        password,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('Registration validation failed:', newErrors);
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
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your username"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
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

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors mt-4 text-sm"
          >
            Create Account
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
