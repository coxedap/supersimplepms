import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';

interface User {
  id: string;
  name: string;
  role: string;
  team: string;
  wipLimit: number;
}

interface LoginPageProps {
  onGoToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoToRegister }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get<User[]>('/users');
        setUsers(data);
      } catch (err: any) {
        setError('Failed to fetch user list. Check backend connectivity.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = async (userId: string) => {
    try {
      const { data } = await api.post<User>('/auth/login', { userId });
      login(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200">
          <span className="text-white text-2xl font-black">EX</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          PMS 0.1
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Login to your internal workstation.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Select Your Profile
              </label>
              <div className="grid gap-3">
                {users.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    No users found in database. <br/> Run seeds first.
                  </p>
                ) : (
                  users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleLogin(user.id)}
                      className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all text-left"
                    >
                      <div>
                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.team} • {user.role}</div>
                      </div>
                      <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                        →
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              onClick={onGoToRegister}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              + Create New Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
