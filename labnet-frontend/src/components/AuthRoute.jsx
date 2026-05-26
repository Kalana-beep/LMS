import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default AuthRoute;