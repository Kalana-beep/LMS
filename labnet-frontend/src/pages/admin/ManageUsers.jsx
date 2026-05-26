import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, UserCog, Shield, BookOpen, Ban, CheckCircle, Calendar, XCircle } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [blockModal, setBlockModal] = useState({ open: false, userId: null, reason: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}`, { role });
      setUsers(users.map(u => u._id === userId ? {...u, role} : u));
      toast.success('Role updated');
    } catch(err) {
      toast.error('Failed');
    }
  };

  const blockUser = async (userId, reason) => {
    try {
      await api.post(`/admin/users/${userId}/block`, { reason });
      setUsers(users.map(u => u._id === userId ? {...u, blocked: true, blockReason: reason} : u));
      toast.success('User blocked');
      setBlockModal({ open: false, userId: null, reason: '' });
    } catch(err) {
      toast.error('Failed');
    }
  };

  const unblockUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/unblock`);
      setUsers(users.map(u => u._id === userId ? {...u, blocked: false, blockReason: null} : u));
      toast.success('User unblocked');
    } catch(err) {
      toast.error('Failed');
    }
  };

  const activateSub = async (userId) => {
    if (confirm('Activate 30-day subscription for this user?')) {
      try {
        await api.post(`/admin/users/${userId}/activate-subscription`);
        toast.success('Subscription activated for 30 days');
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        setUsers(users.map(u => u._id === userId ? {...u, subscriptionStatus: 'active', subscriptionEnd: endDate} : u));
      } catch(err) {
        toast.error('Failed');
      }
    }
  };

  const expireSub = async (userId) => {
    if (confirm('Expire this user\'s subscription? They will lose access to courses.')) {
      try {
        await api.post(`/admin/users/${userId}/expire-subscription`);
        toast.success('Subscription expired');
        setUsers(users.map(u => u._id === userId ? {...u, subscriptionStatus: 'expired', subscriptionEnd: null} : u));
      } catch(err) {
        toast.error('Failed');
      }
    }
  };

  const deleteUser = async (userId, userName) => {
    if (confirm(`⚠️ Permanently delete user "${userName}"? This action cannot be undone and will delete all their data.`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('User deleted');
        fetchUsers();
      } catch(err) {
        toast.error(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const getRoleIcon = (role) => {
    if (role === 'admin') return <Shield size={16} className="text-red-400" />;
    if (role === 'teacher') return <BookOpen size={16} className="text-blue-400" />;
    return <UserCog size={16} className="text-green-400" />;
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      teacher: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      student: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${styles[role]}`;
  };

  const getStatusBadge = (blocked) => {
    if (blocked) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><Ban size={12} /> Blocked</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1"><CheckCircle size={12} /> Active</span>;
  };

  const getSubscriptionBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">Active</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">Expired</span>;
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Manage Users</h1>
          <p className="text-gray-400 mt-1">Total users: {users.length}</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Subscription</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <UserCog size={16} className="text-purple-400" />
                          </div>
                        )}
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <select
                          value={user.role}
                          onChange={e => updateRole(user._id, e.target.value)}
                          className="bg-transparent border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-purple-400"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(user.blocked)}</td>
                    <td className="px-6 py-4">{getSubscriptionBadge(user.subscriptionStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {!user.blocked ? (
                          <button
                            onClick={() => setBlockModal({ open: true, userId: user._id, reason: '' })}
                            className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-400/30 hover:bg-red-400/10 transition"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => unblockUser(user._id)}
                            className="text-green-400 hover:text-green-300 text-xs px-2 py-1 rounded border border-green-400/30 hover:bg-green-400/10 transition"
                          >
                            Unblock
                          </button>
                        )}
                        <button
                          onClick={() => activateSub(user._id)}
                          className="text-purple-400 hover:text-purple-300 text-xs px-2 py-1 rounded border border-purple-400/30 hover:bg-purple-400/10 transition flex items-center gap-1"
                        >
                          <Calendar size={12} /> Extend
                        </button>
                        <button
                          onClick={() => expireSub(user._id)}
                          className="text-orange-400 hover:text-orange-300 text-xs px-2 py-1 rounded border border-orange-400/30 hover:bg-orange-400/10 transition flex items-center gap-1"
                        >
                          <XCircle size={12} /> Expire
                        </button>
                        <button
                          onClick={() => deleteUser(user._id, user.name)}
                          className="text-red-600 hover:text-red-500 text-xs px-2 py-1 rounded border border-red-600/30 hover:bg-red-600/10 transition flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400">No users found.</p>
          </div>
        )}
      </div>

      {/* Block Modal */}
      {blockModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Block User</h2>
            <textarea
              className="glass-input w-full mb-4"
              rows="3"
              placeholder="Enter reason for blocking..."
              value={blockModal.reason}
              onChange={e => setBlockModal({...blockModal, reason: e.target.value})}
            />
            <div className="flex gap-3">
              <button onClick={() => blockUser(blockModal.userId, blockModal.reason)} className="btn-primary px-4 py-2 rounded-lg flex-1">
                Confirm Block
              </button>
              <button onClick={() => setBlockModal({ open: false, userId: null, reason: '' })} className="btn-secondary px-4 py-2 rounded-lg flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;