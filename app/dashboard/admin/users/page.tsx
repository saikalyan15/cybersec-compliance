'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit, Trash, Key } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  designation: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<
    'delete' | 'reset'
  >('delete');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Password reset results state
  const [resetPasswordResult, setResetPasswordResult] = useState<{
    success: boolean;
    password?: string;
    error?: string;
  } | null>(null);

  // Redirect non-admin users
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.role !== 'admin' &&
      session?.user?.role !== 'owner'
    ) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  const openConfirmation = (user: User, action: 'delete' | 'reset') => {
    setSelectedUser(user);
    setConfirmationAction(action);
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
    setActionInProgress(false);
  };

  const handleConfirm = async () => {
    if (!selectedUser) return;

    setActionInProgress(true);

    try {
      if (confirmationAction === 'delete') {
        await deleteUser(selectedUser._id);
      } else {
        await resetPassword(selectedUser._id);
      }
      closeConfirmation();
    } catch (err) {
      console.error(`Error during ${confirmationAction}:`, err);
      setActionInProgress(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Update users list
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      setActionInProgress(true);
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      const data = await response.json();

      // Show success message with the new password
      setResetPasswordResult({
        success: true,
        password: data.newPassword,
      });
    } catch (err) {
      console.error('Error resetting password:', err);
      setResetPasswordResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const closePasswordResult = () => {
    setResetPasswordResult(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a365d] flex items-center">
          <Users className="mr-2" /> Users Management
        </h1>

        <button
          onClick={() => router.push('/dashboard/admin/users/add')}
          className="flex items-center px-4 py-2 bg-[#1a365d] text-white rounded-md hover:bg-[#2d4a77] transition-colors"
        >
          <Plus className="mr-1 h-4 w-4" /> Add User
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.designation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'owner'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/users/edit/${user._id}`
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openConfirmation(user, 'reset')}
                          className="text-amber-600 hover:text-amber-900"
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openConfirmation(user, 'delete')}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {confirmationAction === 'delete'
                ? 'Delete User'
                : 'Reset Password'}
            </h3>

            <div className="mb-6">
              {confirmationAction === 'delete' ? (
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete{' '}
                  <span className="font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                  ? This action cannot be undone.
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Are you sure you want to reset the password for{' '}
                  <span className="font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                  ? They will receive a new temporary password.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmation}
                disabled={actionInProgress}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={actionInProgress}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 
                  ${
                    confirmationAction === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
              >
                {actionInProgress
                  ? confirmationAction === 'delete'
                    ? 'Deleting...'
                    : 'Resetting...'
                  : confirmationAction === 'delete'
                  ? 'Delete'
                  : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Result Modal */}
      {resetPasswordResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {resetPasswordResult.success
                ? 'Password Reset Successful'
                : 'Password Reset Failed'}
            </h3>

            <div className="mb-6">
              {resetPasswordResult.success ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    The password has been reset successfully. Please share the
                    new temporary password with the user:
                  </p>
                  <div className="bg-gray-100 p-3 rounded-md font-mono text-center text-lg">
                    {resetPasswordResult.password}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    The user will be required to change this password on their
                    next login.
                  </p>
                </>
              ) : (
                <p className="text-sm text-red-500">
                  {resetPasswordResult.error ||
                    'An error occurred while resetting the password.'}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={closePasswordResult}
                className="px-4 py-2 bg-[#1a365d] text-white rounded-md hover:bg-[#2d4a77] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
