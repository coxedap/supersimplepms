import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './features/users/components/LoginPage';
import { RegisterPage } from './features/users/components/RegisterPage';
import { UserManagementPage } from './features/users/components/UserManagementPage';
import { UserEditPage } from './features/users/components/UserEditPage';
import { TeamsPage } from './features/teams/components/TeamsPage';
import { ProjectsPage } from './features/projects/components/ProjectsPage';
import { Layout } from './components/Layout';
import { FocusDashboard } from './features/dashboard/components/FocusDashboard';
import { TeamDashboard } from './features/dashboard/components/TeamDashboard';
import { TaskBoard } from './features/tasks/components/TaskBoard';
import { ToastContainer } from './components/ToastContainer';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'focus' | 'team'>('focus');
  const canViewTeam = !!user && user.role !== 'CONTRIBUTOR';

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setActiveTab('focus');
      return;
    }
    setActiveTab('focus');
  }, [isAuthenticated, user, canViewTeam]);

  if (!isAuthenticated || !user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onGoToRegister={() => {}} />} />
        <Route path="/register" element={<RegisterPage onBackToLogin={() => {}} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Layout>
        <Routes>
          {/* PMS Section */}
          <Route
            path="/"
            element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setActiveTab('focus')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'focus'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    My Workspace
                  </button>
                  {canViewTeam && (
                    <button
                      onClick={() => setActiveTab('team')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        activeTab === 'team'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Team Health
                    </button>
                  )}
                </div>

                <div className="space-y-12 pb-24">
                  {activeTab === 'focus' ? (
                    <>
                      <section>
                        <FocusDashboard userId={user.id} />
                      </section>

                      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                          <header className="mb-8">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Personal Workspace</h2>
                            <p className="text-sm text-gray-400 font-medium">Manage your execution flow and WIP limits.</p>
                          </header>
                          <TaskBoard userId={user.id} />
                        </div>
                      </section>
                    </>
                  ) : (
                    <TeamDashboard />
                  )}
                </div>
              </div>
            }
          />

          {/* Team Health Route */}
          {canViewTeam && (
            <Route path="/team-health" element={<TeamDashboard />} />
          )}

          {/* Users Section */}
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/users/:userId" element={<UserEditPage />} />

          {/* Teams Section */}
          <Route path="/teams" element={<TeamsPage />} />

          {/* Projects Section */}
          <Route path="/projects" element={<ProjectsPage />} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  );
}

export default App;
