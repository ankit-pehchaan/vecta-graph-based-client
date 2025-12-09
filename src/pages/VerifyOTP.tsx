import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, type FormEvent } from 'react';
import OTPInput from '../components/OTPInput';
import { validateOTP } from '../utils/validation';
import { useAuth } from '../hooks/useAuth';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { verifyRegistration, loading, error } = useAuth();

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setOtpError('');

    const otpValidationError = validateOTP(otp);
    if (otpValidationError) {
      setOtpError(otpValidationError);
      return;
    }

    const success = await verifyRegistration(otp);
    if (success) {
      navigate('/dashboard');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify Your Email</h1>
          <p className="text-sm text-gray-500">We've sent a 6-digit code to your email. Please check your inbox.</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2 text-center">
              Enter OTP
            </label>
            <OTPInput value={otp} onChange={setOtp} error={otpError} disabled={loading} />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Time remaining:{' '}
              <span className={`font-semibold ${timeRemaining < 60 ? 'text-red-500' : 'text-blue-500'}`}>
                {formatTime(timeRemaining)}
              </span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2.5 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          <div className="text-center">
            <Link to="/register" className="text-sm text-gray-600 hover:text-gray-800">
              ← Back to registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
