import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentUser, getMyReminders, cancelReminder } from '../services/api';
import { useToast } from '../hooks/use-toast';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
}

interface ActiveReminder {
  movieId: number;
  movieTitle: string;
  releaseDate: string;
  timeRemaining: TimeRemaining | null;
}

const NavbarCountdown = () => {
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  const calculateTimeRemaining = (releaseDate: string): TimeRemaining | null => {
    const now = new Date().getTime();
    const target = new Date(releaseDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return null;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const totalHours = Math.floor(difference / (1000 * 60 * 60));

    return { days, hours, minutes, seconds, totalHours };
  };

  const loadActiveReminder = async () => {
    try {
      if (currentUser) {
        // Load from server for logged-in users
        const reminders = await getMyReminders();
        const futureReminders = reminders.filter(r => 
          r.status === 'active' && new Date(r.releaseDate) > new Date()
        );
        
        if (futureReminders.length > 0) {
          // Get the nearest upcoming reminder
          const nearest = futureReminders.sort((a, b) => 
            new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
          )[0];
          
          const timeRemaining = calculateTimeRemaining(nearest.releaseDate);
          setActiveReminder({
            movieId: nearest.movieId,
            movieTitle: nearest.movieTitle,
            releaseDate: nearest.releaseDate,
            timeRemaining
          });
          setIsVisible(true);
        } else {
          setActiveReminder(null);
          setIsVisible(false);
        }
      } else {
        // Load from localStorage for anonymous users
        const localReminders = JSON.parse(localStorage.getItem('movieReminders') || '[]');
        const futureReminders = localReminders.filter((r: any) => 
          new Date(r.releaseDate) > new Date()
        );
        
        if (futureReminders.length > 0) {
          const nearest = futureReminders.sort((a: any, b: any) => 
            new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
          )[0];
          
          const timeRemaining = calculateTimeRemaining(nearest.releaseDate);
          setActiveReminder({
            movieId: nearest.movieId,
            movieTitle: nearest.movieTitle,
            releaseDate: nearest.releaseDate,
            timeRemaining
          });
          setIsVisible(true);
        } else {
          setActiveReminder(null);
          setIsVisible(false);
        }
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const handleClearReminder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!activeReminder) return;

    try {
      if (currentUser) {
        await cancelReminder(activeReminder.movieId);
      } else {
        // Remove from localStorage
        const localReminders = JSON.parse(localStorage.getItem('movieReminders') || '[]');
        const filteredReminders = localReminders.filter((r: any) => r.movieId !== activeReminder.movieId);
        localStorage.setItem('movieReminders', JSON.stringify(filteredReminders));
      }
      
      setActiveReminder(null);
      setIsVisible(false);
      
      toast({
        title: "Reminder cleared",
        description: `Reminder for ${activeReminder.movieTitle} has been removed.`
      });
    } catch (error: any) {
      toast({
        title: "Failed to clear reminder",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadActiveReminder();
  }, [currentUser]);

  useEffect(() => {
    if (!activeReminder) return;

    const interval = setInterval(() => {
      const timeRemaining = calculateTimeRemaining(activeReminder.releaseDate);
      
      if (!timeRemaining) {
        // Movie has been released
        toast({
          title: `${activeReminder.movieTitle} is now released!`,
          description: "The movie you've been waiting for is now available."
        });
        setActiveReminder(null);
        setIsVisible(false);
        loadActiveReminder(); // Reload to get next reminder if any
      } else {
        setActiveReminder(prev => prev ? { ...prev, timeRemaining } : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReminder, toast]);

  if (!isVisible || !activeReminder || !activeReminder.timeRemaining) {
    return null;
  }

  const { timeRemaining } = activeReminder;
  const formatTime = (time: TimeRemaining): string => {
    if (time.days > 0) {
      return `${time.days}d • ${time.hours}h • ${time.minutes}m`;
    } else if (time.hours > 0) {
      return `${time.hours}h • ${time.minutes}m • ${time.seconds}s`;
    } else {
      return `${time.minutes}m • ${time.seconds}s`;
    }
  };

  return (
    <Link 
      to={`/movie/${activeReminder.movieId}`}
      className="hidden lg:flex items-center gap-2 bg-cinema-red/10 hover:bg-cinema-red/20 border border-cinema-red/30 rounded-full px-3 py-1.5 text-sm transition-colors group"
    >
      <Clock className="h-3 w-3 text-cinema-red" />
      <span className="text-cinema-red font-medium">
        {formatTime(timeRemaining)}
      </span>
      <button
        onClick={handleClearReminder}
        className="ml-1 p-0.5 hover:bg-cinema-red/20 rounded-full transition-colors"
        aria-label="Clear reminder"
      >
        <X className="h-3 w-3 text-cinema-red/70 hover:text-cinema-red" />
      </button>
    </Link>
  );
};

export default NavbarCountdown;