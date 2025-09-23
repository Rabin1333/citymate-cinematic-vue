import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Star, Calendar, Bell } from "lucide-react";
import ReminderModal from "./ReminderModal";

// Support BOTH: mock Movie (from src/data/movies) and API movie (UiMovie)
import type { Movie as MockMovie } from "../data/movies";
import type { UiMovie } from "../services/api";

type MovieLike = (UiMovie | MockMovie) & {
  id: string | number;
  releaseDate?: string;
};

interface ComingSoonMovieCardProps {
  movie: MovieLike;
  className?: string;
  onReminderSet?: () => void;
}

const ComingSoonMovieCard = ({ movie, className = "", onReminderSet }: ComingSoonMovieCardProps) => {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  
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

  const handleBellClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsReminderModalOpen(true);
  };

  return (
    <>
      <div className={`movie-card group ${className} relative`}>
        {/* Bell Icon for Coming Soon Movies */}
        {isComingSoon && isFutureRelease && (
          <button
            onClick={handleBellClick}
            className="absolute top-3 right-3 z-10 bg-cinema-red hover:bg-cinema-red-hover text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label={`Set reminder for ${movie.title}`}
          >
            <Bell className="h-4 w-4" />
          </button>
        )}

        <div className="relative overflow-hidden">
          <img
            src={posterSrc}
            alt={movie.title}
            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Movie Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Clock className="h-4 w-4" />
              <span>{movie.duration}</span>
              <Star className="h-4 w-4 ml-2" />
              <span>{movie.rating}</span>
            </div>
            <p className="text-white/90 text-sm line-clamp-2 mb-3">{movie.synopsis}</p>
            
            {isComingSoon ? (
              <div className="btn-cinema w-full text-center inline-block opacity-50 cursor-not-allowed">
                Coming Soon
              </div>
            ) : (
              <Link to={`/movie/${idStr}`} className="btn-cinema w-full text-center inline-block">
                Book Now
              </Link>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1">
            {movie.title}
          </h3>

          <div className="flex flex-wrap gap-1 mb-3">
            {(movie.genre || []).slice(0, 2).map((g) => (
              <span
                key={g}
                className="px-2 py-1 bg-cinema-red/20 text-cinema-red text-xs rounded-full"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-foreground-secondary">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {isComingSoon && releaseDate ? (
                <span>{releaseDate.toLocaleDateString()}</span>
              ) : (
                <span>{movie.releaseYear}</span>
              )}
            </div>
            <span>From ${movie.pricing.regular}</span>
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      {isComingSoon && isFutureRelease && (
        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          movie={{
            id: Number(movie.id),
            title: movie.title,
            releaseDate: movie.releaseDate!
          }}
          onReminderSet={() => {
            onReminderSet?.();
            setIsReminderModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default ComingSoonMovieCard;