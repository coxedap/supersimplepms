import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { useUpdateTaskStatus, useDeleteTask } from '../hooks/useTasks';
import { useAuthStore } from '../../../store/useAuthStore';
import { EditTaskModal } from './EditTaskModal';
import { Modal } from '../../../components/Modal';
import { BlockReasonModal } from '../../../components/BlockReasonModal';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { TaskCard } from './TaskCard';

import { CheckCircle2, Play, Ban } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  ownerName?: string;
  projectName?: string;
  risk?: { level: string; reason?: string };
  onClick?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  ownerName,
  projectName,
  risk,
  onClick
}) => {
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTaskStatus();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === 'BLOCKED') {
      setIsBlockModalOpen(true);
      return;
    }
    updateStatus({ id: task.id, status: newStatus });
  };

  const handleBlockConfirm = (reason: string) => {
    updateStatus({ id: task.id, status: 'BLOCKED', reason });
    setIsBlockModalOpen(false);
  };

  const handleDelete = () => {
    if (!user) return;
    deleteTask({ id: task.id, requesterId: user.id });
    setIsDeleteModalOpen(false);
    setIsDetailsOpen(false);
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

  const footerActions = (
    <div className="flex items-center gap-1.5">
      {transitions.map(status => {
        let icon;
        let colorClass = "";
        let label = "";

        if (status === 'DONE') {
          icon = <CheckCircle2 className="w-3.5 h-3.5" />;
          colorClass = "text-emerald-600 hover:bg-emerald-50 border-emerald-100 hover:border-emerald-200";
          label = "Done";
        } else if (status === 'DOING') {
          icon = <Play className="w-3.5 h-3.5" />;
          colorClass = "text-blue-600 hover:bg-blue-50 border-blue-100 hover:border-blue-200";
          label = "Start";
        } else if (status === 'BLOCKED') {
          icon = <Ban className="w-3.5 h-3.5" />;
          colorClass = "text-amber-600 hover:bg-amber-50 border-amber-100 hover:border-amber-200";
          label = "Block";
        }

        return (
          <button
            key={status}
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(status);
            }}
            disabled={isUpdatingStatus}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-wide bg-white border rounded-lg transition-all active:scale-95 disabled:opacity-50 ${colorClass}`}
          >
            {icon}
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <TaskCard
        task={task}
        ownerName={ownerName}
        projectName={projectName}
        risk={risk}
        onClick={onClick ? onClick : () => setIsDetailsOpen(true)}
        footerActions={footerActions}
      />

      <BlockReasonModal
        isOpen={isBlockModalOpen}
        onConfirm={handleBlockConfirm}
        onCancel={() => setIsBlockModalOpen(false)}
      />

      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Task Details"
        maxWidthClassName="max-w-2xl"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all active:scale-95"
            >
              Close
            </button>
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Edit Task
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                  className="px-8 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-black transition-all active:scale-95 disabled:opacity-50"
                >
                  Delete Task
                </button>
              </>
            )}
          </div>
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

      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <EditTaskModal
          task={task}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        danger
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};
