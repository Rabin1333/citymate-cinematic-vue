import { format, subDays, subWeeks, subMonths } from 'date-fns';

// Environment flag to toggle between mock and real APIs
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

// Data Types
export interface OverviewStats {
  ticketsSold: number;
  seatsBooked: number;
  uniqueCustomers: number;
  grossRevenue: number;
  netRevenue: number;
  cancellations: number;
  refunds: number;
  averageTicketPrice: number;
  averageOccupancyRate: number;
}

export interface MovieStats {
  movieId: number;
  movieTitle: string;
  ticketsSold: number;
  revenue: number;
  occupancyRate: number;
}

export interface ShowtimeStats {
  id: number;
  date: string;
  time: string;
  movie: string;
  screen: string;
  ticketsSold: number;
  totalSeats: number;
  occupancyRate: number;
  revenue: number;
}

export interface TimeSeriesData {
  date: string;
  ticketsSold: number;
  revenue: number;
}

export interface RecentActivity {
  id: number;
  timestamp: string;
  type: 'Booking' | 'Refund' | 'Cancel';
  userEmail: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface UtilizationData {
  screen: string;
  cinema: string;
  averageOccupancy: number;
  totalShows: number;
  totalRevenue: number;
}

export interface AnalyticsFilters {
  dateRange: { from: Date; to: Date };
  granularity: 'day' | 'week' | 'month';
  movieIds?: number[];
}

// Mock Data Generators
const generateRandomStats = (): OverviewStats => ({
  ticketsSold: Math.floor(Math.random() * 5000) + 1000,
  seatsBooked: Math.floor(Math.random() * 6000) + 1200,
  uniqueCustomers: Math.floor(Math.random() * 2000) + 500,
  grossRevenue: Math.floor(Math.random() * 100000) + 20000,
  netRevenue: Math.floor(Math.random() * 80000) + 15000,
  cancellations: Math.floor(Math.random() * 200) + 50,
  refunds: Math.floor(Math.random() * 5000) + 1000,
  averageTicketPrice: Math.floor(Math.random() * 10) + 15,
  averageOccupancyRate: Math.floor(Math.random() * 30) + 60,
});

const generateMovieStats = (): MovieStats[] => {
  const movies = [
    'Dune', 'The Dark Knight', 'Inception', 'Parasite', 
    'Spider-Man: No Way Home', 'The Grand Budapest Hotel'
  ];
  
  return movies.map((movie, index) => ({
    movieId: index + 1,
    movieTitle: movie,
    ticketsSold: Math.floor(Math.random() * 1000) + 200,
    revenue: Math.floor(Math.random() * 20000) + 5000,
    occupancyRate: Math.floor(Math.random() * 40) + 50,
  }));
};

const generateShowtimeStats = (): ShowtimeStats[] => {
  const movies = ['Dune', 'The Dark Knight', 'Inception', 'Parasite'];
  const screens = ['Screen 1', 'Screen 2', 'Screen 3', 'IMAX'];
  const times = ['14:00', '17:30', '20:45', '23:15'];
  
  return Array.from({ length: 20 }, (_, index) => {
    const ticketsSold = Math.floor(Math.random() * 200) + 50;
    const totalSeats = 250;
    
    return {
      id: index + 1,
      date: format(subDays(new Date(), Math.floor(Math.random() * 7)), 'yyyy-MM-dd'),
      time: times[Math.floor(Math.random() * times.length)],
      movie: movies[Math.floor(Math.random() * movies.length)],
      screen: screens[Math.floor(Math.random() * screens.length)],
      ticketsSold,
      totalSeats,
      occupancyRate: Math.round((ticketsSold / totalSeats) * 100),
      revenue: ticketsSold * (Math.floor(Math.random() * 10) + 15),
    };
  });
};

const generateTimeSeries = (filters: AnalyticsFilters): TimeSeriesData[] => {
  const { dateRange, granularity } = filters;
  const data: TimeSeriesData[] = [];
  
  let current = new Date(dateRange.from);
  while (current <= dateRange.to) {
    data.push({
      date: format(current, 'yyyy-MM-dd'),
      ticketsSold: Math.floor(Math.random() * 500) + 100,
      revenue: Math.floor(Math.random() * 10000) + 2000,
    });
    
    if (granularity === 'day') {
      current = subDays(current, -1);
    } else if (granularity === 'week') {
      current = subWeeks(current, -1);
    } else {
      current = subMonths(current, -1);
    }
  }
  
  return data;
};

const generateRecentActivity = (): RecentActivity[] => {
  const types: RecentActivity['type'][] = ['Booking', 'Refund', 'Cancel'];
  const statuses: RecentActivity['status'][] = ['Completed', 'Pending', 'Failed'];
  
  return Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    timestamp: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd HH:mm:ss'),
    type: types[Math.floor(Math.random() * types.length)],
    userEmail: `user${index + 1}@example.com`,
    amount: Math.floor(Math.random() * 200) + 20,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

const generateUtilizationData = (): UtilizationData[] => {
  const screens = ['Screen 1', 'Screen 2', 'Screen 3', 'IMAX', 'Premium 1', 'Premium 2'];
  const cinemas = ['City Center', 'Mall Complex', 'Downtown'];
  
  return screens.map((screen, index) => ({
    screen,
    cinema: cinemas[Math.floor(Math.random() * cinemas.length)],
    averageOccupancy: Math.floor(Math.random() * 40) + 50,
    totalShows: Math.floor(Math.random() * 50) + 20,
    totalRevenue: Math.floor(Math.random() * 50000) + 10000,
  }));
};

// Mock delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Services
export const analyticsService = {
  // Overview Stats
  async getOverviewStats(filters: AnalyticsFilters): Promise<OverviewStats> {
    if (USE_MOCKS) {
      await delay(800);
      // Simulate occasional failure
      if (Math.random() < 0.1) {
        throw new Error('Failed to fetch overview stats');
      }
      return generateRandomStats();
    }
    
    // Future HTTP endpoint: /api/admin/stats/overview?from&to
    throw new Error('HTTP endpoints not implemented yet');
  },

  // Movie Stats
  async getMovieStats(filters: AnalyticsFilters): Promise<MovieStats[]> {
    if (USE_MOCKS) {
      await delay(600);
      return generateMovieStats();
    }
    
    // Future HTTP endpoint: /api/admin/stats/by-movie?from&to&limit
    throw new Error('HTTP endpoints not implemented yet');
  },

  // Showtime Stats
  async getShowtimeStats(filters: AnalyticsFilters): Promise<ShowtimeStats[]> {
    if (USE_MOCKS) {
      await delay(700);
      return generateShowtimeStats();
    }
    
    // Future HTTP endpoint: /api/admin/stats/by-showtime?movieId&from&to
    throw new Error('HTTP endpoints not implemented yet');
  },

  // Time Series Data
  async getTimeSeriesData(filters: AnalyticsFilters): Promise<TimeSeriesData[]> {
    if (USE_MOCKS) {
      await delay(900);
      return generateTimeSeries(filters);
    }
    
    // Future HTTP endpoint: /api/admin/stats/timeseries?granularity&from&to
    throw new Error('HTTP endpoints not implemented yet');
  },

  // Recent Activity
  async getRecentActivity(limit: number = 20): Promise<RecentActivity[]> {
    if (USE_MOCKS) {
      await delay(500);
      return generateRecentActivity().slice(0, limit);
    }
    
    // Future HTTP endpoint: /api/admin/stats/recent-activity?limit
    throw new Error('HTTP endpoints not implemented yet');
  },

  // Utilization Data
  async getUtilizationData(filters: AnalyticsFilters): Promise<UtilizationData[]> {
    if (USE_MOCKS) {
      await delay(650);
      return generateUtilizationData();
    }
    
    // Future HTTP endpoint: /api/admin/stats/utilization?from&to
    throw new Error('HTTP endpoints not implemented yet');
  },

  // CSV Export
  async exportCSV(filters: AnalyticsFilters, type: 'bookings' | 'revenue' | 'utilization'): Promise<string> {
    if (USE_MOCKS) {
      await delay(1000);
      
      if (type === 'bookings') {
        const showtimes = await this.getShowtimeStats(filters);
        return this.generateBookingsCSV(showtimes);
      } else if (type === 'revenue') {
        const timeSeries = await this.getTimeSeriesData(filters);
        return this.generateRevenueCSV(timeSeries);
      } else {
        const utilization = await this.getUtilizationData(filters);
        return this.generateUtilizationCSV(utilization);
      }
    }
    
    // Future HTTP endpoint: /api/admin/stats/export.csv?from&to&type=bookings|revenue|utilization
    throw new Error('HTTP endpoints not implemented yet');
  },

  // CSV Generators
  generateBookingsCSV(data: ShowtimeStats[]): string {
    const headers = ['Date', 'Time', 'Movie', 'Screen', 'Tickets Sold', 'Total Seats', 'Occupancy %', 'Revenue (AUD)'];
    const rows = data.map(row => [
      row.date,
      row.time,
      row.movie,
      row.screen,
      row.ticketsSold.toString(),
      row.totalSeats.toString(),
      `${row.occupancyRate}%`,
      `$${row.revenue.toLocaleString()}`
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },

  generateRevenueCSV(data: TimeSeriesData[]): string {
    const headers = ['Date', 'Tickets Sold', 'Revenue (AUD)'];
    const rows = data.map(row => [
      row.date,
      row.ticketsSold.toString(),
      `$${row.revenue.toLocaleString()}`
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },

  generateUtilizationCSV(data: UtilizationData[]): string {
    const headers = ['Screen', 'Cinema', 'Average Occupancy %', 'Total Shows', 'Total Revenue (AUD)'];
    const rows = data.map(row => [
      row.screen,
      row.cinema,
      `${row.averageOccupancy}%`,
      row.totalShows.toString(),
      `$${row.totalRevenue.toLocaleString()}`
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
};