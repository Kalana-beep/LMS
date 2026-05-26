import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Maximize2 } from 'lucide-react';

const WatchVideo = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/videos/${videoId}`);
        setVideo(res.data.video);
      } catch (err) {
        if (err.response?.status === 403) {
          setAccessDenied(true);
          const msg = err.response?.data?.message;
          toast.error(msg || 'Access denied. Please check your subscription or enrollment.');
          setTimeout(() => navigate('/courses'), 3000);
        } else {
          setError(true);
          toast.error('Could not load video');
          setTimeout(() => navigate('/courses'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId, navigate]);

  useEffect(() => {
    if (!video) return;
    const youtubeId = getYouTubeId(video.youtubeUrl);
    if (!youtubeId) {
      toast.error('Invalid YouTube URL');
      navigate(-1);
      return;
    }

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: youtubeId,
        playerVars: {
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          iv_load_policy: 3
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setTimeout(() => {
                toast.success('Video completed. Returning to course...');
                navigate(-1);
              }, 2000);
            }
          }
        }
      });
    };
  }, [video, navigate]);

  const goFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    }
  };

  const handleContextMenu = (e) => { e.preventDefault(); return false; };
  const handleCopy = (e) => { e.preventDefault(); toast.error('Sharing video links is not allowed'); return false; };

  if (loading) return <div className="text-center py-20">Loading video...</div>;
  if (error || accessDenied) return <div className="text-center py-20">Redirecting...</div>;
  if (!video) return <div className="text-center py-20">Video not found</div>;

  return (
    <div className="min-h-screen py-20 px-6" onContextMenu={handleContextMenu} onCopy={handleCopy}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft size={20} /> Back to Course
          </button>
          <button onClick={goFullscreen} className="btn-secondary px-3 py-1 rounded-lg flex items-center gap-1 text-sm">
            <Maximize2 size={16} /> Full Screen
          </button>
        </div>
        <div className="glass-card p-4 mb-4">
          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
          <p className="text-gray-400">{video.description || 'No description'}</p>
        </div>
        <div ref={containerRef} className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <div id="youtube-player" className="absolute inset-0 w-full h-full"></div>
        </div>
        <p className="text-xs text-red-400 text-center mt-2">🔒 This video is for enrolled students only. Sharing is prohibited.</p>
      </div>
    </div>
  );
};

export default WatchVideo;