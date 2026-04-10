import React, { useState } from 'react';
import { useProjects, useCreateProject, useUpdateProject, ProjectRecord } from '../hooks/useProjects';
import { useUsers } from '../../users/hooks/useUsers';
import { useTeams } from '../../teams/hooks/useTeams';
import { useAuthStore } from '../../../store/useAuthStore';

const STATUS_STYLES: Record<ProjectRecord['status'], string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-600',
};

const BLANK_FORM = { name: '', description: '', managerId: '', teamId: '' };

export const ProjectsPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { data: projects, isLoading, error } = useProjects();
  const { data: users } = useUsers();
  const { data: teams } = useTeams();

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

  const [form, setForm] = useState(BLANK_FORM);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    managerId: string;
    teamId: string;
    status: ProjectRecord['status'];
  }>({ name: '', description: '', managerId: '', teamId: '', status: 'active' });

  const canCreate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  if (!currentUser) return null;

  const getManagerName = (managerId: string) =>
    users?.find((u) => u.id === managerId)?.name ?? managerId;

  const getTeamName = (teamId?: string) =>
    teamId ? (teams?.find((t) => t.id === teamId)?.name ?? '—') : '—';

  const handleCreate = async () => {
    if (!form.name.trim() || !form.managerId || !currentUser) return;
    await createProject.mutateAsync({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      managerId: form.managerId,
      teamId: form.teamId || undefined,
      creatorId: currentUser.id,
    });
    setForm(BLANK_FORM);
    setShowCreateModal(false);
  };

  const openEdit = (project: ProjectRecord) => {
    setEditingProject(project);
    setEditForm({
      name: project.name,
      description: project.description ?? '',
      managerId: project.managerId,
      teamId: project.teamId ?? '',
      status: project.status,
    });
  };

  const handleUpdate = async () => {
    if (!editingProject || !currentUser) return;
    await updateProject.mutateAsync({
      id: editingProject.id,
      name: editForm.name.trim() || undefined,
      description: editForm.description.trim() || undefined,
      managerId: editForm.managerId || undefined,
      teamId: editForm.teamId || null,
      status: editForm.status,
      requesterId: currentUser.id,
    });
    setEditingProject(null);
  };

  // Managers and admins available as project manager
  const eligibleManagers = users?.filter(
    (u) => u.role === 'MANAGER' || u.role === 'ADMIN'
  ) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <header className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Projects</h1>
              <p className="text-sm text-gray-500 font-medium mt-2">Create and manage projects for task grouping</p>
            </div>
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                + Create Project
              </button>
            )}
          </header>

          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading projects...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">Error loading projects. Please try again.</p>
            </div>
          )}
          {projects && projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects yet.</p>
            </div>
          )}
          {projects && projects.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Team</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Description</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Manager</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Created</th>
                    {canCreate && (
                      <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{project.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{getTeamName(project.teamId)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                        {project.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{getManagerName(project.managerId)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[project.status]}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      {canCreate && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => openEdit(project)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors text-xs"
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Create Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Website Redesign"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Description (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Team (optional)
                </label>
                <select
                  value={form.teamId}
                  onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— No team —</option>
                  {teams?.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Manager *
                </label>
                <select
                  value={form.managerId}
                  onChange={(e) => setForm((f) => ({ ...f, managerId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Select manager —</option>
                  {eligibleManagers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.name.trim() || !form.managerId || createProject.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Edit Project</h2>
              <button
                onClick={() => setEditingProject(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Team
                </label>
                <select
                  value={editForm.teamId}
                  onChange={(e) => setEditForm((f) => ({ ...f, teamId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— No team —</option>
                  {teams?.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Manager
                </label>
                <select
                  value={editForm.managerId}
                  onChange={(e) => setEditForm((f) => ({ ...f, managerId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Select manager —</option>
                  {eligibleManagers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value as ProjectRecord['status'] }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateProject.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProject.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
