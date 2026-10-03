import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBackendStatus } from '../context/BackendStatusContext';
import { OfflineBanner, WakeUpBanner } from '../components/Banners';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { checkHealth } = useBackendStatus();
  const navigate = useNavigate();

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response) {
        setError('Cannot reach server. Render backend may still be waking up. Please try again in a few seconds.');
      } else if (err.response.status === 401) {
        setError('Invalid username or password. Please try again.');
      } else {
        setError(err.response?.data?.detail || 'An error occurred during login. Please retry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <OfflineBanner />
        <WakeUpBanner />

        {/* Branding */}
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-950 text-white mb-4 shadow-sm">
            <span className="font-bold text-xl tracking-wider">KA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950">
            KANAKKU AI
          </h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Digital Accounting System</p>
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-900">Sign in to your account</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your credentials to access your daily shop records
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="mt-6 mx-4 sm:mx-0 bg-white py-8 px-6 sm:px-10 shadow-sm border border-shop-border sm:rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Username or Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. iqbal"
                  required
                  className="w-full pl-10 pr-3 py-3 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-gray-950 text-white font-semibold text-sm py-3.5 px-4 rounded-xl hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Shop Accounting System</span>
          </div>
        </div>
      </div>
    </div>
  );
}
