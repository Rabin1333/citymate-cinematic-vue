import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

// Support both mock and API movie shapes
import type { Movie as MockMovie } from "../data/movies";
import type { UiMovie } from "../services/api";

type MovieLike = (UiMovie | MockMovie) & { id: string | number };

interface MovieSectionProps {
  title: string;
  movies: MovieLike[];
  viewAllLink?: string;
}

const MovieSection = ({ title, movies, viewAllLink }: MovieSectionProps) => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">{title}</h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-2 text-cinema-red hover:text-cinema-red-hover transition-colors font-medium"
            >
              View All
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie, index) => (
            <div
              key={String(movie.id)} // works for string or number
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {movies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground-secondary text-lg">
              No movies available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieSection;
