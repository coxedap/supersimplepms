import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { useUpdateTaskStatus, useDeleteTask } from '../hooks/useTasks';
import { useAuthStore } from '../../../store/useAuthStore';
import { EditTaskModal } from './EditTaskModal';
import { Modal } from '../../../components/Modal';
import { TaskCard } from './TaskCard';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTaskStatus();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleStatusChange = (newStatus: TaskStatus) => {
    let reason: string | undefined;
    if (newStatus === 'BLOCKED') {
      const promptValue = window.prompt("Reason for blocking this task?");
      if (!promptValue) return;
      reason = promptValue;
    }
    updateStatus({ id: task.id, status: newStatus, reason });
  };

  const handleDelete = () => {
    if (!user) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask({ id: task.id, requesterId: user.id });
    }
  };

  const getAvailableTransitions = (status: TaskStatus): TaskStatus[] => {
    switch (status) {
      case 'TODO': return ['DOING'];
      case 'DOING': return ['DONE', 'BLOCKED'];
      case 'BLOCKED': return ['DOING'];
      default: return [];
    }
  };

  const transitions = getAvailableTransitions(task.status);

  const headerActions = (user?.role === 'ADMIN' || user?.role === 'MANAGER') ? (
    <div className="hidden group-hover:flex space-x-1 pr-2 border-r border-gray-100">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEditModalOpen(true);
        }}
        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
        title="Edit"
      >
        ✎
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        disabled={isDeleting}
        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
        title="Delete"
      >
        🗑
      </button>
    </div>
  ) : null;

  const footerActions = (
    <div className="flex space-x-2">
      {transitions.map(status => (
        <button
          key={status}
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(status);
          }}
          disabled={isUpdatingStatus}
          className="px-3 py-1 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 rounded transition-colors disabled:opacity-50"
        >
          Move to {status.toLowerCase()}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <TaskCard
        task={task}
        onClick={() => setIsDetailsOpen(true)}
        headerActions={headerActions}
        footerActions={footerActions}
      />

      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <EditTaskModal
          task={task}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      <Modal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        title="Task Details"
        maxWidthClassName="max-w-2xl"
        footer={
          <button
            onClick={() => setIsDetailsOpen(false)}
            className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all active:scale-95"
          >
            Close
          </button>
        }
      >
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Title</label>
            <h4 className="text-xl font-black text-slate-900 leading-tight">{task.title}</h4>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</label>
            <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</label>
              <div className="flex items-center">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                  task.status === 'DONE' ? 'bg-green-500' :
                  task.status === 'DOING' ? 'bg-blue-500' :
                  task.status === 'BLOCKED' ? 'bg-amber-500' :
                  task.status === 'OVERDUE' ? 'bg-red-500' : 'bg-slate-300'
                }`} />
                <span className="font-bold text-slate-700">{task.status}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</label>
              <div className={`font-black ${
                task.priority === 'P1' ? 'text-red-600' :
                task.priority === 'P2' ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {task.priority}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Effort</label>
              <div className="font-bold text-slate-700">{task.estimatedEffort}h</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deadline</label>
              <div className="font-bold text-slate-700 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(task.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</label>
              <div className="text-sm font-medium text-slate-500">
                {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </div>

            {task.completedAt && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed</label>
                <div className="text-sm font-bold text-green-600">
                  {new Date(task.completedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {task.blockerReason && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Blocker Reason</label>
              <p className="text-amber-900 font-bold">{task.blockerReason}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
