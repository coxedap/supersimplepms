import React, { useState } from 'react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';

interface LoginPageProps {
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [setupData, setSetupData] = useState({ name: '', password: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [setupEmail, setSetupEmail] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      login(data);
      useToastStore.getState().addToast(`Welcome back, ${data.name}!`, 'success');
    } catch (err: any) {
      if (err.response?.data?.code === 'REQUIRES_SETUP') {
        setSetupEmail(formData.email);
        setRequiresSetup(true);
      } else {
        setError(err.response?.data?.error || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (setupData.password !== setupData.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (setupData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/setup', {
        email: setupEmail,
        name: setupData.name,
        password: setupData.password,
      });
      login(data);
      useToastStore.getState().addToast(`Welcome, ${data.name}!`, 'success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set up account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
          <span className="text-white text-2xl font-black">EX</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">PMS 0.1</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {requiresSetup ? 'Set up your account to get started.' : 'Sign in to your workspace.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {requiresSetup ? (
            <form onSubmit={handleSetup} className="space-y-5">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                Setting up account for <strong>{setupEmail}</strong>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Name</label>
                <input
                  required
                  type="text"
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={setupData.name}
                  onChange={(e) => setSetupData({ ...setupData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Password</label>
                <input
                  required
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={setupData.password}
                  onChange={(e) => setSetupData({ ...setupData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Confirm Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={setupData.confirm}
                  onChange={(e) => setSetupData({ ...setupData, confirm: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Activate Account'}
              </button>
              <button
                type="button"
                onClick={() => { setRequiresSetup(false); setError(''); }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Back to login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email</label>
                <input
                  required
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          {!requiresSetup && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <button
                onClick={onGoToRegister}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                + Create a new organization
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
