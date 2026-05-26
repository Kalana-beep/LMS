import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailHistory, setEmailHistory] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved emails from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('loginEmails');
    if (saved) {
      try {
        const emails = JSON.parse(saved);
        setEmailHistory(emails.slice(0, 5)); // keep last 5
      } catch (e) {}
    }
  }, []);

  // Save email to history after successful login
  const saveEmailToHistory = (email) => {
    let emails = emailHistory.filter(e => e !== email);
    emails.unshift(email); // add to front
    if (emails.length > 5) emails.pop(); // keep max 5
    setEmailHistory(emails);
    localStorage.setItem('loginEmails', JSON.stringify(emails));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      // Save email on success
      saveEmailToHistory(email);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/courses');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="glass-card p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              list="emailHistoryList"
              required
              className="glass-input w-full pl-10"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="off"
            />
            <datalist id="emailHistoryList">
              {emailHistory.map((em, idx) => (
                <option key={idx} value={em} />
              ))}
            </datalist>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              required
              className="glass-input w-full pl-10"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-purple-400 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg font-semibold">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          New here? <Link to="/register" className="text-purple-400">Join Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;