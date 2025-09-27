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
    <section className="relative h-[120vh] flex items-center justify-center overflow-hidden bg-space-gradient">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-30" />
      
      {/* Video Background */}
      <div className="absolute inset-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="https://vimeo.com/videos/external/236294943/hd/236294943.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-space-black/95 via-space-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-space-black/90 via-transparent to-transparent" />
      </div>
      
      {/* Floating Neon Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-red rounded-full animate-float opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-neon-blue rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-neon-purple rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Movie Info */}
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-neon-red rounded-full w-3 h-3 animate-neon-pulse"></div>
                <span className="text-neon-red font-bold uppercase tracking-wider text-sm bg-neon-red/10 px-3 py-1 rounded-full border border-neon-red/30">
                  Now Featured
                </span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-black text-white mb-6 leading-tight text-neon-glow">
                {currentMovie.title}
              </h1>
              <div className="flex items-center gap-6 mb-6 flex-wrap">
                <span className="tag-neon">
                  ★ {currentMovie.rating}
                </span>
                <span className="text-foreground-secondary flex items-center gap-2 bg-space-gray/50 px-3 py-1 rounded-lg border border-cyber-border/50">
                  <Clock className="h-4 w-4" />
                  {currentMovie.duration}
                </span>
                <div className="flex gap-2">
                  {currentMovie.genre.slice(0, 2).map((genre) => (
                    <span key={genre} className="tag-neon text-xs">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-xl text-foreground-secondary mb-10 leading-relaxed max-w-2xl">
              {currentMovie.synopsis}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-10">
              <Link
                to={`/movie/${currentMovie.id}`}
                className="btn-neon group flex items-center justify-center gap-3 text-lg px-10 py-5 animate-slide-in-right"
              >
                <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Book Now - ${currentMovie.pricing.regular}</span>
              </Link>
              <button className="btn-cinema-outline flex items-center justify-center gap-2 px-8 py-5">
                <span>Watch Trailer</span>
              </button>
            </div>

            {/* Movie Indicators */}
            <div className="flex gap-3">
              {featuredMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMovieIndex(index)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === currentMovieIndex 
                      ? 'w-16 bg-neon-red shadow-neon' 
                      : 'w-8 bg-cyber-border hover:bg-neon-red/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Movie Poster */}
          <div className="relative animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              {/* Neon Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-neon opacity-20 blur-xl rounded-3xl group-hover:opacity-40 transition-opacity duration-500" />
              
              <img
                src={currentMovie.poster}
                alt={currentMovie.title}
                className="relative w-full max-w-md mx-auto rounded-3xl border-2 border-neon-red/30 transform transition-all duration-500 group-hover:scale-105 group-hover:border-neon-red/60"
                style={{ boxShadow: '0 0 50px rgba(255, 51, 51, 0.3)' }}
              />
              
              {/* Cyberpunk Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-space-black/80 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Floating Info Cards */}
              <div className="absolute top-6 -right-6 bg-space-gray/90 backdrop-blur-lg rounded-xl p-4 border border-neon-red/50 animate-float">
                <div className="text-center">
                  <div className="text-3xl font-black text-neon-red animate-neon-pulse">★ 4.8</div>
                  <div className="text-xs text-foreground-secondary font-medium">Rating</div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-space-gray/90 backdrop-blur-lg rounded-xl p-4 border border-neon-blue/50 animate-float" style={{ animationDelay: '1s' }}>
                <div className="text-center">
                  <div className="text-2xl font-black text-neon-blue">{currentMovie.showtimes.length}</div>
                  <div className="text-xs text-foreground-secondary font-medium">Showtimes</div>
                </div>
              </div>
              
              {/* Scan Line Effect */}
              <div className="absolute inset-0 bg-gradient-cyber opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-cyber-scan rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-space-black via-space-black/60 to-transparent" />
    </section>
  );
};

export default HeroSection;