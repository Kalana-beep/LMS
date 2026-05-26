import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Trash2, Edit, Megaphone, FileText, Upload } from 'lucide-react';

const ManageCourses = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, videosRes, announcementsRes, docsRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/courses/${id}/videos`),
          api.get(`/courses/${id}/announcements`),
          api.get(`/documents/course/${id}`)
        ]);
        setCourse(courseRes.data.course);
        setVideos(videosRes.data.videos);
        setAnnouncements(announcementsRes.data.announcements);
        setDocuments(docsRes.data.documents || []);
      } catch (err) {
        toast.error('Failed to load course data');
      }
    };
    fetchData();
  }, [id]);

  const deleteVideo = async (videoId) => {
    if (confirm('Delete this video permanently?')) {
      try {
        await api.delete(`/videos/${videoId}`);
        setVideos(videos.filter(v => v._id !== videoId));
        toast.success('Video deleted');
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (confirm('Delete this announcement?')) {
      try {
        await api.delete(`/announcements/${announcementId}`);
        setAnnouncements(announcements.filter(a => a._id !== announcementId));
        toast.success('Announcement deleted');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const deleteDocument = async (docId) => {
    if (confirm('Delete this document?')) {
      try {
        await api.delete(`/documents/${docId}`);
        setDocuments(documents.filter(d => d._id !== docId));
        toast.success('Document deleted');
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  if (!course) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Manage: {course.title}</h1>
              <p className="text-gray-400">{course.description}</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to={`/teacher/courses/${course._id}/edit`} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2">
                <Edit size={18} /> Edit Course
              </Link>
              <Link to={`/teacher/courses/${course._id}/edit-timetable`} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2">
                <Calendar size={18} /> Edit Timetable
              </Link>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Megaphone size={20} /> Announcements
          </h2>
          {announcements.length === 0 ? (
            <p className="text-gray-400">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann._id} className="flex justify-between items-start glass-card p-3">
                  <div className="flex-1">
                    <p className="text-sm">{ann.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(ann.date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteAnnouncement(ann._id)} className="text-red-400 hover:text-red-300 ml-3">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link to={`/teacher/add-announcement?courseId=${course._id}`} className="text-purple-400 text-sm hover:underline">
              + Add New Announcement
            </Link>
          </div>
        </div>

        {/* Videos */}
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">🎬 Videos</h2>
            <Link to={`/teacher/upload-video?courseId=${course._id}`} className="btn-secondary px-3 py-1 rounded-lg text-sm">
              + Upload Video
            </Link>
          </div>
          {videos.length === 0 ? (
            <p className="text-gray-400">No videos uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {videos.map(video => (
                <div key={video._id} className="flex justify-between items-center glass-card p-3">
                  <div>
                    <p className="font-medium">{video.title}</p>
                    <p className="text-xs text-gray-400">{video.description}</p>
                  </div>
                  <button onClick={() => deleteVideo(video._id)} className="text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning Materials (Documents) */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText size={20} /> Learning Materials
            </h2>
            <Link to={`/teacher/upload-document?courseId=${course._id}`} className="btn-secondary px-3 py-1 rounded-lg text-sm flex items-center gap-1">
              <Upload size={16} /> Upload PDF
            </Link>
          </div>
          {documents.length === 0 ? (
            <p className="text-gray-400">No PDF worksheets, tutorials, or notes uploaded.</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc._id} className="flex justify-between items-center glass-card p-3">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-gray-400">
                      Type: {doc.type === 'worksheet' ? '📝 Worksheet' : doc.type === 'tutorial' ? '📘 Tutorial' : '📄 Note'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/teacher/documents/${doc._id}/edit`}
                      state={{ doc }}
                      className="text-blue-400 text-sm flex items-center gap-1"
                    >
                      <Edit size={16} /> Edit
                    </Link>
                    <button onClick={() => deleteDocument(doc._id)} className="text-red-400">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;