import React, { useState } from 'react';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: {
    email: string;
    password: string;
    username?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  onModeChange: (mode: 'login' | 'register') => void;
  isLoading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  onModeChange,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email and password are required');
      return;
    }

    const result = await onSubmit(formData);
    
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary mb-2">P2P Chat</h1>
          <p className="text-textSecondary">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-textPrimary mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                className={clsx(
                  'w-full bg-messageSent border border-border rounded-lg px-4 py-3',
                  'text-textPrimary placeholder-textSecondary',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                  'transition-all duration-150',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
                placeholder="Choose a username"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-textPrimary mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              className={clsx(
                'w-full bg-messageSent border border-border rounded-lg px-4 py-3',
                'text-textPrimary placeholder-textSecondary',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                'transition-all duration-150',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={clsx(
                  'w-full bg-messageSent border border-border rounded-lg px-4 py-3 pr-12',
                  'text-textPrimary placeholder-textSecondary',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                  'transition-all duration-150',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textSecondary hover:text-textPrimary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'w-full bg-accent text-white font-medium py-3 rounded-lg',
              'hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background',
              'transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              !isLoading && 'hover:scale-[1.02]'
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Mode toggle */}
        <div className="text-center mt-6">
          <p className="text-textSecondary">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              disabled={isLoading}
              className="text-accent hover:text-accent/80 font-medium transition-colors disabled:opacity-50"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};