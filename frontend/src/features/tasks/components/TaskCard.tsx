import React from 'react';
import { Task } from '../types';

export interface TaskCardProps {
  task: Task;
  ownerName?: string;
  projectName?: string;
  risk?: { level: string; reason?: string };
  onClick?: () => void;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
}

const STATUS_ACCENT: Record<string, string> = {
  TODO:    'border-l-gray-300',
  DOING:   'border-l-blue-400',
  DONE:    'border-l-green-400',
  BLOCKED: 'border-l-amber-400',
  OVERDUE: 'border-l-red-500',
};

const PRIORITY_STYLE: Record<string, string> = {
  P1: 'bg-red-100 text-red-700',
  P2: 'bg-blue-100 text-blue-700',
  P3: 'bg-gray-100 text-gray-500',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  ownerName,
  projectName,
  risk,
  onClick,
  headerActions,
  footerActions,
}) => {
  const getDeadlineRisk = () => {
    if (task.status === 'DONE') return null;
    const diffHours = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    if (task.status === 'OVERDUE' || diffHours < 0) return { label: 'OVERDUE', color: 'text-red-500' };
    if (diffHours < 24) return { label: 'AT RISK', color: 'text-red-500' };
    if (diffHours < 48) return { label: 'WATCH', color: 'text-amber-500' };
    return null;
  };

  const deadlineRisk = risk
    ? { label: risk.level.replace('_', ' '), color: risk.level === 'CRITICAL' || risk.level === 'AT_RISK' ? 'text-red-500' : 'text-amber-500' }
    : getDeadlineRisk();

  return (
    <div
      className={`flex flex-col bg-white border border-gray-100 border-l-4 ${STATUS_ACCENT[task.status] ?? 'border-l-gray-200'} rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      {/* Main content */}
      <div className="p-3 space-y-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-gray-900 leading-snug flex-1 min-w-0">{task.title}</h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            {headerActions}
            {task.priority !== 'P3' && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${PRIORITY_STYLE[task.priority]}`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>

        {/* Description — only in personal board (no ownerName) */}
        {task.description && !ownerName && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{task.description}</p>
        )}

        {/* Owner / project — team board */}
        {(ownerName || projectName) && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {ownerName && (
              <span className="text-[11px] text-gray-500 font-medium">{ownerName}</span>
            )}
            {projectName && (
              <span className="text-[11px] text-gray-400 truncate max-w-full">{projectName}</span>
            )}
          </div>
        )}

        {/* Blocker reason */}
        {task.status === 'BLOCKED' && task.blockerReason && (
          <div className="px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-[11px] text-amber-800 line-clamp-2">
              <span className="font-black">Blocked: </span>{task.blockerReason}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] text-gray-400 whitespace-nowrap">
            {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
          {deadlineRisk && (
            <span className={`text-[10px] font-black uppercase ${deadlineRisk.color}`}>
              {deadlineRisk.label}
            </span>
          )}
        </div>
        {footerActions && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};
