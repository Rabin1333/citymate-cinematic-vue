import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { movies } from '@/data/movies';
import MovieCard from '@/components/MovieCard';

const Showtimes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Generate next 7 days
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      };
    });
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => 
      movie.status === 'now-showing' &&
      (movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
       movie.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Movie Showtimes</h1>
          <p className="text-foreground-secondary max-w-2xl mx-auto">
            Check showtimes for all movies currently playing in theaters
          </p>
        </div>

        {/* Date Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Select Date</h2>
          <div className="flex flex-wrap gap-2">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDate === date.value
                    ? 'bg-cinema-red text-white'
                    : 'bg-cinema-brown/20 text-foreground hover:bg-cinema-brown/30'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-cinema pl-10 w-full"
            />
          </div>
        </div>

        {/* Movies Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Showing {filteredMovies.length} movies
            </h2>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => (
                <div key={movie.id} className="space-y-4">
                  <MovieCard movie={movie} />
                  
                  {/* Showtime buttons */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground text-sm">Showtimes:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {movie.showtimes.map((time, index) => (
                        <button
                          key={index}
                          className="px-3 py-2 text-sm bg-cinema-brown/20 text-foreground rounded-lg hover:bg-cinema-red hover:text-white transition-colors"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground-secondary text-lg mb-4">No movies found</p>
              <button
                onClick={() => setSearchTerm('')}
                className="btn-primary"
              >
                Show All Movies
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Showtimes;