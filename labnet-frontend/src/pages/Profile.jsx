import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Camera, User, Trash2 } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    const formData = new FormData();
    formData.append('profileImage', file);
    setUploading(true);
    try {
      const res = await api.put('/users/profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data.user);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (confirm('Remove your profile picture?')) {
      try {
        const res = await api.delete('/users/profile-image');
        setUser(res.data.user);
        toast.success('Profile picture removed');
      } catch (err) {
        toast.error('Failed to remove');
      }
    }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto glass-card p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="profile-image border-4 border-purple-500"
              />
            ) : (
              <div className="profile-image bg-purple-900/50 flex items-center justify-center border-4 border-purple-500">
                <User size={48} className="text-purple-300" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-700">
              <Camera size={20} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          {user?.profileImage && (
            <button onClick={handleRemoveImage} className="text-red-400 text-sm flex items-center gap-1 mb-4 hover:text-red-300">
              <Trash2 size={16} /> Remove Photo
            </button>
          )}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <p className="text-sm capitalize mt-1">Role: {user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;