import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = async () => {
      const auth = searchParams.get('auth');
      const newUser = searchParams.get('new_user');
      const errorMessage = searchParams.get('message');

      if (auth === 'success') {
        try {
          await handleGoogleCallback();
          
          if (newUser === 'true') {
            setMessage('Welcome! Your account has been created.');
          } else {
            setMessage('Welcome back!');
          }
          
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        } catch (error) {
          console.error('Authentication error:', error);
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
        }
      } else if (auth === 'error') {
        setMessage(errorMessage || 'Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, []); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-700 text-lg">{message}</p>
      </div>
    </div>
  );
}
