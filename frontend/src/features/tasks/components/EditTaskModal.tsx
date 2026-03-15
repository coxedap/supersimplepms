import React, { useState, useEffect } from 'react';
import { useUpdateTask } from '../hooks/useTasks';
import { Priority, Task } from '../types';
import { useAuthStore } from '../../../store/useAuthStore';
import { Modal } from '../../../components/Modal';
import { api } from '../../../lib/api';

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose }) => {
  const { user: currentUser } = useAuthStore();
  const { mutate: updateTask, isPending, error } = useUpdateTask();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    ownerId: task.ownerId,
    projectId: task.projectId || '',
    priority: task.priority,
    deadline: task.deadline.slice(0, 16), // Format for datetime-local
    estimatedEffort: task.estimatedEffort,
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.get<User[]>('/users'),
        api.get<Project[]>('/projects')
      ]).then(([usersRes, projectsRes]) => {
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
      });
      // Reset form if task changes or modal reopens
      setFormData({
        title: task.title,
        description: task.description || '',
        ownerId: task.ownerId,
        projectId: task.projectId || '',
        priority: task.priority,
        deadline: task.deadline.slice(0, 16),
        estimatedEffort: task.estimatedEffort,
      });
    }
  }, [isOpen, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to modal handlers
    if (!currentUser) return;

    updateTask(
      {
        id: task.id,
        data: {
          ...formData,
          requesterId: currentUser.id,
          projectId: formData.projectId || undefined,
          estimatedEffort: Number(formData.estimatedEffort)
        }
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const footer = (
    <>
      <button
        form="edit-task-form"
        type="submit"
        disabled={isPending}
        onClick={(e) => e.stopPropagation()}
        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
      >
        {isPending ? 'Saving...' : 'Save Changes'}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-all active:scale-95"
      >
        Close
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task Details"
      footer={footer}
      maxWidthClassName="max-w-xl"
    >
      <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-sm text-red-700 font-medium">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {(error as any)?.response?.data?.error || "Failed to update task."}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Title</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assign To</label>
            <select
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Project</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">No Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
          <textarea
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] font-medium"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
            >
              <option value="P1" className="text-red-600 font-bold">P1 (Urgent)</option>
              <option value="P2" className="text-blue-600 font-bold">P2 (Normal)</option>
              <option value="P3" className="text-slate-600 font-bold">P3 (Low)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Effort (hrs)</label>
            <input
              required
              type="number"
              min="0.5"
              step="0.5"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={formData.estimatedEffort}
              onChange={(e) => setFormData({ ...formData, estimatedEffort: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deadline</label>
          <input
            required
            type="datetime-local"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
