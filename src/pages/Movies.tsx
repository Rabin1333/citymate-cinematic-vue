import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { movies } from '../data/movies';

const Movies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Get all unique genres
  const genres = useMemo(() => {
    const allGenres = movies.flatMap(movie => movie.genre);
    return ['All', ...Array.from(new Set(allGenres))];
  }, []);

  // Filter movies based on search and genre
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movie.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
      
      return matchesSearch && matchesGenre;
    });
  }, [searchTerm, selectedGenre]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            All Movies
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Discover your next favorite movie from our extensive collection
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="Search movies, directors, or actors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-cinema pl-12 w-full text-lg py-4"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-foreground-secondary" />
              <span className="text-foreground-secondary font-medium">Filter by Genre:</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedGenre === genre
                    ? 'bg-cinema-red text-white shadow-button'
                    : 'bg-card text-foreground-secondary hover:bg-cinema-red/20 hover:text-cinema-red border border-border'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-foreground-secondary">
            Showing {filteredMovies.length} of {movies.length} movies
            {selectedGenre !== 'All' && ` in ${selectedGenre}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMovies.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-card rounded-2xl p-8 max-w-md mx-auto">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No movies found</h3>
              <p className="text-foreground-secondary mb-4">
                Try adjusting your search terms or selected genre
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGenre('All');
                }}
                className="btn-cinema-outline"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;