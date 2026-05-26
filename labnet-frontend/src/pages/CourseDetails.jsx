import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Play, Calendar, Bell, User, Clock, BookOpen, Download, Upload, FileText, Megaphone, AlarmClock } from 'lucide-react';
import toast from 'react-hot-toast';
import PDFViewer from '../components/PDFViewer';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [countdowns, setCountdowns] = useState({});

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns = {};
      upcomingLessons.forEach(lesson => {
        const now = new Date();
        const lessonDate = new Date(lesson.scheduledDate);
        const diff = lessonDate - now;
        if (diff <= 0) {
          newCountdowns[lesson._id] = 'Started!';
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
          const seconds = Math.floor((diff % (60000)) / 1000);
          newCountdowns[lesson._id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(interval);
  }, [upcomingLessons]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data.course);
        const videosRes = await api.get(`/courses/${id}/videos`);
        setVideos(videosRes.data.videos);
        const announcementsRes = await api.get(`/courses/${id}/announcements`);
        setAnnouncements(announcementsRes.data.announcements);
        try {
          const docsRes = await api.get(`/documents/course/${id}`);
          setDocuments(docsRes.data.documents || []);
        } catch (docErr) { setDocuments([]); }
        if (isAuthenticated && user?.role === 'student') {
          try {
            const enrollRes = await api.get(`/users/check-enrollment/${id}`);
            setEnrolled(enrollRes.data.enrolled);
          } catch (err) { setEnrolled(false); }
        } else if (user?.role === 'teacher' || user?.role === 'admin') {
          setEnrolled(true);
        }
        // Fetch upcoming lessons
        try {
          const lessonsRes = await api.get(`/upcoming-lessons/course/${id}`);
          setUpcomingLessons(lessonsRes.data.lessons);
        } catch (err) { console.error(err); }
      } catch (err) {
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated, user]);

  const handleEnroll = async () => {
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true);
      toast.success('Enrolled successfully!');
      try {
        const docsRes = await api.get(`/documents/course/${id}`);
        setDocuments(docsRes.data.documents || []);
      } catch (err) {}
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await api.get(`/documents/download/${doc._id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName || `${doc.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  const showMaterials = (user?.role === 'student' && enrolled) || user?.role === 'teacher' || user?.role === 'admin';
  const isOwnerTeacher = user?.role === 'teacher' && course.teacherEmail === user?.email;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Course Header */}
        <div className="glass-card p-6 mb-8">
          {course.image && <img src={course.image} alt={course.title} className="w-full h-64 object-cover rounded-lg mb-4" />}
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-300 mb-4">{course.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1"><User size={16} /> {course.teacherName}</div>
            <div className="flex items-center gap-1"><Clock size={16} /> Self-paced</div>
            <div className="flex items-center gap-1"><BookOpen size={16} /> {videos.length} lessons</div>
          </div>
          {user?.role === 'student' && !enrolled && <button onClick={handleEnroll} className="btn-primary mt-4 px-6 py-2 rounded-lg">Follow Course</button>}
          {user?.role === 'student' && enrolled && <p className="text-green-400 mt-4">✓ You are enrolled</p>}
          {isOwnerTeacher && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/10">
              <Link to={`/teacher/upload-video?courseId=${course._id}`} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Upload size={16} /> Upload Video</Link>
              <Link to={`/teacher/upload-document?courseId=${course._id}`} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><FileText size={16} /> Upload Material</Link>
              <Link to={`/teacher/add-announcement?courseId=${course._id}`} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 text-sm"><Megaphone size={16} /> Add Announcement</Link>
            </div>
          )}
        </div>

        {/* UPCOMING LESSONS - PROMINENT SECTION WITH FILLED IMAGES */}
        {upcomingLessons.length > 0 && (
          <div className="glass-card p-6 mb-8 border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-300">
              <AlarmClock size={24} /> Upcoming Lessons – Don't Miss!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingLessons.map(lesson => (
                <div key={lesson._id} className="bg-white/5 rounded-xl overflow-hidden border border-purple-500/30 hover:scale-[1.02] transition-all duration-300">
                  {/* Image container - fixed height, image fills and centers */}
                  <div className="w-full h-48 md:h-56 overflow-hidden bg-gradient-to-r from-purple-800/50 to-pink-800/50">
                    {lesson.image ? (
                      <img 
                        src={lesson.image} 
                        alt={lesson.title} 
                        className="w-full h-full object-cover object-center" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar size={48} className="text-purple-300/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                    <p className="text-gray-300 text-sm mt-1">{lesson.description}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={16} /> {new Date(lesson.scheduledDate).toLocaleString()}
                      </div>
                      <div className="bg-purple-600/30 px-3 py-1 rounded-full text-purple-300 font-mono text-sm">
                        ⏳ {countdowns[lesson._id] || 'Calculating...'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rest of the Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Play size={20} /> Video Lessons</h2>
              {videos.length === 0 ? <p className="text-gray-400">No videos uploaded yet.</p> : videos.map(video => (
                <Link to={`/watch/${video._id}`} key={video._id} className="block glass-card p-3 hover:bg-white/10">
                  <div className="flex items-center gap-3"><Play size={20} className="text-purple-400" /><div><p className="font-medium">{video.title}</p><p className="text-xs text-gray-400">{video.description || 'No description'}</p></div></div>
                </Link>
              ))}
            </div>
            {showMaterials && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Download size={20} /> Learning Materials (PDFs)</h2>
                {documents.length === 0 ? <p className="text-gray-400">No PDF worksheets, tutorials, or notes uploaded yet.</p> : documents.map(doc => (
                  <div key={doc._id} className="flex justify-between items-center glass-card p-3">
                    <div><p className="font-medium">{doc.title}</p><p className="text-xs text-gray-400">Type: {doc.type === 'worksheet' ? '📝 Worksheet' : doc.type === 'tutorial' ? '📘 Tutorial' : '📄 Note'}</p></div>
                    <div className="flex gap-2"><button onClick={() => setSelectedPDF(doc._id)} className="btn-secondary px-3 py-1 rounded-lg text-sm">Read Online</button><button onClick={() => handleDownload(doc)} className="btn-secondary px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Download size={14} /> Download</button></div>
                  </div>
                ))}
              </div>
            )}
            {user?.role === 'student' && !enrolled && <div className="glass-card p-6 text-center"><p className="text-yellow-400">📚 Enroll in this course to access PDF learning materials.</p></div>}
          </div>
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell size={20} /> Announcements</h2>
              {announcements.length === 0 ? <p className="text-gray-400">No announcements yet.</p> : announcements.map(ann => (
                <div key={ann._id} className="border-l-2 border-purple-400 pl-3 mb-3"><p className="text-sm">{ann.message}</p><p className="text-xs text-gray-400">{new Date(ann.date).toLocaleDateString()}</p></div>
              ))}
            </div>
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Calendar size={20} /> Timetable</h2>
              {course.timetable && course.timetable.length > 0 ? course.timetable.map((slot, idx) => (
                <div key={idx} className="flex justify-between text-sm"><span>{slot.day}</span><span>{slot.startTime} - {slot.endTime}</span></div>
              )) : <p className="text-gray-400 text-sm">No schedule available</p>}
            </div>
          </div>
        </div>
      </div>
      {selectedPDF && <PDFViewer documentId={selectedPDF} title={documents.find(d => d._id === selectedPDF)?.title} onClose={() => setSelectedPDF(null)} />}
    </div>
  );
};

export default CourseDetails;