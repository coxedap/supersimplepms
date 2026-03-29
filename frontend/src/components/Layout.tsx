import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const canAccessUserManagement = user && (user.role === 'MANAGER' || user.role === 'ADMIN');

  // Determine current section based on URL path
  const currentSection = location.pathname.startsWith('/users') ? 'users' : 'pms';

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-4">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all lg:hidden flex-shrink-0"
                title="Menu"
              >
                ☰
              </button>
              <span className="text-lg font-black tracking-tight text-gray-900 whitespace-nowrap">
                PMS 0.1
              </span>
            </div>

            <div className="flex items-center gap-4 whitespace-nowrap">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right flex flex-col items-end gap-0">
                    <span className="text-sm font-bold text-gray-900 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                      {user.team || 'No Team'} • WIP: {user.wipLimit}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
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

      <div className="flex flex-1">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden mt-16" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
        
        {/* Sidebar */}
        <div
          className={`fixed lg:sticky left-0 top-16 lg:top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-100 shadow-lg lg:shadow-none transform transition-transform duration-300 z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-2 overflow-y-auto h-full">
            <button
              onClick={() => handleNavigate('/')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                currentSection === 'pms'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏠 Home
            </button>
            {canAccessUserManagement && (
              <button
                onClick={() => handleNavigate('/users')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  currentSection === 'users'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                👥 Users Management
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow bg-gray-50/30 w-full overflow-x-hidden">
          {children}
        </main>
      </div>

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
