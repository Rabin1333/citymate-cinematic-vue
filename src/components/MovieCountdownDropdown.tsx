import { useState, useEffect } from 'react';
import { Timer, Bell, BellRing, Calendar, Film, Star, Play, ExternalLink, Filter, ChevronDown, Clock } from 'lucide-react';
import { comingSoonMovies } from '@/data/movies';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
}

interface MovieCountdown {
  movieId: number;
  title: string;
  poster: string;
  releaseDate: string;
  genre: string[];
  rating: number;
  releaseType: 'new' | 'rerelease' | 'special';
  preOrderCount: number;
  timeRemaining: TimeRemaining;
}

const MovieCountdownDropdown = () => {
  const [movieCountdowns, setMovieCountdowns] = useState<MovieCountdown[]>([]);
  const [reminders, setReminders] = useState<Set<number>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'week' | 'month' | 'all'>('month');
  const [sortBy, setSortBy] = useState<'date' | 'anticipated'>('date');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      
      const countdowns = comingSoonMovies.map(movie => {
        const releaseDate = movie.releaseDate ? new Date(movie.releaseDate).getTime() : now + (7 * 24 * 60 * 60 * 1000);
        const difference = releaseDate - now;

        let timeRemaining: TimeRemaining = { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
        
        if (difference > 0) {
          const totalHours = Math.floor(difference / (1000 * 60 * 60));
          timeRemaining = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
            totalHours
          };
        } else {
          // Movie is now available
          if (reminders.has(movie.id)) {
            showNotification(movie.title);
            setReminders(prev => {
              const newSet = new Set(prev);
              newSet.delete(movie.id);
              return newSet;
            });
          }
        }

        return {
          movieId: movie.id,
          title: movie.title,
          poster: movie.poster,
          releaseDate: movie.releaseDate || '',
          genre: typeof movie.genre === 'string' ? [movie.genre] : movie.genre,
          rating: typeof movie.rating === 'number' ? movie.rating : 4.2,
          releaseType: 'new' as const,
          preOrderCount: Math.floor(Math.random() * 500) + 100,
          timeRemaining
        };
      }).filter(countdown => 
        countdown.timeRemaining.days > 0 || 
        countdown.timeRemaining.hours > 0 || 
        countdown.timeRemaining.minutes > 0 || 
        countdown.timeRemaining.seconds > 0
      );

      setMovieCountdowns(countdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [reminders]);

  const showNotification = (movieTitle: string) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${movieTitle} is now available!`, {
        body: 'You can now book tickets for this movie.',
        icon: '/favicon.ico'
      });
    }
    
    // In-app notification (you could integrate with toast here)
    console.log(`🎬 ${movieTitle} is now available for booking!`);
  };

  const toggleReminder = async (movieId: number, movieTitle: string) => {
    if (!reminders.has(movieId)) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Please enable notifications to receive movie reminders!');
          return;
        }
      }
      
      setReminders(prev => new Set([...prev, movieId]));
      console.log(`Reminder set for ${movieTitle}`);
    } else {
      setReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
      console.log(`Reminder removed for ${movieTitle}`);
    }
  };

  const formatTimeRemaining = (time: TimeRemaining) => {
    const { days, hours, minutes, seconds, totalHours } = time;
    
    if (days > 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return `${months}mo ${remainingDays}d`;
    } else if (days > 7) {
      return `${days}d ${hours}h`;
    } else if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (totalHours > 1) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  const getReleaseIcon = (type: string) => {
    switch (type) {
      case 'new': return '🎬';
      case 'rerelease': return '🔄';
      case 'special': return '⭐';
      default: return '🎬';
    }
  };

  const getFilteredMovies = () => {
    let filtered = movieCountdowns;
    
    // Filter by time period
    const now = Date.now();
    switch (activeFilter) {
      case 'week':
        filtered = filtered.filter(movie => movie.timeRemaining.days <= 7);
        break;
      case 'month':
        filtered = filtered.filter(movie => movie.timeRemaining.days <= 30);
        break;
      // 'all' shows everything
    }
    
    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => a.timeRemaining.totalHours - b.timeRemaining.totalHours);
    } else {
      filtered.sort((a, b) => b.preOrderCount - a.preOrderCount);
    }
    
    return filtered;
  };

  if (movieCountdowns.length === 0) {
    return null;
  }

  const filteredMovies = getFilteredMovies();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-foreground-secondary hover:text-primary hover:bg-primary/10 transition-all duration-200 flex items-center space-x-1 px-2"
        >
          <Film className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
          {movieCountdowns.length > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-1 bg-primary text-primary-foreground text-xs h-5 px-1.5"
            >
              {movieCountdowns.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-96 bg-background/95 backdrop-blur-lg border shadow-2xl"
        sideOffset={8}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Film className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Upcoming Releases</h3>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week" className="text-xs">This Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs">This Month</TabsTrigger>
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort Options */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sort by:</span>
            </div>
            <div className="flex space-x-1">
              <Button
                variant={sortBy === 'date' ? 'secondary' : 'ghost'}
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => setSortBy('date')}
              >
                Release Date
              </Button>
              <Button
                variant={sortBy === 'anticipated' ? 'secondary' : 'ghost'}
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => setSortBy('anticipated')}
              >
                Most Anticipated
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator />
          
          {/* Movie List */}
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-3">
                  <div className="flex space-x-3">
                    <Skeleton className="w-10 h-15 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </Card>
              ))
            ) : filteredMovies.length === 0 ? (
              <div className="text-center py-8">
                <Timer className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming movies for this period</p>
              </div>
            ) : (
              filteredMovies.map((countdown) => (
                <Card 
                  key={countdown.movieId} 
                  className="p-3 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex space-x-3">
                    {/* Movie Poster */}
                    <div className="relative">
                      <img 
                        src={countdown.poster} 
                        alt={countdown.title}
                        className="w-10 h-15 object-cover rounded border"
                      />
                      <div className="absolute -top-1 -right-1 text-xs">
                        {getReleaseIcon(countdown.releaseType)}
                      </div>
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {countdown.title}
                          </h4>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            {countdown.genre.slice(0, 2).map((genre, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                {genre}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{countdown.rating}/5</span>
                            </div>
                            <span>•</span>
                            <span>{countdown.preOrderCount} interested</span>
                          </div>

                          {countdown.releaseDate && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(countdown.releaseDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Countdown Timer */}
                      <div className={`mt-2 px-2 py-1 rounded text-xs font-mono font-semibold ${
                        countdown.timeRemaining.totalHours < 24 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : countdown.timeRemaining.totalHours < 168 
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTimeRemaining(countdown.timeRemaining)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <Play className="h-3 w-3 mr-1" />
                            Trailer
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            More Info
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleReminder(countdown.movieId, countdown.title)}
                        >
                          {reminders.has(countdown.movieId) ? (
                            <BellRing className="h-3 w-3 text-primary" />
                          ) : (
                            <Bell className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          <DropdownMenuSeparator className="my-3" />
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Click <Bell className="h-3 w-3 inline mx-1" /> to get notified when tickets are available
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs">
              View All Upcoming Movies
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MovieCountdownDropdown;