import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { LoginPage } from './features/users/components/LoginPage';
import { RegisterPage } from './features/users/components/RegisterPage';
import { Layout } from './components/Layout';
import { FocusDashboard } from './features/dashboard/components/FocusDashboard';
import { TeamDashboard } from './features/dashboard/components/TeamDashboard';
import { TaskBoard } from './features/tasks/components/TaskBoard';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'focus' | 'team'>('focus');
  const [isRegistering, setIsRegistering] = useState(false);
  const canViewTeam = !!user && user.role !== 'CONTRIBUTOR';

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setActiveTab('focus');
      return;
    }
    setActiveTab('focus');
  }, [isAuthenticated, user, canViewTeam]);

  if (!isAuthenticated || !user) {
    return isRegistering ? (
      <RegisterPage onBackToLogin={() => setIsRegistering(false)} />
    ) : (
      <LoginPage onGoToRegister={() => setIsRegistering(true)} />
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('focus')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'focus' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Workspace
          </button>
          {canViewTeam && (
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Health
            </button>
          )}
        </div>
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
    </Layout>
  );
}

export default App;
