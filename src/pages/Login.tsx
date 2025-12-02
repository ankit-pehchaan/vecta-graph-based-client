import { Link } from 'react-router-dom';
import { useState, type FormEvent } from 'react';
import PasswordInput from '../components/PasswordInput';
import { validateUsername, validatePassword } from '../utils/validation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    const newErrors = {
      username: usernameError,
      password: passwordError,
    };

    setErrors(newErrors);

    if (!usernameError && !passwordError) {
      console.log('Login Form Data:', {
        username,
        password,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('Login validation failed:', newErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full p-8 bg-gray-50 rounded-3xl shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-500">Sign in to your Vecta account.</p>
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
            placeholder="Enter your password"
            error={errors.password}
          />

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors mt-4 text-sm"
          >
            Sign In
          </button>
        </form>

        <div className="text-center mt-5">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <Link to="/register" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
