import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const EditDocument = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('worksheet');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const doc = location.state?.doc;
    if (doc) {
      setTitle(doc.title);
      setType(doc.type);
      setLoading(false);
    } else {
      toast.error('Document data missing');
      navigate(-1);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/documents/${docId}`, { title, type });
      toast.success('Document updated');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto glass-card p-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Edit Document</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              className="glass-input w-full"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select className="glass-input w-full" value={type} onChange={e => setType(e.target.value)}>
              <option value="worksheet">Worksheet</option>
              <option value="tutorial">Tutorial</option>
              <option value="note">Note</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-2 rounded-lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDocument;