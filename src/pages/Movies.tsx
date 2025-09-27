import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import MovieCard from "../components/MovieCard";
import ComingSoonMovieCard from "../components/ComingSoonMovieCard";
import { getMovies, type UiMovie } from "../services/api";
import { useSearch } from "../contexts/SearchContext";

const Movies = () => {
  const [movies, setMovies] = useState<UiMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { searchTerm, selectedGenre, setSearchTerm, setSelectedGenre } = useSearch();

  // fetch from backend
  useEffect(() => {
    (async () => {
      try {
        const data = await getMovies(false); // all movies
        setMovies(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load movies");
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  // filter by search + genre
  const filteredMovies = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return movies.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(term) ||
        (m.director || "").toLowerCase().includes(term) ||
        (m.cast || []).some((a) => a.toLowerCase().includes(term));

      const matchesGenre = selectedGenre === "All" || m.genre.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });
  }, [movies, searchTerm, selectedGenre]);

  if (loading) return <div className="min-h-screen py-16 text-center">Loading movies…</div>;
  if (error)   return <div className="min-h-screen py-16 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">All Movies</h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Discover your next favorite movie from our extensive collection
          </p>
        </div>

        {/* Quick Actions */}
        {(searchTerm || selectedGenre !== "All") && (
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {searchTerm && (
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
                  <Search className="h-4 w-4 text-foreground-secondary" />
                  <span className="text-sm text-foreground-secondary">Search: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-cinema-red hover:text-cinema-red/80 ml-2"
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedGenre !== "All" && (
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
                  <span className="text-sm text-foreground-secondary">Genre: {selectedGenre}</span>
                  <button
                    onClick={() => setSelectedGenre("All")}
                    className="text-cinema-red hover:text-cinema-red/80 ml-2"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedGenre("All");
              }}
              className="text-sm text-foreground-secondary hover:text-cinema-red transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <p className="text-foreground-secondary">
            Showing {filteredMovies.length} of {movies.length} movies
            {selectedGenre !== "All" && ` in ${selectedGenre}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie, index) => {
            const isComingSoon = movie.status === 'coming-soon' && movie.releaseDate && new Date(movie.releaseDate) > new Date();
            
            return (
              <div
                key={movie.id} // <-- UiMovie.id (string from Mongo _id)
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isComingSoon ? (
                  <ComingSoonMovieCard 
                    movie={movie} 
                    onReminderSet={() => setRefreshKey(prev => prev + 1)} 
                  />
                ) : (
                  <MovieCard movie={movie} />
                )}
              </div>
            );
          })}
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
                  setSearchTerm("");
                  setSelectedGenre("All");
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
