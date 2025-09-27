import { useState, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import ComingSoonMovieCard from "./ComingSoonMovieCard";

// Support both mock and API movie shapes
import type { Movie as MockMovie } from "../data/movies";
import type { UiMovie } from "../services/api";

type MovieLike = (UiMovie | MockMovie) & { id: string | number };

interface MovieSectionProps {
  title: string;
  movies: MovieLike[];
  viewAllLink?: string;
  onReminderSet?: () => void;
}

const MovieSection = ({ title, movies, viewAllLink, onReminderSet }: MovieSectionProps) => {
  const isComingSoonSection = title.toLowerCase().includes('coming soon');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <section className="py-20 bg-space-gradient relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-cyber-grid opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-2 text-neon-glow">
              {title}
            </h2>
            <div className="w-20 h-1 bg-gradient-neon rounded-full" />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Carousel Navigation */}
            {movies.length > 4 && (
              <div className="flex gap-2">
                <button
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className="p-3 rounded-full bg-space-gray border border-cyber-border text-foreground-secondary hover:text-neon-red hover:border-neon-red/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className="p-3 rounded-full bg-space-gray border border-cyber-border text-foreground-secondary hover:text-neon-red hover:border-neon-red/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
            
            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="nav-link flex items-center gap-2 text-foreground-secondary hover:text-neon-red transition-colors font-semibold px-4 py-2 border border-cyber-border rounded-lg hover:border-neon-red/50"
              >
                View All
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <div
              key={String(movie.id)}
              className="flex-none w-80 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {isComingSoonSection ? (
                <ComingSoonMovieCard movie={movie} onReminderSet={onReminderSet} />
              ) : (
                <MovieCard movie={movie} />
              )}
            </div>
          ))}
        </div>

        {movies.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-space-gray/50 border border-cyber-border/50 rounded-2xl p-12 max-w-md mx-auto">
              <p className="text-foreground-secondary text-lg mb-4">
                No movies available at the moment.
              </p>
              <div className="w-16 h-1 bg-neon-red/30 rounded-full mx-auto" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieSection;
