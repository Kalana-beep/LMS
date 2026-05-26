import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddAnnouncement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ courseId: courseIdParam || '', message: '' });
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!courseIdParam) {
      setLoadingCourses(true);
      api.get('/teacher/courses')
        .then(res => {
          setCourses(res.data.courses);
          if (res.data.courses.length) {
            setForm(prev => ({ ...prev, courseId: res.data.courses[0]._id }));
          }
        })
        .catch(err => {
          console.error('Failed to load courses:', err);
          const message = err.response?.data?.message || err.message;
          toast.error(`Failed to load courses: ${message}`);
        })
        .finally(() => setLoadingCourses(false));
    } else {
      setLoadingCourses(false);
    }
  }, [courseIdParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId) return toast.error('Select a course');
    setLoading(true);
    try {
      await api.post('/announcements', form);
      toast.success('Announcement posted');
      setForm({ ...form, message: '' });
      setTimeout(() => navigate('/teacher/dashboard'), 1500);
    } catch (err) {
      console.error('Announcement error:', err);
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCourses) return <div className="text-center py-20">Loading courses...</div>;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto glass-card p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Add Announcement</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!courseIdParam && (
            <select required className="glass-input w-full" value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          )}
          <textarea rows="4" required className="glass-input w-full" placeholder="Announcement message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
          <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg">
            {loading ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAnnouncement;