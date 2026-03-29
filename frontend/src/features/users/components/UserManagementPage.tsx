import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../hooks/useUsers';
import { useAuthStore } from '../../../store/useAuthStore';

export const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useUsers();
  const { user: currentUser } = useAuthStore();

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
          <header className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Users Management</h1>
            <p className="text-sm text-gray-500 font-medium mt-2">Manage user roles, limits, and team assignments</p>
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
    </div>
  );
};
