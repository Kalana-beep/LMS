import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UploadDocument = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ courseId: courseIdParam || '', title: '', type: 'worksheet' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseIdParam) {
      api.get('/teacher/courses').then(res => {
        setCourses(res.data.courses);
        if (res.data.courses.length) setForm(prev => ({ ...prev, courseId: res.data.courses[0]._id }));
      }).catch(() => toast.error('Failed to load courses'));
    }
  }, [courseIdParam]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId) return toast.error('Select a course');
    if (!file) return toast.error('Select a PDF file');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('courseId', form.courseId);
    formData.append('title', form.title);
    formData.append('type', form.type);
    formData.append('file', file);
    
    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded');
      setForm({ ...form, title: '' });
      setFile(null);
      setTimeout(() => navigate(`/teacher/courses/${form.courseId}/manage`), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto glass-card p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Upload PDF Document</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!courseIdParam && (
            <select required className="glass-input w-full" value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          )}
          <input type="text" placeholder="Document Title" required className="glass-input w-full" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <select required className="glass-input w-full" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="worksheet">Worksheet</option>
            <option value="tutorial">Tutorial</option>
            <option value="note">Note</option>
          </select>
          <div>
            <label className="block text-sm text-gray-300 mb-1">PDF File</label>
            <input type="file" accept=".pdf" onChange={handleFileChange} required className="glass-input w-full" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg">
            {loading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;