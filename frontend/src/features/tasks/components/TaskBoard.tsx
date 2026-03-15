import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskItem } from './TaskItem';
import { TaskStatus } from '../types';
import { CreateTaskModal } from './CreateTaskModal';
import { useAuthStore } from '../../../store/useAuthStore';

export const TaskBoard: React.FC<{ userId: string }> = ({ userId }) => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tasks, isLoading, error } = useTasks(userId);

  if (isLoading) return <div className="flex justify-center p-12">Loading...</div>;
  if (error) return <div className="text-red-500 p-12 text-center">Error loading tasks</div>;

  const columns: { title: string; status: TaskStatus[] }[] = [
    { title: 'Todo', status: ['TODO'] },
    { title: 'In Progress', status: ['DOING'] },
    { title: 'Blocked & Overdue', status: ['BLOCKED', 'OVERDUE'] },
    { title: 'Done', status: ['DONE'] },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-800">Task Board</h2>
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center"
          >
            <span className="mr-2">+</span> New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 min-h-screen bg-gray-50 p-2 rounded-xl border border-gray-200">
      {columns.map((column) => (
        <div key={column.title} className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{column.title}</h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {tasks?.filter((t) => column.status.includes(t.status)).length || 0}
            </span>
          </div>
          <div className="flex-1 space-y-4 bg-gray-100/50 p-3 rounded-lg border border-dashed border-gray-300 overflow-y-auto">
            {tasks
              ?.filter((t) => column.status.includes(t.status))
              .map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            {tasks?.filter((t) => column.status.includes(t.status)).length === 0 && (
              <p className="text-xs text-center text-gray-400 mt-10 italic">No tasks here</p>
            )}
          </div>
        </div>
      ))}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
