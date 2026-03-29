import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers, useUpdateUserRole, useUpdateUserTeam, useUpdateUserLimits, useUpdateUserStatus, UserRecord } from '../hooks/useUsers';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';

export const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { data: users, isLoading } = useUsers();
  const { user: currentUser } = useAuthStore();
  const { addToast } = useToastStore();
  const updateRoleMutation = useUpdateUserRole();
  const updateTeamMutation = useUpdateUserTeam();
  const updateLimitsMutation = useUpdateUserLimits();
  const updateStatusMutation = useUpdateUserStatus();

  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({
    role: '',
    teamId: '',
    wipLimitOverride: '',
    p1LimitOverride: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (users && userId) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setEditingUser(user);
        setEditForm({
          role: user.role,
          teamId: user.teamId || '',
          wipLimitOverride: user.wipLimitOverride?.toString() || '',
          p1LimitOverride: user.p1LimitOverride?.toString() || '',
          status: user.status,
        });
      }
    }
  }, [users, userId]);

  if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-bold text-red-900">Access Denied</h3>
          <p className="text-red-700 text-sm">Only managers and admins can access user management.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !editingUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

  const handleSaveChanges = async () => {
    if (!editingUser || !currentUser) return;

    const errors: string[] = [];
    let hasChanges = false;

    try {
      // Update role if changed (only ADMIN can do this)
      if (editForm.role !== editingUser.role) {
        if (currentUser.role !== 'ADMIN') {
          errors.push('Only ADMIN can change user roles');
        } else {
          hasChanges = true;
          await updateRoleMutation.mutateAsync({
            userId: editingUser.id,
            requesterId: currentUser.id,
            newRole: editForm.role,
          });
        }
      }

      // Update team if changed
      if (editForm.teamId !== (editingUser.teamId || '')) {
        hasChanges = true;
        await updateTeamMutation.mutateAsync({
          userId: editingUser.id,
          requesterId: currentUser.id,
          teamId: editForm.teamId || null,
        });
      }

      // Update limits if changed (only ADMIN or MANAGER can do this)
      if (
        editForm.wipLimitOverride !== (editingUser.wipLimitOverride?.toString() || '') ||
        editForm.p1LimitOverride !== (editingUser.p1LimitOverride?.toString() || '')
      ) {
        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
          errors.push('Only ADMIN or MANAGER can change user limits');
        } else {
          hasChanges = true;
          await updateLimitsMutation.mutateAsync({
            userId: editingUser.id,
            requesterId: currentUser.id,
            wipLimitOverride: editForm.wipLimitOverride ? parseInt(editForm.wipLimitOverride) : null,
            p1LimitOverride: editForm.p1LimitOverride ? parseInt(editForm.p1LimitOverride) : null,
          });
        }
      }

      // Update status if changed (only ADMIN can do this)
      if (editForm.status !== editingUser.status) {
        if (currentUser.role !== 'ADMIN') {
          errors.push('Only ADMIN can change user status');
        } else {
          hasChanges = true;
          await updateStatusMutation.mutateAsync({
            userId: editingUser.id,
            requesterId: currentUser.id,
            status: editForm.status,
          });
        }
      }

      // Show errors if any
      if (errors.length > 0) {
        addToast(errors.join('. '), 'error');
        return;
      }

      // Show success if changes were made
      if (hasChanges) {
        addToast('User updated successfully', 'success');
        navigate('/users');
      } else {
        addToast('No changes to save', 'info');
      }
    } catch (err) {
      addToast('Failed to save changes', 'error');
      console.error('Failed to save changes:', err);
    }
  };

  const isSaving =
    updateRoleMutation.isPending ||
    updateTeamMutation.isPending ||
    updateLimitsMutation.isPending ||
    updateStatusMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <button
        onClick={() => navigate('/users')}
        className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors"
      >
        ← Back to Users
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit User</h1>
            <p className="text-sm text-gray-500 font-medium mt-2">{editingUser.name}</p>
          </header>

          <div className="space-y-6">
            {/* Name - Read Only */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={editingUser.name}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="CONTRIBUTOR">Contributor</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Team ID */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Team Assignment</label>
              <input
                type="text"
                value={editingUser.team || 'No Team'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">Team ID: {editingUser.teamId || 'Not assigned'}</p>
            </div>

            {/* WIP Limit Override */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">WIP Limit Override</label>
              <input
                type="number"
                min="0"
                value={editForm.wipLimitOverride}
                onChange={(e) => setEditForm({ ...editForm, wipLimitOverride: e.target.value })}
                placeholder="Leave empty for default"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">Default: {editingUser.wipLimit || '—'}</p>
            </div>

            {/* P1 Limit Override */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">P1 Limit Override</label>
              <input
                type="number"
                min="0"
                value={editForm.p1LimitOverride}
                onChange={(e) => setEditForm({ ...editForm, p1LimitOverride: e.target.value })}
                placeholder="Leave empty for default"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">Default: {editingUser.p1Limit || '—'}</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/users')}
                className="flex-1 px-4 py-2 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
