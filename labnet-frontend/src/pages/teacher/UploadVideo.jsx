import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UploadVideo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ courseId: courseIdParam || '', title: '', description: '', youtubeUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseIdParam) {
      api.get('/teacher/courses').then(res => { setCourses(res.data.courses); if (res.data.courses.length) setForm(prev => ({ ...prev, courseId: res.data.courses[0]._id })); }).catch(() => toast.error('Failed to load courses'));
    }
  }, [courseIdParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId) return toast.error('Select a course');
    if (!form.youtubeUrl) return toast.error('Enter YouTube URL');
    setLoading(true);
    try {
      await api.post('/videos/upload', form);
      toast.success('Video added');
      setForm({ ...form, title: '', description: '', youtubeUrl: '' });
      setTimeout(() => navigate('/teacher/dashboard'), 1500);
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto glass-card p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Add YouTube Video</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!courseIdParam && <select required className="glass-input w-full" value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}><option value="">Select Course</option>{courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}</select>}
          <input type="text" placeholder="Video Title" required className="glass-input w-full" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <textarea placeholder="Description" rows="3" className="glass-input w-full" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input type="url" placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)" required className="glass-input w-full" value={form.youtubeUrl} onChange={e => setForm({...form, youtubeUrl: e.target.value})} />
          <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg">{loading ? 'Adding...' : 'Add Video'}</button>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;