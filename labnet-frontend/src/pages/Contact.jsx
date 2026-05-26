import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, Users, BookOpen, AlertCircle } from 'lucide-react';

const Contact = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    courseId: '',
    message: '',
    recipientType: 'admin'
  });
  const [myMessages, setMyMessages] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) return;
    if (isAuthenticated) {
      fetchMessages();
      if (user?.role === 'student') {
        fetchEnrolledCourses();
      }
    }
  }, [isAuthenticated, authLoading, user]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await api.get('/contact/my-messages');
      setMyMessages(res.data.messages || []);
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await api.get('/users/enrolled-courses');
      console.log('Enrolled courses:', res.data.courses);
      setEnrolledCourses(res.data.courses || []);
    } catch (err) {
      toast.error('Could not load your courses');
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseChange = (courseId) => {
    const course = enrolledCourses.find(c => c._id === courseId);
    setForm({ ...form, courseId });
    if (course) {
      setSelectedTeacher({ 
        id: course.teacherId,
        name: course.teacherName 
      });
    } else {
      setSelectedTeacher(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login');
      navigate('/login');
      return;
    }

    if (user?.role !== 'student') {
      toast.error('Only students can send messages from this page');
      return;
    }

    if (!form.courseId) {
      toast.error('Please select a course');
      return;
    }
    const course = enrolledCourses.find(c => c._id === form.courseId);
    if (!course) {
      toast.error('Selected course not found');
      return;
    }

    const payload = {
      courseId: course._id,
      subject: course.title,
      message: form.message,
      recipientType: form.recipientType,
      teacherId: form.recipientType === 'both' ? course.teacherId : null
    };
    console.log('Sending payload:', payload);

    setSending(true);
    try {
      await api.post('/contact/send', payload);
      toast.success('Message sent successfully');
      setForm({ courseId: '', message: '', recipientType: 'admin' });
      setSelectedTeacher(null);
      fetchMessages();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send';
      toast.error(errorMsg);
      console.error('Send error:', err.response?.data);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-purple-400" />
                <div><p className="text-gray-300">Email</p><p>Sigmawariyapola@gmail.com</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-purple-400" />
                <div><p className="text-gray-300">Phone</p><p>070-3462789</p></div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-purple-400" />
                <div><p className="text-gray-300">Address</p><p>Mathwaththa Road, Wariyapola</p></div>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Send Message</h2>
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-yellow-400 mb-3">Please login to send a message.</p>
                <Link to="/login" className="btn-primary inline-block px-6 py-2 rounded-lg">Login</Link>
              </div>
            ) : user?.role === 'student' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Course (Subject)</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      required
                      className="glass-input w-full pl-10"
                      value={form.courseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      disabled={loadingCourses}
                    >
                      <option value="">-- Choose your course --</option>
                      {enrolledCourses.map(course => (
                        <option key={course._id} value={course._id}>
                          {course.title} (Teacher: {course.teacherName})
                        </option>
                      ))}
                    </select>
                  </div>
                  {loadingCourses && <p className="text-xs text-gray-400 mt-1">Loading your courses...</p>}
                  {enrolledCourses.length === 0 && !loadingCourses && (
                    <div className="mt-2 p-2 bg-yellow-500/10 rounded-lg flex items-start gap-2">
                      <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                      <p className="text-xs text-yellow-400">You are not enrolled in any courses. <Link to="/courses" className="underline">Browse courses</Link></p>
                    </div>
                  )}
                </div>

                {selectedTeacher && (
                  <div className="bg-white/5 rounded-lg p-2 text-sm">
                    <span className="text-gray-300">Teacher: </span>
                    <span className="text-purple-300">{selectedTeacher.name}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Send to:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" value="admin" checked={form.recipientType === 'admin'} onChange={() => setForm({...form, recipientType: 'admin'})} />
                      Admin Only
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" value="both" checked={form.recipientType === 'both'} onChange={() => setForm({...form, recipientType: 'both'})} />
                      Admin & Teacher
                    </label>
                  </div>
                </div>

                <textarea rows="4" placeholder="Your message..." required className="glass-input w-full" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />

                <button type="submit" disabled={sending || enrolledCourses.length === 0} className="btn-primary w-full py-2 rounded-lg flex items-center justify-center gap-2">
                  <Send size={18} /> {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-yellow-400 mb-3">Teachers and admins, please use your dashboard to contact admin.</p>
                <Link to={user?.role === 'teacher' ? '/teacher/dashboard' : '/admin/dashboard'} className="btn-primary inline-block px-6 py-2 rounded-lg">Go to Dashboard</Link>
              </div>
            )}
          </div>
        </div>

        {/* Messages List */}
        {isAuthenticated && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">My Conversations</h2>
            {loadingMessages ? (
              <p className="text-gray-400 text-center">Loading messages...</p>
            ) : myMessages.length === 0 ? (
              <p className="text-gray-400 text-center">No messages yet.</p>
            ) : (
              myMessages.map(msg => (
                <div key={msg._id} className="border-b border-white/10 py-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{msg.subject}</span>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-300 mt-1">{msg.message}</p>
                  <div className="text-xs text-gray-400 mt-1">
                    Recipient: {msg.recipientType === 'admin' 
                      ? 'Admin only' 
                      : `Admin & ${msg.teacherId?.name || msg.teacherName || 'Unknown Teacher'}`}
                  </div>
                  {msg.adminReply && (
                    <div className="mt-2 pl-3 border-l-2 border-purple-400">
                      <p className="text-purple-300 text-sm">Admin reply ({msg.adminRepliedBy}):</p>
                      <p>{msg.adminReply}</p>
                    </div>
                  )}
                  {msg.teacherReply && (
                    <div className="mt-2 pl-3 border-l-2 border-blue-400">
                      <p className="text-blue-300 text-sm">Teacher reply ({msg.teacherRepliedBy}):</p>
                      <p>{msg.teacherReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;