import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, KeyRound, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully. Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="glass-card p-8 max-w-md w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-3xl font-bold text-center mb-6">Reset Password</h2>
        <p className="text-gray-400 text-center mb-6">Enter OTP and new password for {email}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              required
              maxLength={6}
              className="glass-input w-full pl-10"
              placeholder="OTP code"
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              required
              className="glass-input w-full pl-10"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              required
              className="glass-input w-full pl-10"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg font-semibold">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          <Link to="/login" className="text-purple-400">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;