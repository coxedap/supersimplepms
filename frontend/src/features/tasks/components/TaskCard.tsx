import React from 'react';
import { Task, TaskStatus } from '../types';

export interface TaskCardProps {
  task: Task;
  ownerName?: string;
  projectName?: string;
  risk?: { level: string; reason?: string };
  onClick?: () => void;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  ownerName,
  projectName,
  risk,
  onClick,
  headerActions,
  footerActions,
}) => {
  const getDeadlineRiskStatus = () => {
    if (task.status === 'DONE') return null;

    const now = new Date();
    const deadline = new Date(task.deadline);
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (task.status === 'OVERDUE' || diffHours < 0) {
      return { label: 'CRITICAL', className: 'bg-red-100 text-red-700' };
    }
    if (diffHours < 24) return { label: 'AT RISK', className: 'bg-red-100 text-red-700' };
    if (diffHours < 48) return { label: 'WATCH', className: 'bg-amber-100 text-amber-700' };
    return null;
  };

  const deadlineRisk = risk || getDeadlineRiskStatus();

  return (
    <div
      className="flex flex-col p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 transition-all group cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
      <div className="flex justify-between items-start mb-2 mt-1">
        <h4 className="text-sm font-bold text-gray-900 leading-snug">{task.title}</h4>
        <div className="flex items-center gap-1.5">
          {headerActions}
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            task.priority === 'P1' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {task.priority}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
            task.status === 'DONE' ? 'bg-green-100 text-green-700' :
            task.status === 'BLOCKED' ? 'bg-amber-100 text-amber-700' :
            task.status === 'DOING' ? 'bg-indigo-100 text-indigo-700' :
            task.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {task.status === 'TODO' ? 'TO DO' : task.status}
          </span>
        </div>
      </div>

      {(ownerName || projectName) && (
        <div className="space-y-1 mb-3">
          {ownerName && (
            <p className="text-[11px] text-gray-500 flex items-center">
              <span className="font-bold text-gray-700 mr-1">Owner:</span> {ownerName}
            </p>
          )}
          {projectName && (
            <p className="text-[11px] text-gray-500 flex items-center">
              <span className="font-bold text-gray-700 mr-1">Project:</span> {projectName}
            </p>
          )}
        </div>
      )}

      {task.description && !ownerName && !projectName && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
      )}

      {deadlineRisk && (
        <div className="mb-3">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${deadlineRisk.className || (deadlineRisk.level === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}`}>
            {deadlineRisk.label || (deadlineRisk.level === 'HIGH' ? 'HIGH RISK' : 'WATCH')}
          </span>
        </div>
      )}

      {task.status === 'BLOCKED' && task.blockerReason && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <strong>Blocker:</strong> {task.blockerReason}
        </div>
      )}

      <div className="mt-auto flex justify-between items-center border-t pt-3">
        <span className="text-xs text-gray-500">
          Due: {new Date(task.deadline).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          {footerActions}
          {deadlineRisk && (deadlineRisk.level === 'HIGH' || deadlineRisk.label === 'HIGH RISK' || deadlineRisk.label === 'CRITICAL' || deadlineRisk.label === 'AT RISK') && (
            <span className="text-[9px] font-black text-red-500">HIGH RISK</span>
          )}
        </div>
      </div>
    </div>
  );
};
