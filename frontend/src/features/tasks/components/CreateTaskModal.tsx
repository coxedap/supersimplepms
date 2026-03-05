import React, { useState, useEffect } from 'react';
import { useCreateTask } from '../hooks/useTasks';
import { Priority } from '../types';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { Modal } from '../../../components/Modal';

interface CreateTaskModalProps {
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

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuthStore();
  const { mutate: createTask, isPending, error } = useCreateTask();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ownerId: '',
    projectId: '',
    priority: 'P2' as Priority,
    deadline: '',
    estimatedEffort: 1,
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
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to modal handlers
    if (!currentUser) return;

    createTask(
      { 
        ...formData, 
        creatorId: currentUser.id,
        projectId: formData.projectId || undefined,
        estimatedEffort: Number(formData.estimatedEffort) 
      },
      {
        onSuccess: () => {
          // Success but don't close automatically
          setFormData({
            title: '',
            description: '',
            ownerId: '',
            projectId: '',
            priority: 'P2',
            deadline: '',
            estimatedEffort: 1,
          });
        },
      }
    );
  };

  const footer = (
    <>
      <button
        form="create-task-form"
        type="submit"
        disabled={isPending}
        onClick={(e) => e.stopPropagation()}
        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-200 transition-all disabled:opacity-50 active:scale-95"
      >
        {isPending ? 'Creating...' : 'Create Task'}
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
      title="Create New Task"
      footer={footer}
      maxWidthClassName="max-w-xl"
    >
      <form id="create-task-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-sm text-red-700 font-medium">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {(error as any)?.response?.data?.error || "Failed to create task. Check WIP limits."}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Title</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 font-medium"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Assign To</label>
            <select
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none"
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
            >
              <option value="">Select Member</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Project (Optional)</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none"
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
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] font-medium placeholder:text-slate-300"
            placeholder="Provide more context..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
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
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
