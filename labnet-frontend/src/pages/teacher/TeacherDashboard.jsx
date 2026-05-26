import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Users, Video, Upload, Megaphone, FileText, Send, Reply, MessageSquare, HelpCircle } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0, totalVideos: 0 });
  const [loading, setLoading] = useState(true);
  const [messageForm, setMessageForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Upcoming Lessons states
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', scheduledDate: '', image: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingLesson, setUploadingLesson] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get('/teacher/stats-summary'),
          api.get('/teacher/courses/stats')
        ]);
        setStats(statsRes.data);
        setCourses(coursesRes.data.courses || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchTeacherMessages();
  }, []);

  const fetchTeacherMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await api.get('/contact/my-messages');
      setTeacherMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Upcoming Lessons functions
  const fetchLessons = async (courseId) => {
    try {
      const res = await api.get(`/upcoming-lessons/course/${courseId}`);
      setLessons(res.data.lessons);
    } catch (err) { console.error(err); }
  };

  const openAddLessonModal = (course) => {
    setSelectedCourseForLesson(course);
    setEditingLesson(null);
    setLessonForm({ title: '', description: '', scheduledDate: '', image: '' });
    setImagePreview('');
    fetchLessons(course._id);
    setShowLessonModal(true);
  };

  const openEditLessonModal = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      scheduledDate: lesson.scheduledDate?.slice(0, 16) || '',
      image: lesson.image || ''
    });
    setImagePreview(lesson.image || '');
    setShowLessonModal(true);
  };

  const handleLessonImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLessonForm({ ...lessonForm, image: reader.result });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseForLesson) return;
    setUploadingLesson(true);
    try {
      const payload = {
        courseId: selectedCourseForLesson._id,
        title: lessonForm.title,
        description: lessonForm.description,
        scheduledDate: lessonForm.scheduledDate,
        image: lessonForm.image
      };
      if (editingLesson) {
        await api.put(`/upcoming-lessons/${editingLesson._id}`, payload);
        toast.success('Lesson updated');
      } else {
        await api.post('/upcoming-lessons', payload);
        toast.success('Lesson added');
      }
      setShowLessonModal(false);
      setLessonForm({ title: '', description: '', scheduledDate: '', image: '' });
      setImagePreview('');
      setEditingLesson(null);
      fetchLessons(selectedCourseForLesson._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lesson');
    } finally {
      setUploadingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (confirm('Delete this upcoming lesson?')) {
      try {
        await api.delete(`/upcoming-lessons/${lessonId}`);
        toast.success('Lesson deleted');
        fetchLessons(selectedCourseForLesson._id);
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleSendToAdmin = async (e) => {
    e.preventDefault();
    if (!messageForm.subject || !messageForm.message) return toast.error('Fill all fields');
    setSending(true);
    try {
      await api.post('/contact/teacher-send', messageForm);
      toast.success('Message sent to admin');
      setMessageForm({ subject: '', message: '' });
      fetchTeacherMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleTeacherReply = async (messageId) => {
    const reply = replyText[messageId];
    if (!reply) return toast.error('Enter reply');
    try {
      await api.post(`/contact/teacher/reply/${messageId}`, { reply });
      toast.success('Reply sent to student');
      setReplyText({ ...replyText, [messageId]: '' });
      fetchTeacherMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reply');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div><p className="text-gray-400">Loading dashboard...</p></div></div>;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
        <p className="text-gray-400 mb-6">Welcome back, {user?.name}</p>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4"><BookOpen className="text-purple-400 mb-2" size={24} /><p className="text-2xl font-bold">{stats.totalCourses}</p><p className="text-gray-400">Courses</p></div>
          <div className="glass-card p-4"><Users className="text-blue-400 mb-2" size={24} /><p className="text-2xl font-bold">{stats.totalStudents}</p><p className="text-gray-400">Students</p></div>
          <div className="glass-card p-4"><Video className="text-green-400 mb-2" size={24} /><p className="text-2xl font-bold">{stats.totalVideos}</p><p className="text-gray-400">Videos</p></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Upload size={20} /> Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/teacher/upload-video" className="btn-secondary w-full block text-center py-2 rounded-lg flex items-center justify-center gap-2"><Video size={18} /> Add YouTube Video</Link>
              <Link to="/teacher/upload-document" className="btn-secondary w-full block text-center py-2 rounded-lg flex items-center justify-center gap-2"><FileText size={18} /> Upload Learning Material (PDF)</Link>
              <Link to="/teacher/add-announcement" className="btn-secondary w-full block text-center py-2 rounded-lg flex items-center justify-center gap-2"><Megaphone size={18} /> Add Announcement</Link>
              <Link to="/teacher/questions" className="btn-secondary w-full block text-center py-2 rounded-lg flex items-center justify-center gap-2"><HelpCircle size={18} /> View Student Questions</Link>
            </div>
          </div>

          {/* My Courses */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            {courses.length === 0 ? <p className="text-gray-400">No courses assigned yet. Contact admin.</p> : courses.map(course => (
              <div key={course._id} className="glass-card p-4 mb-3">
                <h3 className="font-semibold text-lg">{course.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{course.description}</p>
                <div className="flex gap-4 text-xs text-gray-400 mb-3">
                  <span>📹 {course.videosCount || 0} videos</span>
                  <span>👥 {course.studentsCount || 0} students</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={`/teacher/upload-video?courseId=${course._id}`} className="text-purple-400 text-sm hover:underline">Add Video</Link>
                  <Link to={`/teacher/upload-document?courseId=${course._id}`} className="text-purple-400 text-sm hover:underline">Upload Material</Link>
                  <Link to={`/teacher/add-announcement?courseId=${course._id}`} className="text-purple-400 text-sm hover:underline">Add Announcement</Link>
                  <Link to={`/teacher/courses/${course._id}/manage`} className="text-blue-400 text-sm hover:underline">Manage</Link>
                  <button onClick={() => openAddLessonModal(course)} className="text-green-400 text-sm hover:underline">📅 Upcoming Lessons</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Admin Section */}
        <div className="glass-card p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Send size={20} /> Message Admin</h2>
          <form onSubmit={handleSendToAdmin} className="space-y-3">
            <input type="text" placeholder="Subject" required className="glass-input w-full" value={messageForm.subject} onChange={e => setMessageForm({...messageForm, subject: e.target.value})} />
            <textarea rows="3" placeholder="Message" required className="glass-input w-full" value={messageForm.message} onChange={e => setMessageForm({...messageForm, message: e.target.value})} />
            <button type="submit" disabled={sending} className="btn-primary px-4 py-2 rounded-lg">{sending ? 'Sending...' : 'Send to Admin'}</button>
          </form>
        </div>

        {/* Conversations Section */}
        <div className="glass-card p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MessageSquare size={20} /> Conversations</h2>
          {loadingMessages ? <p className="text-gray-400 text-center">Loading messages...</p> : teacherMessages.length === 0 ? <p className="text-gray-400 text-center">No messages yet.</p> : teacherMessages.map(msg => {
            const teacherIdValue = msg.teacherId?._id || msg.teacherId;
            const isTeacherRecipient = teacherIdValue === user?._id;
            const hasNotReplied = !msg.teacherReply;
            const isFromStudent = msg.senderRole === 'student';
            const showReplyForm = isTeacherRecipient && hasNotReplied && isFromStudent;
            return (
              <div key={msg._id} className="border-b border-white/10 py-4 last:border-0">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-purple-300">{msg.subject}</span><span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span></div>
                    <p className="text-gray-300 mt-1">{msg.message}</p>
                    <div className="text-xs text-gray-400 mt-1"><span className="font-medium">From:</span> {msg.senderName} ({msg.senderRole})<br /><span className="font-medium">To:</span> {msg.recipientType === 'admin' ? 'Admin only' : `Admin & ${msg.teacherId?.name || msg.teacherName || 'you'}`}</div>
                  </div>
                  <div className="text-xs"><span className={`px-2 py-1 rounded ${msg.status === 'both_replied' ? 'bg-green-500/20 text-green-400' : msg.status === 'admin_replied' ? 'bg-purple-500/20 text-purple-400' : msg.status === 'teacher_replied' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{msg.status}</span></div>
                </div>
                {msg.adminReply && (<div className="mt-2 pl-3 border-l-2 border-purple-400"><p className="text-purple-300 text-xs font-semibold">Admin reply ({msg.adminRepliedBy}):</p><p className="text-sm text-gray-300">{msg.adminReply}</p></div>)}
                {msg.teacherReply && (<div className="mt-2 pl-3 border-l-2 border-blue-400"><p className="text-blue-300 text-xs font-semibold">Your reply:</p><p className="text-sm text-gray-300">{msg.teacherReply}</p></div>)}
                {showReplyForm && (<div className="mt-3 flex gap-2"><textarea rows="2" placeholder="Write your reply to the student..." className="glass-input flex-1 text-sm" value={replyText[msg._id] || ''} onChange={e => setReplyText({...replyText, [msg._id]: e.target.value})} /><button onClick={() => handleTeacherReply(msg._id)} className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-1"><Reply size={16} /> Reply to Student</button></div>)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Lessons Modal */}
      {showLessonModal && selectedCourseForLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingLesson ? 'Edit Upcoming Lesson' : 'Add Upcoming Lesson'} - {selectedCourseForLesson.title}</h2>
              <button onClick={() => setShowLessonModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleLessonSubmit} className="space-y-4">
              <input type="text" placeholder="Lesson Title" required className="glass-input w-full" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} />
              <textarea rows="3" placeholder="Description" required className="glass-input w-full" value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} />
              <input type="datetime-local" required className="glass-input w-full" value={lessonForm.scheduledDate} onChange={e => setLessonForm({...lessonForm, scheduledDate: e.target.value})} />
              <div>
                <label className="block text-sm text-gray-300 mb-1">Lesson Image (optional)</label>
                <input type="file" accept="image/*" onChange={handleLessonImageUpload} className="glass-input w-full" />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded" />}
              </div>
              <button type="submit" disabled={uploadingLesson} className="btn-primary w-full py-2 rounded-lg">{uploadingLesson ? 'Saving...' : (editingLesson ? 'Update' : 'Add')}</button>
            </form>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Existing Upcoming Lessons</h3>
              {lessons.length === 0 ? <p className="text-gray-400">No upcoming lessons yet.</p> : lessons.map(lesson => (
                <div key={lesson._id} className="border-b border-white/10 py-2 flex justify-between items-center">
                  <div><p className="font-medium">{lesson.title}</p><p className="text-xs text-gray-400">{new Date(lesson.scheduledDate).toLocaleString()}</p></div>
                  <div className="flex gap-2"><button onClick={() => openEditLessonModal(lesson)} className="text-blue-400 text-sm">Edit</button><button onClick={() => handleDeleteLesson(lesson._id)} className="text-red-400 text-sm">Delete</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;