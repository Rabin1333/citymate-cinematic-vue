// src/utils/calendar.ts

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  url?: string;
}

// Generate .ics file content
export function generateIcsFile(event: CalendarEvent): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//City Mate Movie//Movie Reminders//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    ...(event.url ? [`URL:${event.url}`] : []),
    `UID:${Date.now()}@citymate-movie.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

// Download .ics file
export function downloadIcsFile(event: CalendarEvent, filename: string = 'movie-reminder.ics'): void {
  const icsContent = generateIcsFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Generate Google Calendar URL
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
    details: event.description,
    ...(event.url && { location: event.url })
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate calendar event for movie release
export function createMovieReleaseEvent(
  movieTitle: string, 
  releaseDate: Date, 
  movieUrl?: string
): CalendarEvent {
  // Set the event to start at the release time and last 30 minutes
  const startDate = new Date(releaseDate);
  const endDate = new Date(releaseDate.getTime() + 30 * 60 * 1000); // 30 minutes later

  return {
    title: `${movieTitle} Release`,
    description: `${movieTitle} is now available! Don't miss the premiere.${movieUrl ? ` More info: ${movieUrl}` : ''}`,
    startDate,
    endDate,
    url: movieUrl
  };
}

// Convert UTC date to user timezone for display
export function formatDateForTimezone(date: Date, timezone: string = 'Australia/Sydney'): string {
  try {
    return new Intl.DateTimeFormat('en-AU', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  } catch (error) {
    // Fallback to local timezone if specified timezone is invalid
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}