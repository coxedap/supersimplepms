import React from 'react';
import { useWeeklyMetrics } from '../hooks/useMetrics';
import { Target, Clock, Zap, AlertCircle } from 'lucide-react';

interface WeeklyMetricsCardProps {
  userId: string;
}

export const WeeklyMetricsCard: React.FC<WeeklyMetricsCardProps> = ({ userId }) => {
  // Use current Monday as week start
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const { data: metrics, isLoading, isError } = useWeeklyMetrics(userId, monday);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
        <div className="h-4 w-32 bg-gray-100 rounded mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-50 rounded-xl"></div>
          <div className="h-20 bg-gray-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !metrics) {
    return null;
  }

  const statCards = [
    {
      label: 'On-Time Rate',
      value: `${Math.round(metrics.onTimeRate)}%`,
      icon: <Target className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50',
      description: 'Completion vs Deadline'
    },
    {
      label: 'Avg Cycle Time',
      value: `${metrics.avgCycleTime.toFixed(1)}h`,
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50',
      description: 'Start to Done average'
    },
    {
      label: 'Throughput',
      value: `${metrics.tasksCompleted}`,
      icon: <Zap className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50',
      description: 'Tasks finished this week'
    },
    {
      label: 'Blocker Ratio',
      value: `${Math.round(metrics.blockedTimeRatio * 100)}%`,
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
      color: 'bg-rose-50',
      description: 'Time spent in BLOCKED state'
    }
  ];

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Weekly Performance</h3>
          <p className="text-sm text-gray-400 font-medium">Metrics for the week of {monday.toLocaleDateString()}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-blue-100 hover:bg-white hover:shadow-md transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-2.5 rounded-xl ${stat.color} transition-colors group-hover:scale-110 duration-200`}>
                {stat.icon}
              </div>
              <span className="text-sm font-bold text-gray-500">{stat.label}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</span>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-1">{stat.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
