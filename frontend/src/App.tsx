import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './features/users/components/LoginPage';
import { RegisterPage } from './features/users/components/RegisterPage';
import { AcceptInvitePage } from './features/users/components/AcceptInvitePage';
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
  const navigate = useNavigate();
  const canViewTeamHealth = !!user && (user.role === 'ADMIN' || user.role === 'MANAGER');
  const homeRedirect = canViewTeamHealth ? '/team-health' : '/workspace';

  return (
    <>
      <Routes>
        {/* Always accessible */}
        <Route path="/invite/accept" element={<AcceptInvitePage />} />

        {/* Unauthenticated only */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={homeRedirect} replace />
              : <LoginPage onGoToRegister={() => navigate('/register')} />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated
              ? <Navigate to={homeRedirect} replace />
              : <RegisterPage onBackToLogin={() => navigate('/login')} />
          }
        />

        {/* Authenticated routes */}
        <Route
          path="/*"
          element={
            !isAuthenticated || !user
              ? <Navigate to="/login" replace />
              : (
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to={homeRedirect} replace />} />

                    <Route
                      path="/workspace"
                      element={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-12">
                          <section>
                            <FocusDashboard userId={user.id} />
                          </section>
                          <section>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                              <header className="mb-8">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Personal Workspace</h2>
                                <p className="text-sm text-gray-400 font-medium">Manage your execution flow and WIP limits.</p>
                              </header>
                              <TaskBoard userId={user.id} />
                            </div>
                          </section>
                        </div>
                      }
                    />

                    {canViewTeamHealth && (
                      <Route path="/team-health" element={<TeamDashboard />} />
                    )}

                    <Route path="/users" element={<UserManagementPage />} />
                    <Route path="/users/:userId" element={<UserEditPage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="*" element={<Navigate to={homeRedirect} replace />} />
                  </Routes>
                </Layout>
              )
          }
        />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
