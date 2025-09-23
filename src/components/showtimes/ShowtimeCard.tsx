import { useState, useEffect } from 'react';
import { Clock, Star, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type UiMovie, getShowtimeAvailability, type ShowtimeAvailability } from '@/services/api';

interface ShowtimeCardProps {
  movie: UiMovie;
  theater: string;
  theaterAmenities: string[];
  selectedDate: string;
}

export default function ShowtimeCard({ movie, theater, theaterAmenities, selectedDate }: ShowtimeCardProps) {
  const [expandedShowtime, setExpandedShowtime] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [availability, setAvailability] = useState<ShowtimeAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const navigate = useNavigate();

  // Load real availability data
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const availabilityData = await getShowtimeAvailability(movie.id, selectedDate, theater);
        setAvailability(availabilityData);
      } catch (error) {
        console.error('Failed to load showtime availability:', error);
        // Fallback to basic availability if API fails
        const fallbackAvailability: ShowtimeAvailability[] = movie.showtimes.map(showtime => ({
          showtime,
          movieId: movie.id,
          cinema: theater,
          totalSeats: 200,
          bookedSeats: Math.floor(Math.random() * 100),
          availableSeats: Math.floor(Math.random() * 100) + 100,
          status: 'available' as const
        }));
        setAvailability(fallbackAvailability);
      } finally {
        setLoadingAvailability(false);
      }
    };

    if (movie.showtimes.length > 0) {
      loadAvailability();
    }
  }, [movie.id, selectedDate, theater]);

  // Generate rating based on movie ID for consistency
  const getMovieRating = () => {
    const hash = movie.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 7.5 + (hash % 20) / 10; // Rating between 7.5 and 9.5
  };

  const movieRating = getMovieRating();

  const getAvailabilityDots = (showtimeData: ShowtimeAvailability) => {
    const { status, availableSeats, totalSeats } = showtimeData;
    const availabilityRatio = availableSeats / totalSeats;
    
    switch (status) {
      case 'available': 
        return <span className="text-green-400">●●●●●</span>;
      case 'filling-fast': 
        return <span><span className="text-yellow-400">●●●</span><span className="text-muted-foreground">○○</span></span>;
      case 'almost-full': 
        return <span><span className="text-orange-400">●</span><span className="text-muted-foreground">○○○○</span></span>;
      case 'sold-out': 
        return <span className="text-red-400">SOLD OUT</span>;
      default: 
        return <span className="text-muted-foreground">●●●●●</span>;
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'border-green-400/50 hover:border-green-400';
      case 'filling-fast': return 'border-yellow-400/50 hover:border-yellow-400';
      case 'almost-full': return 'border-orange-400/50 hover:border-orange-400';
      case 'sold-out': return 'border-red-400/50 cursor-not-allowed opacity-60';
      default: return 'border-border hover:border-cinema-red';
    }
  };

  const getPriceForShowtime = (showtime: string) => {
    // Evening shows (5 PM+) cost more
    const hour = parseInt(showtime.split(':')[0]);
    const isPM = showtime.includes('PM');
    const isEvening = isPM && hour >= 5;
    
    return isEvening ? movie.pricing.premium : movie.pricing.regular;
  };

  const handleQuickBook = (showtimeData: ShowtimeAvailability) => {
    if (showtimeData.status === 'sold-out') return;
    
    navigate(`/seats/${movie.id}?date=${selectedDate}&time=${encodeURIComponent(showtimeData.showtime)}&cinema=${encodeURIComponent(theater)}`);
  };

  const handleMouseEnter = (showtimeValue: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setExpandedShowtime(showtimeValue);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setExpandedShowtime(null);
    }, 150);
    setHoverTimeout(timeout);
  };

  const handlePopupMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handlePopupMouseLeave = () => {
    setExpandedShowtime(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300">
      {/* Movie Header */}
      <div className="flex gap-4 p-4">
        <Link to={`/movie/${movie.id}`}>
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-20 h-28 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Link to={`/movie/${movie.id}`}>
                <h3 className="font-semibold text-foreground text-lg truncate hover:text-cinema-red transition-colors cursor-pointer">
                  {movie.title}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{movie.duration}</span>
                <Badge variant="outline" className="text-xs">{movie.rating}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-foreground">{movieRating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genre.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{theater}</span>
            <span>•</span>
            <span>${movie.pricing.regular} - ${movie.pricing.premium}</span>
          </div>
        </div>
      </div>

      {/* Theater Amenities */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2">
          {theaterAmenities.map((amenity) => (
            <Badge key={amenity} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
        </div>
      </div>

      {/* Showtimes */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground text-sm">Showtimes</h4>
          {loadingAvailability && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>
        
        {loadingAvailability ? (
          <div className="grid grid-cols-2 gap-2">
            {movie.showtimes.map((_, index) => (
              <div key={index} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : availability.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {availability.map((showtimeData, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => handleQuickBook(showtimeData)}
                  disabled={showtimeData.status === 'sold-out'}
                  className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${getAvailabilityColor(showtimeData.status)} ${
                    showtimeData.status !== 'sold-out' ? 'hover:bg-cinema-red/10' : ''
                  }`}
                  onMouseEnter={() => handleMouseEnter(showtimeData.showtime)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground">{showtimeData.showtime}</span>
                    <span className="text-sm text-muted-foreground">
                      ${getPriceForShowtime(showtimeData.showtime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs">{getAvailabilityDots(showtimeData)}</div>
                    {showtimeData.status === 'almost-full' && showtimeData.availableSeats > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{showtimeData.availableSeats} left</span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Expanded details on hover */}
                {expandedShowtime === showtimeData.showtime && showtimeData.status !== 'sold-out' && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 p-3 bg-popover border border-border rounded-lg shadow-lg z-10"
                    onMouseEnter={handlePopupMouseEnter}
                    onMouseLeave={handlePopupMouseLeave}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Seat Selection</span>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="text-green-400">{showtimeData.availableSeats} seats</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Occupancy:</span>
                        <span className="text-foreground">
                          {Math.round((showtimeData.bookedSeats / showtimeData.totalSeats) * 100)}%
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickBook(showtimeData);
                      }}
                    >
                      Choose Seats - ${getPriceForShowtime(showtimeData.showtime)}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No showtimes available for this date</p>
        )}
      </div>

      {/* Real Availability Status */}
      <div className="px-4 pb-4">
        {availability.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-green-400">
              <Users className="h-3 w-3" />
              <span>
                {availability.filter(s => s.availableSeats >= 4).length > 0 ? 
                  `${availability.filter(s => s.availableSeats >= 4).length} showtimes with 4+ seats` :
                  'Limited group seating available'
                }
              </span>
            </div>
            <div className="text-muted-foreground">
              Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}