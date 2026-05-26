import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { BookOpen, PlayCircle, Clock } from 'lucide-react';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    api.get('/users/enrolled-courses')
      .then(res => setCourses(res.data.courses))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">My Courses</h1>
        <p className="text-gray-400 mb-8">Continue your learning journey</p>
        {courses.length === 0 ? (
          <div className="glass-card text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold">No courses yet</h3>
            <Link to="/courses" className="btn-primary inline-block mt-4 px-6 py-2 rounded-lg">Explore Courses</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course._id} className="glass-card p-6">
                <h2 className="text-xl font-bold">{course.title}</h2>
                <p className="text-gray-300 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <PlayCircle size={16} /> {course.videoCount || 0} lessons
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} /> {course.progress || 0}% complete
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                </div>
                <Link to={`/courses/${course._id}`} className="btn-secondary block text-center py-2 rounded-lg">
                  Continue Learning
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;