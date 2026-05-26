import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Edit, Trash2, Plus, X, Users } from 'lucide-react';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    specialization: '',
    phone: '',
    profileImage: '',
    isPublic: true
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/admin/teachers-list');
      setTeachers(res.data.teachers);
    } catch (err) {
      toast.error('Failed to load teachers');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, profileImage: reader.result });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTeacher) {
        await api.put(`/admin/teachers/${editingTeacher._id}`, form);
        toast.success('Teacher updated');
      } else {
        if (!form.password) return toast.error('Password required');
        await api.post('/admin/teachers', form);
        toast.success('Teacher added');
      }
      setShowModal(false);
      setForm({ name: '', email: '', password: '', bio: '', specialization: '', phone: '', profileImage: '', isPublic: true });
      setImagePreview('');
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher permanently? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete teacher');
      }
    }
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email,
      password: '',
      bio: teacher.bio || '',
      specialization: teacher.specialization || '',
      phone: teacher.phone || '',
      profileImage: teacher.profileImage || '',
      isPublic: teacher.isPublic !== false
    });
    setImagePreview(teacher.profileImage || '');
    setShowModal(true);
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Teachers</h1>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingTeacher(null);
              setForm({ name: '', email: '', password: '', bio: '', specialization: '', phone: '', profileImage: '', isPublic: true });
              setImagePreview('');
            }}
            className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Teacher
          </button>
        </div>
        <div className="glass-card p-6">
          {teachers.length === 0 ? (
            <p className="text-gray-400 text-center">No teachers found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map(teacher => (
                <div key={teacher._id} className="glass-card p-4">
                  {teacher.profileImage ? (
                    <img
                      src={teacher.profileImage}
                      alt={teacher.name}
                      className="teacher-image"
                    />
                  ) : (
                    <div className="teacher-image bg-purple-900/50 flex items-center justify-center">
                      <Users size={40} className="text-purple-300" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-center mt-2">{teacher.name}</h3>
                  <p className="text-sm text-gray-400 text-center">{teacher.email}</p>
                  <p className="text-sm text-purple-300 text-center mt-1">{teacher.specialization}</p>
                  <p className="text-xs text-gray-400 text-center mt-1">{teacher.phone}</p>
                  <p className="text-sm text-gray-300 mt-2 line-clamp-2">{teacher.bio}</p>
                  <div className="flex justify-center gap-3 mt-4">
                    <button onClick={() => openEditModal(teacher)} className="text-blue-400 hover:text-blue-300">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(teacher._id)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                required
                className="glass-input w-full"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                required
                className="glass-input w-full"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
              {!editingTeacher && (
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="glass-input w-full"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              )}
              <input
                type="text"
                placeholder="Specialization (e.g., Mathematics, Physics)"
                className="glass-input w-full"
                value={form.specialization}
                onChange={e => setForm({ ...form, specialization: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="glass-input w-full"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              <textarea
                rows="3"
                placeholder="Bio / About"
                className="glass-input w-full"
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
              />
              <div>
                <label className="block text-sm text-gray-300 mb-1">Profile Photo</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="glass-input w-full" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 w-24 h-24 rounded-full object-cover mx-auto" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={form.isPublic}
                  onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-300">
                  Show on public pages (Teachers & About)
                </label>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg">
                {loading ? 'Saving...' : editingTeacher ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;