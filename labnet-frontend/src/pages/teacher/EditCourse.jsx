import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload } from 'lucide-react';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image: '', timetable: [] });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        const c = res.data.course;
        setCourse(c);
        setForm({ title: c.title, description: c.description, image: c.image || '', timetable: c.timetable || [] });
        setImagePreview(c.image || '');
      } catch (err) { toast.error('Failed to load course'); navigate('/teacher/dashboard'); } finally { setLoading(false); }
    };
    fetchCourse();
  }, [courseId, navigate]);

  const compressImage = (file, maxSizeMB = 0.5, maxWidth = 500) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > height && width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
        else if (height > maxWidth) { width = (width * maxWidth) / height; height = maxWidth; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.7;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        while (base64.length > maxSizeMB * 1024 * 1024 * 1.33 && quality > 0.2) { quality -= 0.1; base64 = canvas.toDataURL('image/jpeg', quality); }
        resolve(base64);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    try {
      const compressed = await compressImage(file, 0.5, 500);
      setForm({ ...form, image: compressed });
      setImagePreview(compressed);
      toast.success('Image loaded, remember to save');
    } catch (err) { toast.error('Failed to process image'); }
  };
  const removeImage = () => { setForm({ ...form, image: '' }); setImagePreview(''); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/teacher/courses/${courseId}`, { title: form.title, description: form.description, image: form.image, timetable: form.timetable });
      toast.success('Course updated');
      navigate(`/teacher/courses/${courseId}/manage`);
    } catch (err) {
      if (err.response?.data?.message?.includes('already have a course')) toast.error(err.response.data.message);
      else toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white"><ArrowLeft size={24} /></button><h1 className="text-3xl font-bold">Edit Course: {course?.title}</h1></div>
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
          <div><label className="block text-sm font-medium mb-1">Course Title</label><input type="text" required className="glass-input w-full" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea required rows="4" className="glass-input w-full" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Course Image</label><div className="flex items-center gap-4">{imagePreview && <div className="relative w-32 h-32"><img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" /><button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white text-xs">✕</button></div>}<label className="btn-secondary px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2"><Upload size={18} /> {imagePreview ? 'Change Image' : 'Upload Image'}<input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label></div><p className="text-xs text-gray-400 mt-1">Recommended: Square image, max 500px, under 500KB</p></div>
          <div className="flex gap-3"><button type="submit" disabled={saving} className="btn-primary px-6 py-2 rounded-lg">{saving ? 'Saving...' : 'Save Changes'}</button><button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6 py-2 rounded-lg">Cancel</button></div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;