import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Only enforce subscription for students (admins/teachers bypass)
  if (user?.role === 'student' && user?.subscriptionStatus !== 'active') {
    return <Navigate to="/subscription/activate" replace />;
  }
  return children;
};

export default ProtectedRoute;