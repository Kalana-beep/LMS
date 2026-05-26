import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, X, LogOut, User, LayoutDashboard, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isModern, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/courses';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'teacher') return '/teacher/dashboard';
    return '/courses';
  };
  const getDashboardLabel = () => {
    if (!user) return 'Courses';
    if (user.role === 'admin') return 'Dashboard';
    if (user.role === 'teacher') return 'Dashboard';
    return 'Courses';
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Sigma</Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-300 hover:text-purple-400 transition">Home</Link>
            <Link to="/about" className="text-gray-300 hover:text-purple-400 transition">About</Link>
            <Link to="/contact" className="text-gray-300 hover:text-purple-400 transition">Contact</Link>
            <Link to="/courses" className="text-gray-300 hover:text-purple-400 transition">Courses</Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              aria-label="Toggle theme"
            >
              {isModern ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2"><LayoutDashboard size={18} /> {getDashboardLabel()}</Link>
                <Link to="/profile" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2"><User size={18} /> Profile</Link>
                <button onClick={logout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg flex items-center gap-2"><LogOut size={18} /> Logout</button>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="profile-image-sm"
                    />
                  ) : (
                    <User size={16} />
                  )}
                  <span className="text-sm">{user.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg">Login</Link>
                <Link to="/register" className="btn-primary px-4 py-2 rounded-lg">Join Now</Link>
              </>
            )}
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileOpen(true)}><Menu size={28} /></button>
        </div>
      </nav>
      <div className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={() => setMobileOpen(false)}></div>
        <div className="absolute right-0 top-0 h-full w-3/4 max-w-sm glass-card rounded-l-2xl p-6 flex flex-col">
          <button className="self-end mb-6" onClick={() => setMobileOpen(false)}><X size={28} /></button>
          <div className="flex flex-col space-y-4">
            <button onClick={() => { toggleTheme(); setMobileOpen(false); }} className="flex items-center gap-2 text-gray-300 text-lg border-b border-white/20 pb-2">
              {isModern ? <Moon size={20} /> : <Sun size={20} />} Theme
            </button>
            <Link to="/" className="text-gray-300 text-lg" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/about" className="text-gray-300 text-lg" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/contact" className="text-gray-300 text-lg" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link to="/courses" className="text-gray-300 text-lg" onClick={() => setMobileOpen(false)}>Courses</Link>
            <hr className="border-white/20" />
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="bg-white/10 py-2 rounded-lg text-center" onClick={() => setMobileOpen(false)}>{getDashboardLabel()}</Link>
                <Link to="/profile" className="bg-white/10 py-2 rounded-lg text-center" onClick={() => setMobileOpen(false)}>Profile</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="bg-white/10 py-2 rounded-lg">Logout</button>
                <div className="text-sm text-gray-400 text-center">{user.name}</div>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-white/10 py-2 rounded-lg text-center" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary py-2 rounded-lg text-center" onClick={() => setMobileOpen(false)}>Join Now</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;