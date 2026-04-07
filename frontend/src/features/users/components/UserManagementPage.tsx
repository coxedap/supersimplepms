import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useInviteMember } from '../hooks/useUsers';
import { useAuthStore } from '../../../store/useAuthStore';
import { Modal } from '../../../components/Modal';

const ROLES = ['CONTRIBUTOR', 'TEAM_LEAD', 'MANAGER', 'ADMIN'] as const;

export const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useUsers();
  const { user: currentUser } = useAuthStore();
  const inviteMember = useInviteMember();

  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'CONTRIBUTOR' });
  const [formError, setFormError] = useState('');

  const handleInvite = async () => {
    setFormError('');
    if (!form.email.trim()) {
      setFormError('Email is required.');
      return;
    }
    try {
      await inviteMember.mutateAsync(form);
      setShowInvite(false);
      setForm({ email: '', role: 'CONTRIBUTOR' });
    } catch {
      // error toast handled in hook
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <header className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Users Management</h1>
              <p className="text-sm text-gray-500 font-medium mt-2">Manage user roles, limits, and team assignments</p>
            </div>
            <button
              onClick={() => { setFormError(''); setShowInvite(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              + Invite Member
            </button>
          </header>
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading users...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">Error loading users. Please try again later.</p>
            </div>
          )}
          {users && users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
          {users && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Role</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Team</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">WIP Limit</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">P1 Limit</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.team || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.wipLimitOverride !== undefined && user.wipLimitOverride !== null
                          ? user.wipLimitOverride
                          : user.wipLimit}
                        {user.wipLimitOverride !== undefined && user.wipLimitOverride !== null && (
                          <span className="text-xs text-blue-600 font-bold ml-1">(override)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.p1LimitOverride !== undefined && user.p1LimitOverride !== null
                          ? user.p1LimitOverride
                          : user.p1Limit}
                        {user.p1LimitOverride !== undefined && user.p1LimitOverride !== null && (
                          <span className="text-xs text-blue-600 font-bold ml-1">(override)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors text-xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite Member"
        footer={
          <>
            <button
              onClick={() => setShowInvite(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={inviteMember.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviteMember.isPending ? 'Inviting...' : 'Invite'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{formError}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jane@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
