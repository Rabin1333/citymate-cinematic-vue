import { useState, useEffect } from 'react';
import { Calendar, Mail, Phone, Download, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { createReminder, getUserProfile, getCurrentUser } from '../services/api';
import {
  downloadIcsFile,
  generateGoogleCalendarUrl,
  createMovieReleaseEvent,
  formatDateForTimezone,
} from '../utils/calendar';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    id: string;           // <-- FIX: ObjectId is a string
    title: string;
    releaseDate: string;  // can be ISO or parseable string
  };
  onReminderSet?: () => void;
}

const ReminderModal = ({ isOpen, onClose, movie, onReminderSet }: ReminderModalProps) => {
  const [channels, setChannels] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  const currentUser = getCurrentUser();
  const isLoggedIn = !!currentUser;

  // Load user profile data
  useEffect(() => {
    if (isLoggedIn && isOpen) {
      getUserProfile()
        .then((profile) => {
          setUserProfile(profile);
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
        })
        .catch((err) => {
          console.error('Failed to load profile:', err);
        });
    }
  }, [isLoggedIn, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setChannels([]);
      setLoading(false);
    }
  }, [isOpen]);

  const handleChannelChange = (channel: string, checked: boolean) => {
    setChannels((prev) => (checked ? [...prev, channel] : prev.filter((c) => c !== channel)));
  };

  const validateForm = () => {
    if (channels.length === 0) {
      toast({
        title: 'Select a reminder method',
        description: 'Please select at least one way to be reminded (Email or SMS).',
        variant: 'destructive',
      });
      return false;
    }

    if (channels.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        toast({
          title: 'Invalid email',
          description: 'Please enter a valid email address.',
          variant: 'destructive',
        });
        return false;
      }
    }

    if (channels.includes('sms')) {
      const phoneRegex = /^[+]?[\d\s\-()]{6,16}$/;
      const normalized = phone.replace(/[\s\-()]/g, '');
      if (!phone || !phoneRegex.test(phone) || normalized.length < 6) {
        toast({
          title: 'Invalid phone number',
          description: 'Please enter a valid phone number.',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleSaveReminder = async () => {
    if (!validateForm()) return;

    // Normalize releaseDate to ISO (string)
    const releaseISO = new Date(movie.releaseDate).toISOString();
    const timezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'Australia/Sydney';

    if (!releaseISO || !movie.id) {
      toast({
        title: 'Missing movie or release date',
        description: 'Please check the movie and date and try again.',
        variant: 'destructive',
      });
      return;
    }

    // Anonymous users: save local reminder
    if (!isLoggedIn) {
      const localReminders = JSON.parse(localStorage.getItem('movieReminders') || '[]');
      const newReminder = {
        movieId: movie.id,       // <-- FIX: send string id
        movieTitle: movie.title,
        releaseDate: releaseISO, // <-- FIX: send ISO
        channels,
        email: channels.includes('email') ? email : undefined,
        phone: channels.includes('sms') ? phone : undefined,
        timezone,
        createdAt: new Date().toISOString(),
      };

      // Remove existing reminder for this movie if any
      const filteredReminders = localReminders.filter((r: any) => r.movieId !== movie.id);
      filteredReminders.push(newReminder);
      localStorage.setItem('movieReminders', JSON.stringify(filteredReminders));

      toast({
        title: 'Reminder set!',
        description: 'Your local reminder has been saved. Sign in to sync across devices.',
      });

      onReminderSet?.();
      onClose();
      return;
    }

    // Logged-in users: send to API
    setLoading(true);
    try {
      const reminderData = {
        movieId: movie.id,         // <-- FIX: no parseInt
        movieTitle: movie.title,
        releaseDate: releaseISO,   // <-- FIX: ISO string
        channels,                  // string[]
        ...(channels.includes('email') && { email }),
        ...(channels.includes('sms') && { phone }),
        timezone,
      };

      await createReminder(reminderData);

      toast({
        title: 'Reminder set!',
        description: "You'll be notified when this movie is released.",
      });

      onReminderSet?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to create reminder:', error);
      toast({
        title: 'Failed to set reminder',
        description: error?.message || 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    const dateObj = new Date(movie.releaseDate);
    const calendarEvent = createMovieReleaseEvent(
      movie.title,
      dateObj,
      window.location.origin + `/movie/${movie.id}`,
    );

    downloadIcsFile(
      calendarEvent,
      `${movie.title.replace(/[^a-zA-Z0-9]/g, '-')}-release.ics`,
    );

    toast({
      title: 'Calendar file downloaded',
      description: 'The .ics file has been downloaded. You can import it to your calendar app.',
    });
  };

  const handleGoogleCalendar = () => {
    const dateObj = new Date(movie.releaseDate);
    const calendarEvent = createMovieReleaseEvent(
      movie.title,
      dateObj,
      window.location.origin + `/movie/${movie.id}`,
    );
    const googleUrl = generateGoogleCalendarUrl(calendarEvent);
    window.open(googleUrl, '_blank');
  };

  const formattedDate = formatDateForTimezone(new Date(movie.releaseDate));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-cinema-red" />
            Set a reminder for {movie.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Release Date Display */}
          <div className="bg-muted p-3 rounded-lg">
            <Label className="text-sm font-medium text-muted-foreground">Release Date</Label>
            <p className="text-foreground font-medium">{formattedDate}</p>
          </div>

          {/* Reminder Channels */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">How would you like to be reminded?</Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={channels.includes('email')}
                  onCheckedChange={(checked) =>
                    handleChannelChange('email', Boolean(checked))
                  }
                />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Email me
                </Label>
              </div>

              {channels.includes('email') && (
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ml-6"
                />
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={channels.includes('sms')}
                  onCheckedChange={(checked) =>
                    handleChannelChange('sms', Boolean(checked))
                  }
                />
                <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                  <Phone className="h-4 w-4" />
                  Text me (SMS)
                </Label>
              </div>

              {channels.includes('sms') && (
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="ml-6"
                />
              )}
            </div>
          </div>

          {/* Calendar Options */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-medium">Add to Calendar</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToCalendar}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download .ics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoogleCalendar}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Google Calendar
              </Button>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 Sign in to sync your reminders across devices and get email/SMS notifications.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSaveReminder} disabled={loading} className="flex-1">
            {loading ? 'Saving...' : 'Save Reminder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;
