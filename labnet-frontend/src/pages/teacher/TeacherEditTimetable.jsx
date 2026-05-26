import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const TeacherEditTimetable = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Days of week for dropdown
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data.course);
        setTimetable(res.data.course.timetable || []);
      } catch (err) {
        toast.error('Failed to load course');
        navigate('/teacher/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  const addTimeSlot = () => {
    setTimetable([...timetable, { day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
  };

  const removeTimeSlot = (index) => {
    const newTimetable = [...timetable];
    newTimetable.splice(index, 1);
    setTimetable(newTimetable);
  };

  const updateSlot = (index, field, value) => {
    const newTimetable = [...timetable];
    newTimetable[index][field] = value;
    setTimetable(newTimetable);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/teacher/courses/${courseId}/timetable`, { timetable });
      toast.success('Timetable updated successfully');
      navigate(`/teacher/courses/${courseId}/manage`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Edit Timetable</h1>
        </div>

        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">{course?.title}</h2>
          <p className="text-gray-400 mb-4">Set your course schedule</p>

          <div className="space-y-4">
            {timetable.map((slot, idx) => (
              <div key={idx} className="flex flex-wrap gap-3 items-end border-b border-white/10 pb-4">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs text-gray-400 mb-1">Day</label>
                  <select
                    value={slot.day}
                    onChange={(e) => updateSlot(idx, 'day', e.target.value)}
                    className="glass-input w-full"
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(idx, 'startTime', e.target.value)}
                    className="glass-input w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(idx, 'endTime', e.target.value)}
                    className="glass-input w-full"
                  />
                </div>
                <button
                  onClick={() => removeTimeSlot(idx)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addTimeSlot}
            className="mt-4 flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <Plus size={18} /> Add Time Slot
          </button>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Timetable'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary px-6 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherEditTimetable;