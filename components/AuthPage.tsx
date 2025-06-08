
import React, { useState, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Keep useNavigate for potential future use if needed, but not for post-auth redirect here.
import { User } from '../types';
import { PATHS, AUTH_MODES, APP_NAME } from '../constants';
import Button from './common/Button';
import Input from './common/Input';
import { GoogleIcon } from './icons/GoogleIcon';
import { LogoIcon } from './icons/LogoIcon';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const { mode } = useParams<{ mode: string }>();
  // const navigate = useNavigate(); // Not strictly needed if redirection is fully declarative
  const isLogin = mode === AUTH_MODES.LOGIN;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    // Mock authentication
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name: isLogin ? 'Mock User' : name,
    };
    onAuthSuccess(mockUser);
    // navigate(PATHS.LEARN); // Removed: Redirection is handled by AppRoutes based on currentUser update
  };
  
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    const mockUser: User = {
      id: 'google-' + Date.now().toString(),
      email: 'user@google.com',
      name: 'Google User'
    };
    onAuthSuccess(mockUser);
    // navigate(PATHS.LEARN); // Removed: Redirection is handled by AppRoutes based on currentUser update
  };


  return (
    <div className="min-h-screen bg-lightbg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LogoIcon className="mx-auto h-12 w-auto text-primary" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-darktext">
          {isLogin ? 'Log in to your account' : `Create your ${APP_NAME} account`}
        </h2>
        <p className="mt-2 text-center text-sm text-mediumtext">
          Or{' '}
          {isLogin ? (
            <Link to={PATHS.SIGNUP} className="font-medium text-primary hover:text-primary-dark">
              create a new account
            </Link>
          ) : (
            <Link to={PATHS.LOGIN} className="font-medium text-primary hover:text-primary-dark">
              log in to your existing account
            </Link>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                label="Full Name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && (
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                {isLogin ? 'Log In' : 'Sign Up'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-mediumtext">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="ghost"
                className="w-full border border-gray-300 text-mediumtext hover:bg-gray-50"
                onClick={handleGoogleAuth}
                isLoading={isLoading && !email} // Only show loading if this button was specifically clicked
                leftIcon={<GoogleIcon className="w-5 h-5" />}
              >
                Sign in with Google (Mock)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;