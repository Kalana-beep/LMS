import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
};

export default RoleRoute;