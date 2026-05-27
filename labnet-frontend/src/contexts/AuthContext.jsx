import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUser();
    else setLoading(false);
  }, []);
  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch { localStorage.removeItem('token'); }
    finally { setLoading(false); }
  };
  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    toast.success('OTP sent to your email');
    return res.data;
  };
  const verifyOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    toast.success('Email verified');
    return res.data;
  };
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}`);
    return res.data.user;
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); toast.success('Logged out'); };
  return <AuthContext.Provider value={{ user, loading, register, verifyOTP, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};