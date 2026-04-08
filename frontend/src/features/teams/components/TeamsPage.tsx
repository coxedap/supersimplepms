import React, { useState } from 'react';
import { useTeams, useCreateTeam, useUpdateTeam, useAddTeamMember, useRemoveTeamMember } from '../hooks/useTeams';
import { useUsers } from '../../users/hooks/useUsers';
import { useAuthStore } from '../../../store/useAuthStore';

interface ManagingTeam {
  id: string;
  name: string;
  leaderId?: string;
}

export const TeamsPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const { data: teams, isLoading, error } = useTeams();
  const { data: users } = useUsers();

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ManagingTeam | null>(null);
  const [managingTeam, setManagingTeam] = useState<ManagingTeam | null>(null);

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLeaderId, setNewTeamLeaderId] = useState('');

  const [editName, setEditName] = useState('');
  const [editLeaderId, setEditLeaderId] = useState('');

  const [addMemberId, setAddMemberId] = useState('');

  const canCreate = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
  const canManageMembers =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'MANAGER' ||
    currentUser?.role === 'TEAM_LEAD';

  if (!currentUser || currentUser.role === 'CONTRIBUTOR') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-bold text-red-900">Access Denied</h3>
          <p className="text-red-700 text-sm">You do not have permission to view teams.</p>
        </div>
      </div>
    );
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !currentUser) return;
    await createTeam.mutateAsync({
      name: newTeamName.trim(),
      leaderId: newTeamLeaderId || undefined,
      creatorId: currentUser.id,
    });
    setNewTeamName('');
    setNewTeamLeaderId('');
    setShowCreateModal(false);
  };

  const openEdit = (team: ManagingTeam) => {
    setEditingTeam(team);
    setEditName(team.name);
    setEditLeaderId(team.leaderId ?? '');
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !currentUser) return;
    await updateTeam.mutateAsync({
      id: editingTeam.id,
      name: editName.trim() || undefined,
      leaderId: editLeaderId === '' ? null : editLeaderId,
      requesterId: currentUser.id,
    });
    setEditingTeam(null);
  };

  const handleAddMember = async () => {
    if (!addMemberId || !managingTeam || !currentUser) return;
    await addMember.mutateAsync({
      userId: addMemberId,
      teamId: managingTeam.id,
      requesterId: currentUser.id,
    });
    setAddMemberId('');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!managingTeam || !currentUser) return;
    await removeMember.mutateAsync({
      teamId: managingTeam.id,
      userId,
      requesterId: currentUser.id,
    });
  };

  const getTeamMembers = (teamId: string) =>
    users?.filter((u) => u.teamId === teamId) ?? [];

  const getLeaderName = (leaderId?: string) =>
    leaderId ? (users?.find((u) => u.id === leaderId)?.name ?? leaderId) : '—';

  const availableToAdd = managingTeam
    ? users?.filter((u) => u.teamId !== managingTeam.id && u.id !== managingTeam.leaderId) ?? []
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <header className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Teams</h1>
              <p className="text-sm text-gray-500 font-medium mt-2">View and manage teams and their members</p>
            </div>
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                + Create Team
              </button>
            )}
          </header>

          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading teams...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">Error loading teams. Please try again.</p>
            </div>
          )}
          {teams && teams.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No teams yet.</p>
            </div>
          )}
          {teams && teams.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Leader</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Members</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Created</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => {
                    const members = getTeamMembers(team.id);
                    return (
                      <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{team.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{getLeaderName(team.leaderId)}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {members.length === 0 ? (
                              <span className="text-sm text-gray-400">—</span>
                            ) : (
                              members.map((m) => (
                                <span
                                  key={m.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {m.name}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(team.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          {canEdit && (
                            <button
                              onClick={() => openEdit({ id: team.id, name: team.name, leaderId: team.leaderId })}
                              className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg font-bold hover:bg-gray-100 transition-colors text-xs"
                            >
                              Edit
                            </button>
                          )}
                          {canManageMembers && (
                            <button
                              onClick={() => {
                                setManagingTeam({ id: team.id, name: team.name, leaderId: team.leaderId });
                                setAddMemberId('');
                              }}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors text-xs"
                            >
                              Members
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Create Team</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Team Name *</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Team Lead (optional)</label>
                <select
                  value={newTeamLeaderId}
                  onChange={(e) => setNewTeamLeaderId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— No leader —</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim() || createTeam.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTeam.isPending ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Edit Team</h2>
              <button onClick={() => setEditingTeam(null)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Team Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Team Lead</label>
                <select
                  value={editLeaderId}
                  onChange={(e) => setEditLeaderId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— No leader —</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setEditingTeam(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleUpdateTeam}
                disabled={updateTeam.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateTeam.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {managingTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">{managingTeam.name} — Members</h2>
              <button onClick={() => setManagingTeam(null)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Current members */}
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Current Members</p>
                {getTeamMembers(managingTeam.id).length === 0 ? (
                  <p className="text-sm text-gray-400">No members yet.</p>
                ) : (
                  <div className="space-y-1">
                    {getTeamMembers(managingTeam.id).map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{m.name}</span>
                          <span className="text-xs text-gray-500 uppercase tracking-wide ml-2">{m.role}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          disabled={removeMember.isPending}
                          className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add member */}
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Add Member</p>
                <div className="flex gap-2">
                  <select
                    value={addMemberId}
                    onChange={(e) => setAddMemberId(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Select user —</option>
                    {availableToAdd.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddMember}
                    disabled={!addMemberId || addMember.isPending}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addMember.isPending ? '...' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100">
              <button onClick={() => setManagingTeam(null)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
