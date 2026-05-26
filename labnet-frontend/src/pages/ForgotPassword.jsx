import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
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
        <h2 className="text-3xl font-bold text-center mb-6">Forgot Password</h2>
        <p className="text-gray-400 text-center mb-6">Enter your email to receive a password reset OTP</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              required
              className="glass-input w-full pl-10"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg font-semibold">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          Remember your password? <Link to="/login" className="text-purple-400">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;