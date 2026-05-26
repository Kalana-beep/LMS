import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { BookOpen, Clock, CreditCard, Calendar, Bell, AlertCircle } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/users/enrolled-courses'),
      api.get('/announcements/latest')
    ])
      .then(([coursesRes, annRes]) => {
        setCourses(coursesRes.data.courses);
        setAnnouncements(annRes.data.announcements);
      })
      .catch(console.error);
  }, []);

  const daysLeft = user?.subscriptionEnd ? Math.ceil((new Date(user.subscriptionEnd) - new Date()) / (1000*60*60*24)) : 0;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto">
        {user?.blocked && (
          <div className="glass-card bg-red-900/30 border-red-500 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-400" />
            <div>
              <p className="font-semibold">Account blocked</p>
              <p>Reason: {user.blockReason}</p>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
        <p className="text-gray-400 mb-6">Your learning journey continues</p>

        {/* Stats Cards - Sigma ID removed */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4">
            <BookOpen className="text-purple-400 mb-2" size={24} />
            <p className="text-2xl font-bold">{courses.length}</p>
            <p className="text-gray-400">Courses</p>
          </div>
          <div className="glass-card p-4">
            <Clock className="text-blue-400 mb-2" size={24} />
            <p className="text-2xl font-bold">{daysLeft}</p>
            <p className="text-gray-400">Days Left</p>
          </div>
          <div className="glass-card p-4">
            <CreditCard className="text-green-400 mb-2" size={24} />
            <p className="text-2xl font-bold capitalize">{user?.subscriptionStatus}</p>
            <p className="text-gray-400">Subscription</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <Link to="/student/my-courses" className="text-purple-400 text-sm">View all →</Link>
            </div>
            {courses.length === 0 ? (
              <p className="text-gray-400">No courses enrolled. <Link to="/courses" className="text-purple-400">Browse</Link></p>
            ) : (
              courses.slice(0,3).map(c => (
                <Link key={c._id} to={`/courses/${c._id}`} className="block glass-card p-4 mb-2">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-gray-400">Teacher: {c.teacherName}</p>
                </Link>
              ))
            )}
          </div>
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell size={20} /> Announcements
            </h2>
            {announcements.slice(0,5).map(ann => (
              <div key={ann._id} className="border-l-2 border-purple-400 pl-3 mb-2">
                <p className="text-sm">{ann.message}</p>
                <p className="text-xs text-gray-400">{new Date(ann.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;