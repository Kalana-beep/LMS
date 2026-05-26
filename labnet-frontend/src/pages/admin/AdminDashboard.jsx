import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, BookOpen, Video, TrendingUp, Mail, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalVideos: 0,
    activeSubscriptions: 0,
    totalEnrollments: 0
  });

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4"><Users className="text-purple-400 mb-2" size={24} /><p className="text-2xl font-bold">{stats.totalStudents}</p><p className="text-gray-400">Total Students</p></div>
          <div className="glass-card p-4"><BookOpen className="text-blue-400 mb-2" size={24} /><p className="text-2xl font-bold">{stats.totalCourses}</p><p className="text-gray-400">Courses</p></div>
          <div className="glass-card p-4"><Video className="text-green-400 mb-2" size={24} /><p className="text-2xl font-bold">{stats.totalVideos}</p><p className="text-gray-400">Videos</p></div>
          <div className="glass-card p-4"><TrendingUp className="text-yellow-400 mb-2" size={24} /><p className="text-2xl font-bold">{stats.activeSubscriptions}</p><p className="text-gray-400">Active Subs</p></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/users" className="btn-secondary block text-center py-2 rounded-lg">Manage Users</Link>
              <Link to="/admin/courses" className="btn-secondary block text-center py-2 rounded-lg">Manage Courses</Link>
              <Link to="/admin/teachers" className="btn-secondary block text-center py-2 rounded-lg flex items-center justify-center gap-2"><UserPlus size={18} /> Manage Teachers</Link>
              <Link to="/admin/analytics" className="btn-secondary block text-center py-2 rounded-lg">Analytics</Link>
              <Link to="/admin/contacts" className="btn-secondary block text-center py-2 rounded-lg flex items-center justify-center gap-2"><Mail size={18} /> Contact Messages</Link>
            </div>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">System Info</h2>
            <p>Total Teachers: {stats.totalTeachers}</p>
            <p>Total Enrollments: {stats.totalEnrollments}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;