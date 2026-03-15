import React from 'react';
import { useTasks } from '../../tasks/hooks/useTasks';
import { TaskItem } from '../../tasks/components/TaskItem';
import { WeeklyMetricsCard } from '../../metrics/components/WeeklyMetricsCard';
import { Activity, AlertTriangle, Ban, LayoutGrid } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  count: number;
  tasks: any[];
  statusColor: string;
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, count, tasks, statusColor, icon }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${statusColor} bg-opacity-10`}>
          {icon}
        </div>
        <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${statusColor}`}>
        {count}
      </span>
    </div>
    <div className="space-y-4 flex-1">
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 opacity-30">
          <LayoutGrid className="w-12 h-12 mb-2" />
          <p className="text-sm font-bold uppercase tracking-widest italic text-center">Empty</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  </div>
);


export const FocusDashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: tasks, isLoading, error } = useTasks(userId);

  if (isLoading) return <div className="flex justify-center p-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="text-red-500 p-12 text-center font-bold">Error loading dashboard</div>;

  const todayTasks = tasks?.filter(t => t.status === 'DOING' || t.status === 'TODO') || [];
  const overdueTasks = tasks?.filter(t => t.status === 'OVERDUE') || [];
  const blockedTasks = tasks?.filter(t => t.status === 'BLOCKED') || [];
  const wipCount = tasks?.filter(t => t.status === 'DOING').length || 0;
  const wipLimit = 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Execution Console</h1>
          <p className="mt-2 text-lg text-gray-400 font-medium tracking-tight">
            Real-time throughput and focus monitoring.
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 min-w-[280px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System WIP Pressure</span>
            <span className={`text-xs font-black ${wipCount >= wipLimit ? 'text-rose-600' : 'text-blue-600'}`}>
              {Math.round((wipCount / wipLimit) * 100)}%
            </span>
          </div>
          <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-gray-900 tracking-tighter">{wipCount}</span>
              <span className="text-sm font-black text-gray-300 mb-2">/ {wipLimit} LIMIT</span>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${wipCount >= wipLimit ? 'bg-rose-500' : 'bg-blue-600'}`} 
              style={{ width: `${Math.min((wipCount / wipLimit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <WeeklyMetricsCard userId={userId} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DashboardCard 
          title="Active Focus" 
          count={todayTasks.length} 
          tasks={todayTasks} 
          statusColor="text-blue-600"
          icon={<Activity className="w-5 h-5" />}
        />
        <DashboardCard 
          title="Deadline Risks" 
          count={overdueTasks.length} 
          tasks={overdueTasks} 
          statusColor="text-rose-600"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        />
        <DashboardCard 
          title="Execution Blocked" 
          count={blockedTasks.length} 
          tasks={blockedTasks} 
          statusColor="text-amber-600"
          icon={<Ban className="w-5 h-5 text-amber-600" />}
        />
      </div>
    </div>
  );
};
