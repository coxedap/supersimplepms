import React from 'react';
import { useTasks } from '../../tasks/hooks/useTasks';
import { TaskCard } from '../../tasks/components/TaskCard';

interface DashboardCardProps {
  title: string;
  count: number;
  tasks: any[];
  statusColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, count, tasks, statusColor }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${statusColor}`}>
        {count}
      </span>
    </div>
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No tasks in this category.</p>
      ) : (
        tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            // Note: Focus dashboard tasks don't currently have ownerName/projectName in the simple list
            // but we can add them if needed. For now, we'll just show the visual card.
          />
        ))
      )}
    </div>
  </div>
);

export const FocusDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: tasks, isLoading, error } = useTasks(userId);

  if (isLoading) return <div className="flex justify-center p-12">Loading...</div>;
  if (error) return <div className="text-red-500 p-12 text-center">Error loading dashboard</div>;

  const todayTasks = tasks?.filter(t => t.status === 'DOING' || t.status === 'TODO') || [];
  const overdueTasks = tasks?.filter(t => t.status === 'OVERDUE') || [];
  const blockedTasks = tasks?.filter(t => t.status === 'BLOCKED') || [];
  const wipCount = tasks?.filter(t => t.status === 'DOING').length || 0;
  const wipLimit = 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Focus Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your current execution status.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Current WIP</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">
            {wipCount} <span className="text-lg font-normal text-blue-400">/ {wipLimit}</span>
          </p>
          <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${wipCount >= wipLimit ? 'bg-red-500' : 'bg-blue-600'}`} 
              style={{ width: `${Math.min((wipCount / wipLimit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <DashboardCard 
          title="Today's Focus" 
          count={todayTasks.length} 
          tasks={todayTasks} 
          statusColor="bg-blue-100 text-blue-800"
        />
        <DashboardCard 
          title="Overdue" 
          count={overdueTasks.length} 
          tasks={overdueTasks} 
          statusColor="bg-red-100 text-red-800"
        />
        <DashboardCard 
          title="Blocked" 
          count={blockedTasks.length} 
          tasks={blockedTasks} 
          statusColor="bg-amber-100 text-amber-800"
        />
      </div>
    </div>
  );
};
