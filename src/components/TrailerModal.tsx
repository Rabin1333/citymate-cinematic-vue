import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  trailerUrl: string;
}

const TrailerModal = ({ isOpen, onClose, movieTitle, trailerUrl }: TrailerModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl mx-4 aspect-video bg-space-black rounded-2xl overflow-hidden border border-cyber-border shadow-neon"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-space-black/80 hover:bg-neon-red text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-cyber-border/50"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Movie Title */}
        <div className="absolute top-4 left-4 z-20 bg-space-black/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-cyber-border/50">
          <h3 className="text-white font-bold text-lg">{movieTitle} - Trailer</h3>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={trailerUrl}
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedData={() => {
            // Auto-play when video loads
            if (videoRef.current) {
              videoRef.current.play();
            }
          }}
          poster="/posters/placeholder.jpg"
        />

        {/* Video Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Center Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="bg-neon-red/20 border-2 border-neon-red rounded-full p-4 group-hover:bg-neon-red/30 transition-all duration-300 group-hover:scale-110">
              {isPlaying ? (
                <Pause className="h-12 w-12 text-white" />
              ) : (
                <Play className="h-12 w-12 text-white ml-1" />
              )}
            </div>
          </button>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-neon-red transition-colors duration-200"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-neon-red transition-colors duration-200"
                >
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </button>
              </div>

              <div className="text-white text-sm bg-space-black/50 px-3 py-1 rounded-lg">
                Press ESC to close • Space to play/pause • M to mute
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-space-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-neon-red"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailerModal;