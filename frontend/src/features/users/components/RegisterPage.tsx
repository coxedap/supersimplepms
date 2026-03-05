import React, { useState } from 'react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    role: 'USER',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', formData);
      login(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join PMS 0.1
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your internal profile to start executing.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Full Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Team Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Engineering, Sales"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Role
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="USER">Standard User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Creating Profile...' : 'Create My Profile'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <button
              onClick={onBackToLogin}
              className="w-full text-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              Already have a profile? Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
