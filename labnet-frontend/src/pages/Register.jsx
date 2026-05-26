import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidEmail(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await register(form);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="glass-card p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              required
              className="glass-input w-full pl-10"
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              required
              className="glass-input w-full pl-10"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              required
              className="glass-input w-full pl-10"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg font-semibold">
            {loading ? 'Sending OTP...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          Already have an account? <a href="/login" className="text-purple-400">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;