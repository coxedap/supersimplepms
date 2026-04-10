import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';

type Step = 'email' | 'password' | 'setup';

interface LoginPageProps {
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoToRegister }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setup, setSetup] = useState({ name: '', password: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus();
    if (step === 'setup') nameRef.current?.focus();
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await api.post<{ status: 'active' | 'setup_required' | 'not_found' }>(
        '/auth/check-email',
        { email }
      );
      if (data.status === 'not_found') {
        setError('No account found for this email.');
      } else if (data.status === 'setup_required') {
        setStep('setup');
      } else {
        setStep('password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      useToastStore.getState().addToast(`Welcome back, ${data.name}!`, 'success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!setup.name.trim()) { setError('Name is required.'); return; }
    if (setup.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (setup.password !== setup.confirm) { setError('Passwords do not match.'); return; }
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/setup', {
        email,
        name: setup.name,
        password: setup.password,
      });
      login(data);
      useToastStore.getState().addToast(`Welcome, ${data.name}!`, 'success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set up account.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep('email');
    setPassword('');
    setSetup({ name: '', password: '', confirm: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
          <span className="text-white text-2xl font-black">EX</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">PMS 0.1</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'email' && 'Sign in to your workspace.'}
          {step === 'password' && 'Enter your password.'}
          {step === 'setup' && 'Set up your account to get started.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Step 1 — Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email</label>
                <input
                  required
                  type="email"
                  autoFocus
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </button>
              <div className="border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={onGoToRegister}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  + Create a new organization
                </button>
              </div>
            </form>
          )}

          {/* Step 2a — Password */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-sm text-gray-700 font-medium truncate">{email}</span>
                <button type="button" onClick={goBack} className="ml-auto text-xs text-blue-600 font-bold hover:underline whitespace-nowrap">
                  Change
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Password</label>
                <input
                  required
                  ref={passwordRef}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Step 2b — Setup (inactive user) */}
          {step === 'setup' && (
            <form onSubmit={handleSetupSubmit} className="space-y-5">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-sm text-blue-700 font-medium truncate">{email}</span>
                <button type="button" onClick={goBack} className="ml-auto text-xs text-blue-600 font-bold hover:underline whitespace-nowrap">
                  Change
                </button>
              </div>
              <p className="text-sm text-gray-500">Your account is ready — just set your name and a password to get started.</p>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Name</label>
                <input
                  required
                  ref={nameRef}
                  type="text"
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={setup.name}
                  onChange={(e) => setSetup({ ...setup, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Password</label>
                <input
                  required
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={setup.password}
                  onChange={(e) => setSetup({ ...setup, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Confirm Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={setup.confirm}
                  onChange={(e) => setSetup({ ...setup, confirm: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Activate Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
