import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-black tracking-tight text-gray-900">
                PMS 0.1
              </span>
            </div>

            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                      {user.team || 'No Team'} • WIP: {user.wipLimit}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Logout"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow bg-gray-50/30">
        {children}
      </main>

      <footer className="bg-white py-6 border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-medium">
            &copy; 2026 PMS 0.1 • Internal Tooling
          </p>
        </div>
      </footer>
    </div>
  );
};
