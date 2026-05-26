import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 mt-20 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Sigma Education Institute. All rights reserved.</p>
        
        <div className="flex items-center gap-2">
          <span>Made with</span>
          <Heart size={14} className="text-red-400 fill-red-400" />
          <span>for future innovators</span>
        </div>

        <div className="flex gap-6">
          <a href="#" className="hover:text-purple-300 transition"><i className="fab fa-twitter"></i></a>
          <a href="#" className="hover:text-purple-300 transition"><i className="fab fa-linkedin-in"></i></a>
          <a href="#" className="hover:text-purple-300 transition"><i className="fab fa-github"></i></a>
          <a href="#" className="hover:text-purple-300 transition"><i className="fab fa-discord"></i></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;