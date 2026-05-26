import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Mail, Phone, Award, Target, Heart, X, BookOpen, GraduationCap } from 'lucide-react';

const About = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get('/public/teachers');
        setTeachers(res.data.teachers);
      } catch (err) {
        console.error('Failed to load teachers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const openModal = (teacher) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTeacher(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            About Sigma
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We are on a mission to make quality education accessible, engaging, and future‑ready for everyone.
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="glass-card p-6 text-center hover:scale-[1.02] transition-all duration-300">
            <Target size={40} className="text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-gray-300">Empower learners with expert-led courses and practical skills for real-world success.</p>
          </div>
          <div className="glass-card p-6 text-center hover:scale-[1.02] transition-all duration-300">
            <Award size={40} className="text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-gray-300">Become Sri Lanka's leading online learning platform by 2030.</p>
          </div>
          <div className="glass-card p-6 text-center hover:scale-[1.02] transition-all duration-300">
            <Heart size={40} className="text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Our Values</h3>
            <p className="text-gray-300">Innovation, Inclusivity, Excellence, and Community.</p>
          </div>
        </div>

        {/* Teachers Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our Teachers</h2>
          <p className="text-gray-400 text-center mb-12">Learn from industry experts and experienced educators</p>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-12 glass-card p-8">
              <Users size={48} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">Teacher profiles will be added soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.map(teacher => (
                <div key={teacher._id} className="glass-card p-6 text-center hover:scale-[1.02] transition-all duration-300">
                  {teacher.profileImage ? (
                    <img
                      src={teacher.profileImage}
                      alt={teacher.name}
                      className="teacher-image border-4 border-purple-500"
                    />
                  ) : (
                    <div className="teacher-image bg-purple-900/50 flex items-center justify-center border-4 border-purple-500">
                      <Users size={48} className="text-purple-300" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mt-3">{teacher.name}</h3>
                  <p className="text-purple-400 text-sm mt-1">{teacher.specialization}</p>
                  <p className="text-gray-300 text-sm mt-3 line-clamp-2">{teacher.bio}</p>
                  <button
                    onClick={() => openModal(teacher)}
                    className="btn-secondary mt-4 px-4 py-2 rounded-lg text-sm w-full"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="glass-card p-8 text-center">
          <h3 className="text-2xl font-semibold mb-3">Join Our Learning Community</h3>
          <p className="text-gray-300 mb-6">Thousands of students are already learning with Sigma. Start your journey today.</p>
          <div className="flex justify-center gap-8 flex-wrap">
            <div><span className="text-3xl font-bold text-purple-400">10+</span><p className="text-gray-400">Expert Teachers</p></div>
            <div><span className="text-3xl font-bold text-purple-400">50+</span><p className="text-gray-400">Courses</p></div>
            <div><span className="text-3xl font-bold text-purple-400">1000+</span><p className="text-gray-400">Students</p></div>
          </div>
        </div>
      </div>

      {/* Teacher Details Modal - Improved Layout */}
      {modalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              {/* Profile Image */}
              <div className="mb-4">
                {selectedTeacher.profileImage ? (
                  <img
                    src={selectedTeacher.profileImage}
                    alt={selectedTeacher.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-purple-900/50 flex items-center justify-center border-4 border-purple-500">
                    <Users size={48} className="text-purple-300" />
                  </div>
                )}
              </div>
              
              {/* Name and Specialization */}
              <h2 className="text-3xl font-bold">{selectedTeacher.name}</h2>
              <p className="text-purple-400 text-lg mt-1">{selectedTeacher.specialization || 'Educator'}</p>
              
              {/* Contact Information */}
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center justify-center gap-3 text-gray-300 bg-white/10 rounded-lg p-3">
                  <Mail size={18} className="text-purple-400" />
                  <span className="break-all">{selectedTeacher.email}</span>
                </div>
                {selectedTeacher.phone && (
                  <div className="flex items-center justify-center gap-3 text-gray-300 bg-white/10 rounded-lg p-3">
                    <Phone size={18} className="text-purple-400" />
                    <span>{selectedTeacher.phone}</span>
                  </div>
                )}
              </div>
              
              {/* Biography Section */}
              {selectedTeacher.bio && (
                <div className="w-full mt-6">
                  <h4 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                    <BookOpen size={18} className="text-purple-400" /> Biography
                  </h4>
                  <div className="bg-white/5 rounded-lg p-4 text-gray-300 text-left leading-relaxed">
                    {selectedTeacher.bio}
                  </div>
                </div>
              )}
              
              {/* Additional Info (optional) */}
              <div className="w-full mt-6 pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  <GraduationCap size={14} className="inline mr-1" /> 
                  Expert in {selectedTeacher.specialization || 'Education'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;