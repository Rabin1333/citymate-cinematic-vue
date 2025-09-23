import { Link } from 'react-router-dom';
import { Play, ArrowRight, Search, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMovies, type UiMovie } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

const HeroSection = () => {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredMovies, setFeaturedMovies] = useState<UiMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const movies = await getMovies();
        // Filter for featured movies or take first 3 now-showing movies
        const featured = movies
          .filter(movie => movie.featured || movie.status === 'now-showing')
          .slice(0, 3);
        setFeaturedMovies(featured);
      } catch (err: any) {
        setError(err.message || 'Failed to load movies');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Rotate featured movies every 5 seconds
  useEffect(() => {
    if (featuredMovies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  // Loading state
  if (loading) {
    return (
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/90" />
        <div className="relative z-10 text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cinema-red mx-auto mb-4"></div>
          <p className="text-lg">Loading featured movies...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error || featuredMovies.length === 0) {
    return (
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/90" />
        <div className="relative z-10 text-white text-center">
          <p className="text-lg text-red-400 mb-4">{error || 'No featured movies available'}</p>
          <Button onClick={() => window.location.reload()} className="btn-cinema">
            Retry
          </Button>
        </div>
      </section>
    );
  }

  const currentMovie = featuredMovies[currentMovieIndex];

  return (
    <section className="relative h-[120vh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://vimeo.com/videos/external/236294943/hd/236294943.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Movie Info */}
          <div className="animate-fade-in-up">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-cinema-red rounded-full w-3 h-3"></div>
                <span className="text-cinema-red font-semibold uppercase tracking-wider text-sm">Now Featured</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                {currentMovie.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                  {currentMovie.rating}
                </span>
                <span className="text-white/80 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {currentMovie.duration}
                </span>
                <span className="text-white/80">{currentMovie.genre.join(' • ')}</span>
              </div>
            </div>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {currentMovie.synopsis}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to={`/movie/${currentMovie.id}`}
                className="btn-cinema flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                <Play className="h-5 w-5" />
                Book Now - ${currentMovie.pricing.regular}
              </Link>
              
            </div>

            {/* Movie Indicators */}
            <div className="flex gap-2">
              {featuredMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMovieIndex(index)}
                  className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    index === currentMovieIndex ? 'bg-cinema-red' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Movie Poster */}
          <div className="relative">
            <div className="relative group">
              <img
                src={currentMovie.poster}
                alt={currentMovie.title}
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl transform transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Floating Info Cards */}
              <div className="absolute top-4 -right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-cinema-red/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cinema-red">★ 4.8</div>
                  <div className="text-xs text-white/80">Rating</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-cinema-red/30">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{currentMovie.showtimes.length}</div>
                  <div className="text-xs text-white/80">Showtimes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;