import { Link } from "react-router-dom";
import { Clock, Star, Calendar } from "lucide-react";

// Support BOTH: mock Movie (from src/data/movies) and API movie (UiMovie)
import type { Movie as MockMovie } from "../data/movies";
import type { UiMovie } from "../services/api";

type MovieLike = (UiMovie | MockMovie) & {
  id: string | number; // unify id for routing/keys
};

interface MovieCardProps {
  movie: MovieLike;
  className?: string;
}

const MovieCard = ({ movie, className = "" }: MovieCardProps) => {
  // id may be number or string; use a string for routes/keys
  const idStr = String(movie.id);

  // Allow either absolute URLs or local paths
  const posterSrc =
    typeof movie.poster === "string" && movie.poster.startsWith("http")
      ? movie.poster
      : movie.poster;

  return (
    <div className={`movie-card group ${className} relative overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:rotate-y-2 perspective-1000`}>
      {/* Cyber Glow Border */}
      <div className="absolute inset-0 bg-gradient-cyber opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative overflow-hidden rounded-t-2xl transform-gpu transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
        <img
          src={posterSrc}
          alt={movie.title}
          className="w-full h-64 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-110"
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
          <Link to={`/movie/${idStr}`} className="btn-neon w-full text-center inline-block text-sm">
            Book Now
          </Link>
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
            <span className="font-medium">{movie.releaseYear}</span>
          </div>
          <span className="text-neon-red font-bold">From ${movie.pricing.regular}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
