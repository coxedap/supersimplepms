import React, { useState } from 'react';
import { useTasks, useUpdateTaskStatus } from '../hooks/useTasks';
import { TaskItem } from './TaskItem';
import { TaskStatus } from '../types';
import { CreateTaskModal } from './CreateTaskModal';
import { BlockReasonModal } from '../../../components/BlockReasonModal';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProjects } from '../../projects/hooks/useProjects';

const COLUMNS: { title: string; status: TaskStatus[]; dropTarget: TaskStatus }[] = [
  { title: 'Todo',              status: ['TODO'],              dropTarget: 'TODO'    },
  { title: 'In Progress',       status: ['DOING'],             dropTarget: 'DOING'   },
  { title: 'Blocked & Overdue', status: ['BLOCKED', 'OVERDUE'], dropTarget: 'BLOCKED' },
  { title: 'Done',              status: ['DONE'],              dropTarget: 'DONE'    },
];

export const TaskBoard: React.FC<{ userId: string }> = ({ userId }) => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tasks, isLoading, error } = useTasks(userId);
  const { data: projects } = useProjects();
  const { mutate: updateStatus } = useUpdateTaskStatus();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [pendingBlockTaskId, setPendingBlockTaskId] = useState<string | null>(null);

  const getProjectName = (projectId?: string) =>
    projectId ? (projects?.find((p) => p.id === projectId)?.name ?? undefined) : undefined;

  const visibleTasks = selectedProjectId
    ? tasks?.filter((t) => t.projectId === selectedProjectId)
    : tasks;

  if (isLoading) return <div className="flex justify-center p-12">Loading...</div>;
  if (error) return <div className="text-red-500 p-12 text-center">Error loading tasks</div>;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, dropTarget: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverColumn(dropTarget);
  };

  const handleDrop = (e: React.DragEvent, dropTarget: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = visibleTasks?.find((t) => t.id === taskId);
    if (!task || task.status === dropTarget) {
      setDraggingId(null);
      setOverColumn(null);
      return;
    }

    if (dropTarget === 'BLOCKED') {
      setPendingBlockTaskId(taskId);
    } else {
      updateStatus({ id: taskId, status: dropTarget });
    }

    setDraggingId(null);
    setOverColumn(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOverColumn(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center mb-2 gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800">Task Board</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {projects && projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center"
            >
              <span className="mr-2">+</span> New Task
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 min-h-screen bg-gray-50 p-2 rounded-xl border border-gray-200">
        {COLUMNS.map((column) => {
          const columnTasks = visibleTasks?.filter((t) => column.status.includes(t.status)) ?? [];
          const isOver = overColumn === column.dropTarget;

          return (
            <div key={column.title} className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{column.title}</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div
                onDragOver={(e) => handleDragOver(e, column.dropTarget)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.dropTarget)}
                className={`flex-1 space-y-4 p-3 rounded-lg border border-dashed overflow-y-auto transition-colors ${
                  isOver
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-gray-100/50 border-gray-300'
                }`}
              >
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`transition-opacity ${draggingId === task.id ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <TaskItem
                      task={task}
                      projectName={getProjectName(task.projectId)}
                    />
                  </div>
                ))}
                {columnTasks.length === 0 && !isOver && (
                  <p className="text-xs text-center text-gray-400 mt-10 italic">No tasks here</p>
                )}
                {columnTasks.length === 0 && isOver && (
                  <p className="text-xs text-center text-blue-400 mt-10 italic font-bold">Drop here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <BlockReasonModal
        isOpen={!!pendingBlockTaskId}
        onConfirm={(reason) => {
          if (pendingBlockTaskId) updateStatus({ id: pendingBlockTaskId, status: 'BLOCKED', reason });
          setPendingBlockTaskId(null);
        }}
        onCancel={() => setPendingBlockTaskId(null)}
      />
    </div>
  );
};
