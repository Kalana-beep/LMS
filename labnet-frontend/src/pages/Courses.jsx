import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

const Courses = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(res => setAllCourses(res.data.courses))
      .catch(err => { console.error(err); toast.error('Failed to load courses'); })
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const olCourses = filteredCourses.filter(c => c.category === 'ol');
  const alCourses = filteredCourses.filter(c => c.category === 'al');

  const CourseCard = ({ course }) => (
    <div className="glass-card overflow-hidden hover:scale-[1.02] transition-all duration-300">
      {course.image && (
        <img
          src={course.image}
          alt={course.title}
          className="course-card-image"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
        <p className="text-gray-300 mb-4 line-clamp-2">{course.description}</p>
        <Link to={`/courses/${course._id}`} className="btn-primary inline-block px-4 py-2 rounded-lg text-sm">View Course</Link>
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-20">Loading courses...</div>;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Our Courses</h1>
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-10 py-2"
            />
          </div>
        </div>
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6 text-purple-300 border-l-4 border-purple-500 pl-4">O/L Courses</h2>
          {olCourses.length === 0 ? <p className="text-gray-400">No O/L courses found.</p> : 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {olCourses.map(course => <CourseCard key={course._id} course={course} />)}
            </div>
          }
        </section>
        <section>
          <h2 className="text-3xl font-semibold mb-6 text-purple-300 border-l-4 border-purple-500 pl-4">A/L Courses</h2>
          {alCourses.length === 0 ? <p className="text-gray-400">No A/L courses found.</p> : 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {alCourses.map(course => <CourseCard key={course._id} course={course} />)}
            </div>
          }
        </section>
      </div>
    </div>
  );
};

export default Courses;