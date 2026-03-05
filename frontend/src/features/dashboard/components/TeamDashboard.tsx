import React, { useState } from 'react';
import { useTeamDashboard, TeamTask } from '../hooks/useTeamDashboard';
import { useAuthStore } from '../../../store/useAuthStore';
import { EditTaskModal } from '../../tasks/components/EditTaskModal';
import { Modal } from '../../../components/Modal';
import { TaskCard } from '../../tasks/components/TaskCard';

export const TeamDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useTeamDashboard();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const canEdit = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const selectedTask = data?.allTeamTasks.find(t => t.id === selectedTaskId) || null;

  if (isLoading) return <div className="flex justify-center p-12">Loading team data...</div>;
  if (error) return <div className="text-red-500 p-12 text-center">Error loading team dashboard</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-black text-gray-900">Team Health Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium italic">High-throughput execution tracking.</p>
      </header>

      {/* Task Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data && Object.entries(data.tasksPerStatus).map(([status, count]) => (
          <div key={status} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{status}</p>
            <p className="text-2xl font-black text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overloaded Users */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Overloaded Users (WIP ≥ Limit)
          </h3>
          <div className="space-y-4">
            {data?.overloadedUsers.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No overloaded users. Throughput is healthy.</p>
            ) : (
              data?.overloadedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-red-600 font-medium">Currently at WIP Limit</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-red-700">{user.wipCount}</span>
                    <span className="text-xs text-red-400 font-bold ml-1">/ {user.limit}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Health */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Project Visibility & Risks
          </h3>
          <div className="space-y-4">
            {data?.projectHealth.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No active projects tracked.</p>
            ) : (
              data?.projectHealth.map((project) => (
                <div key={project.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-bold text-gray-900">{project.name}</p>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      project.riskScore > 40 ? 'bg-red-100 text-red-700' : 
                      project.riskScore > 20 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {project.riskScore > 40 ? 'HIGH RISK' : project.riskScore > 20 ? 'MEDIUM RISK' : 'HEALTHY'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${(project.statusDistribution.DONE / Math.max(project.taskCount, 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(project.statusDistribution.DOING / Math.max(project.taskCount, 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="h-full bg-amber-500" 
                        style={{ width: `${(project.statusDistribution.BLOCKED / Math.max(project.taskCount, 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="h-full bg-red-500" 
                        style={{ width: `${(project.statusDistribution.OVERDUE / Math.max(project.taskCount, 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{project.taskCount} Tasks</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue by Owner */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Overdue Tasks by Owner
          </h3>
          <div className="space-y-4">
            {data?.overdueByOwner.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No overdue tasks. Execution is on schedule.</p>
            ) : (
              data?.overdueByOwner.map((owner) => (
                <div key={owner.ownerName} className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-gray-900">{owner.ownerName}</p>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                      {owner.count} OVERDUE
                    </span>
                  </div>
                  <div className="space-y-1">
                    {owner.tasks.slice(0, 2).map(task => (
                      <p key={task.id} className="text-xs text-gray-500 truncate">• {task.title}</p>
                    ))}
                    {owner.count > 2 && <p className="text-[10px] text-gray-400 italic">...and {owner.count - 2} more</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Task Board for Managers */}
      <section className="mt-12">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-6 flex items-center">
          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
          Team-Wide Execution Board
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Todo', status: ['TODO'] },
            { title: 'In Progress', status: ['DOING'] },
            { title: 'Blocked & Overdue', status: ['BLOCKED', 'OVERDUE'] },
          ].map((col) => (
            <div key={col.title} className="flex flex-col space-y-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-gray-500 uppercase">{col.title}</span>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {data?.allTeamTasks.filter(t => col.status.includes(t.status)).length || 0}
                </span>
              </div>
              <div className={`flex-1 min-h-[300px] p-3 rounded-2xl border-2 border-dashed ${
                col.title.includes('Blocked') ? 'bg-amber-50/30 border-amber-100' : 'bg-gray-50/50 border-gray-100'
              } space-y-3`}>
                {data?.allTeamTasks
                  .filter(t => col.status.includes(t.status))
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      ownerName={task.ownerName}
                      projectName={task.projectName}
                      risk={task.risk}
                      onClick={() => setSelectedTaskId(task.id)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        title="Task Distribution Detail"
        maxWidthClassName="max-w-2xl"
        footer={
          <>
            <button
              className="px-8 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              onClick={() => setSelectedTaskId(null)}
            >
              Close
            </button>
            {canEdit && (
              <button
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
                onClick={() => setIsEditOpen(true)}
              >
                Edit Task
              </button>
            )}
          </>
        }
      >
            {selectedTask && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Title</label>
                  <h4 className="text-xl font-black text-slate-900 leading-tight">{selectedTask.title}</h4>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</label>
                  <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedTask.description || 'No description provided for this task.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Owner</label>
                    <div className="font-bold text-slate-900">{selectedTask.ownerName}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project</label>
                    <div className="font-bold text-slate-900">{selectedTask.projectName || 'General'}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</label>
                    <div className="flex items-center">
                      <span className={`w-2.5 h-2.5 rounded-full mr-2 ${
                        selectedTask.status === 'DONE' ? 'bg-green-500' :
                        selectedTask.status === 'DOING' ? 'bg-blue-500' :
                        selectedTask.status === 'BLOCKED' ? 'bg-amber-500' :
                        selectedTask.status === 'OVERDUE' ? 'bg-red-500' : 'bg-slate-300'
                      }`} />
                      <span className="font-bold text-slate-700">{selectedTask.status}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</label>
                    <div className={`font-black ${
                      selectedTask.priority === 'P1' ? 'text-red-600' :
                      selectedTask.priority === 'P2' ? 'text-blue-600' : 'text-slate-500'
                    }`}>
                      {selectedTask.priority}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deadline</label>
                    <div className="font-bold text-slate-700">
                      {new Date(selectedTask.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Status</label>
                    <div className={`font-black ${
                      selectedTask.risk.level === 'CRITICAL' ? 'text-red-600' :
                      selectedTask.risk.level === 'AT_RISK' ? 'text-amber-600' :
                      selectedTask.risk.level === 'WATCH' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {selectedTask.risk.level}
                    </div>
                  </div>
                </div>

                {selectedTask.blockerReason && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Blocker Reason</label>
                    <p className="text-amber-900 font-bold">{selectedTask.blockerReason}</p>
                  </div>
                )}
              </div>
            )}
      </Modal>

      {selectedTask && canEdit && (
        <EditTaskModal
          task={selectedTask}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  );
};
