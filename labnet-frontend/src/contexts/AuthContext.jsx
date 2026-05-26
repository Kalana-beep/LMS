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
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}`);
      return res.data.user;
    } catch (err) {
      // Handle blocked account error (403)
      const message = err.response?.data?.message;
      if (err.response?.status === 403 && message?.includes('Account blocked')) {
        toast.error(message);
      } else {
        toast.error(message || 'Login failed');
      }
      throw err;
    }
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    toast.success('OTP sent to your email');
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    toast.success('Email verified successfully');
    return res.data;
  };

  const activateSubscription = async () => {
    const res = await api.post('/subscription/activate');
    setUser(res.data.user);
    toast.success('Subscription activated!');
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{
      user, setUser, loading, login, register, verifyOTP, activateSubscription, logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};