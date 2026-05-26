import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Video, BookOpen, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);
  
  if (!data) return <div className="text-center py-20">Loading...</div>;
  
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4">
            <Users className="text-purple-400 mb-2" size={24} />
            <p className="text-2xl font-bold">{data.totalStudents}</p>
            <p className="text-gray-400">Students</p>
          </div>
          <div className="glass-card p-4">
            <Video className="text-blue-400 mb-2" size={24} />
            <p className="text-2xl font-bold">{data.totalVideos}</p>
            <p className="text-gray-400">Videos</p>
          </div>
          <div className="glass-card p-4">
            <BookOpen className="text-green-400 mb-2" size={24} />
            <p className="text-2xl font-bold">{data.totalCourses}</p>
            <p className="text-gray-400">Courses</p>
          </div>
          <div className="glass-card p-4">
            <TrendingUp className="text-yellow-400 mb-2" size={24} />
            <p className="text-2xl font-bold">{data.activeSubscriptions}</p>
            <p className="text-gray-400">Active Subscriptions</p>
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Courses</h2>
          {data.popularCourses?.map((c, i) => (
            <div key={i} className="flex justify-between items-center border-b border-white/10 py-2">
              <span>{c.title}</span>
              <span className="text-purple-400">{c.enrollments} enrollments</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;