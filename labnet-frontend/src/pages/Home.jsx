import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Award, Users, Clock } from 'lucide-react';

const Home = () => {
  const features = [
    { icon: <Play size={28} />, title: "Expert-Led Courses", desc: "Learn from industry professionals" },
    { icon: <Award size={28} />, title: "Certification", desc: "Get recognized for your skills" },
    { icon: <Users size={28} />, title: "Community", desc: "Join 10,000+ learners" },
    { icon: <Clock size={28} />, title: "Flexible Learning", desc: "Learn at your own pace" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/50 to-black/70"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Build Your Future <br />with Sigma
          </motion.h1>
          <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xl text-gray-200 mb-8">
            Premium learning platform with expert-led courses, hands-on projects, and career guidance
          </motion.p>
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center gap-2 group">
              Join Now <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link to="/courses" className="btn-secondary px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center">
              Explore Courses
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Why Choose Sigma?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="glass-card p-6 text-center">
                <div className="text-purple-400 mb-4 flex justify-center">{feat.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-gray-300">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto glass-card p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <p className="text-gray-300 mb-6">Join thousands of students already learning with Sigma</p>
          <Link to="/register" className="btn-primary px-8 py-3 rounded-lg font-semibold inline-block">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;