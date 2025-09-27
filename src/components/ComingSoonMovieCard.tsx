import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Star, Calendar, Bell, Play } from "lucide-react";
import ReminderModal from "./ReminderModal";
import TrailerModal from "./TrailerModal";

// Support BOTH: mock Movie (from src/data/movies) and API movie (UiMovie)
import type { Movie as MockMovie } from "../data/movies";
import type { UiMovie } from "../services/api";

type MovieLike = (UiMovie | MockMovie) & {
  id: string | number;
  releaseDate?: string;
  trailerUrl?: string;
};

interface ComingSoonMovieCardProps {
  movie: MovieLike;
  className?: string;
  onReminderSet?: () => void;
}

const ComingSoonMovieCard = ({ movie, className = "", onReminderSet }: ComingSoonMovieCardProps) => {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number }>({ days: 0, hours: 0, minutes: 0 });
  
  // id may be number or string; use a string for routes/keys
  const idStr = String(movie.id);

  // Allow either absolute URLs or local paths
  const posterSrc =
    typeof movie.poster === "string" && movie.poster.startsWith("http")
      ? movie.poster
      : movie.poster;

  // Check if this is a coming soon movie with a release date
  const isComingSoon = movie.status === 'coming-soon' && movie.releaseDate;
  const releaseDate = movie.releaseDate ? new Date(movie.releaseDate) : null;
  const isFutureRelease = releaseDate && releaseDate > new Date();

  // Countdown timer effect
  useEffect(() => {
    if (!isFutureRelease || !releaseDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = releaseDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown({ days, hours, minutes });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isFutureRelease, releaseDate]);

  const handleBellClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReminderModalOpen(true);
  };

  const handleTrailerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsTrailerModalOpen(true);
  };

  return (
    <>
      <div className={`movie-card group ${className} relative overflow-hidden`}>
        {/* Cyber Glow Border */}
        <div className="absolute inset-0 bg-gradient-cyber opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Action Buttons for Coming Soon Movies */}
        {isComingSoon && isFutureRelease && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            {/* Trailer Button */}
            {movie.trailerUrl && (
              <button
                onClick={handleTrailerClick}
                className="bg-neon-blue hover:bg-neon-blue-glow text-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-neon"
                aria-label={`Watch ${movie.title} trailer`}
              >
                <Play className="h-5 w-5" />
              </button>
            )}
            
            {/* Reminder Bell */}
            <button
              onClick={handleBellClick}
              className="bg-neon-red hover:bg-neon-red-glow text-white p-3 rounded-full transition-all duration-300 hover:scale-110 animate-neon-pulse shadow-neon"
              aria-label={`Set reminder for ${movie.title}`}
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Countdown Timer */}
        {isComingSoon && isFutureRelease && (
          <div className="absolute top-4 left-4 z-20 countdown-timer">
            <div className="text-xs font-mono">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={posterSrc}
            alt={movie.title}
            className="w-full h-80 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          />
          
          {/* Neon Overlay Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-space-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          
          {/* Scan Line Animation */}
          <div className="absolute inset-0 bg-gradient-cyber opacity-0 group-hover:opacity-50 animate-cyber-scan" />

          {/* Movie Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-full group-hover:translate-y-0 transition-all duration-400">
            <div className="flex items-center gap-3 text-foreground-secondary text-sm mb-3">
              <div className="flex items-center gap-1 bg-space-gray/50 px-2 py-1 rounded-lg border border-cyber-border/50">
                <Clock className="h-4 w-4" />
                <span>{movie.duration}</span>
              </div>
              <div className="flex items-center gap-1 bg-space-gray/50 px-2 py-1 rounded-lg border border-cyber-border/50">
                <Star className="h-4 w-4 text-neon-red" />
                <span>{movie.rating}</span>
              </div>
            </div>
            <p className="text-foreground text-sm line-clamp-2 mb-4 leading-relaxed">{movie.synopsis}</p>
            
            {isComingSoon ? (
              <div className="flex gap-2">
                {movie.trailerUrl && (
                  <button
                    onClick={handleTrailerClick}
                    className="btn-neon flex-1 text-center text-sm flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Watch Trailer
                  </button>
                )}
                <div className={`btn-cinema-outline text-center inline-block opacity-70 cursor-not-allowed text-sm ${movie.trailerUrl ? 'flex-1' : 'w-full'}`}>
                  Coming Soon
                </div>
              </div>
            ) : (
              <Link to={`/movie/${idStr}`} className="btn-neon w-full text-center inline-block text-sm">
                Book Now
              </Link>
            )}
          </div>
        </div>

        <div className="p-5 bg-gradient-to-b from-space-gray to-space-black">
          <h3 className="font-bold text-xl text-foreground mb-3 line-clamp-1 group-hover:text-neon-red transition-colors duration-300">
            {movie.title}
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {(movie.genre || []).slice(0, 2).map((g) => (
              <span
                key={g}
                className="tag-neon"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-foreground-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isComingSoon && releaseDate ? (
                <span className="font-medium">{releaseDate.toLocaleDateString()}</span>
              ) : (
                <span className="font-medium">{movie.releaseYear}</span>
              )}
            </div>
            <span className="text-neon-red font-bold">From ${movie.pricing.regular}</span>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {isComingSoon && isFutureRelease && (
        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          movie={{
            id: String(movie.id),
            title: movie.title,
            releaseDate: movie.releaseDate
              ? new Date(movie.releaseDate).toISOString()
              : ""
          }}
          onReminderSet={() => {
            onReminderSet?.();
            setIsReminderModalOpen(false);
          }}
        />
      )}

      {/* Trailer Modal */}
      {movie.trailerUrl && (
        <TrailerModal
          isOpen={isTrailerModalOpen}
          onClose={() => setIsTrailerModalOpen(false)}
          movieTitle={movie.title}
          trailerUrl={movie.trailerUrl}
        />
      )}
    </>
  );
};

export default ComingSoonMovieCard;