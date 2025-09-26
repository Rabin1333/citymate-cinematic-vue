// src/services/api.ts - COMPLETE VERSION WITH ALL FEATURES
const getApiBase = () => {
  // Try environment variable first, then fallback to window location for production
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // In development, use localhost:4000
  if (import.meta.env.DEV) return "http://localhost:4000";
  
  // In production, construct from window.location
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

export const BASE = getApiBase();

/** ----------------- Movie types ----------------- **/
export interface ApiMovie {
  _id: string;
  title: string;
  genre: string[];
  rating: string;
  duration: string;
  releaseYear: string;
  poster: string;
  synopsis: string;
  director: string;
  cast: string[];
  showtimes: string[];
  pricing: { regular: number; premium: number; vip: number };
  status: "now-showing" | "coming-soon";
  featured?: boolean;
  releaseDate?: string;
}

export type UiMovie = Omit<ApiMovie, "_id"> & { id: string };

export const toUiMovie = (m: ApiMovie): UiMovie => ({
  id: m._id,
  title: m.title,
  genre: m.genre,
  rating: m.rating,
  duration: m.duration,
  releaseYear: m.releaseYear,
  poster: m.poster,
  synopsis: m.synopsis,
  director: m.director,
  cast: m.cast,
  showtimes: m.showtimes,
  pricing: m.pricing,
  status: m.status,
  featured: m.featured,
  releaseDate: m.releaseDate,
});

/** ----------------- User Profile types ----------------- **/
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  memberSince: string;
  role: "admin" | "user";
  preferences?: {
    notifications: {
      bookingConfirmations: boolean;
      promotions: boolean;
      newReleases: boolean;
      reminders: boolean;
    };
    privacy: {
      profileVisibility: "public" | "friends" | "private";
      shareBookingHistory: boolean;
      allowRecommendations: boolean;
    };
    language: string;
    region: string;
    theme: string;
    currency: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/** ----------------- Booking types ----------------- **/
export interface ApiBooking {
  _id: string;
  userId: string;
  movieId: string;
  showtime: string;
  cinema: string;
  seats: string[];
  status: "confirmed" | "cancelled" | "pending" | "completed";
  bookingReference: string;
  createdAt: string;
  updatedAt: string;
  movieTitle?: string;
  moviePoster?: string;
  totalAmount?: number;
  date?: string;
  screen?: string;
}

export type UiBooking = ApiBooking & {
  movieTitle: string;
  moviePoster: string;
  totalAmount: number;
  date: string;
  screen: string;
};

/** ----------------- Movies / Showtimes ----------------- **/
export async function getMovies(upcoming = false): Promise<UiMovie[]> {
  const res = await fetch(`${BASE}/api/movies${upcoming ? "?upcoming=true" : ""}`);
  if (!res.ok) throw new Error(`Failed to fetch movies (${res.status})`);
  const data: ApiMovie[] = await res.json();
  return data.map(toUiMovie);
}

export async function getMovieById(id: string): Promise<UiMovie> {
  const res = await fetch(`${BASE}/api/movies/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch movie (${res.status})`);
  const data: ApiMovie = await res.json();
  return toUiMovie(data);
}

export async function getShowtimes(movieId: string): Promise<{ movieId: string; title?: string; showtimes: string[] }> {
  const res = await fetch(`${BASE}/api/showtimes?movieId=${encodeURIComponent(movieId)}`);
  if (!res.ok) throw new Error(`Failed to fetch showtimes (${res.status})`);
  return res.json();
}

/** ----------------- User Profile Management ----------------- **/
export async function getUserProfile(): Promise<UserProfile> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch user profile (${res.status})`);
  return res.json();
}

export async function updateUserProfile(data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to update profile (${res.status})`);
  }

  return res.json();
}

export async function changeUserPassword(data: ChangePasswordData): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to change password (${res.status})`);
  }

  return res.json();
}

export async function updateUserSettings(settings: UserProfile['preferences']): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to update settings (${res.status})`);
  }

  return res.json();
}

export async function deleteUserAccount(): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to delete account (${res.status})`);
  }

  return res.json();
}

/** ----------------- User Bookings Management ----------------- **/
export async function getUserBookings(): Promise<UiBooking[]> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch user bookings (${res.status})`);
  return res.json();
}

export async function cancelUserBooking(bookingId: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/bookings/${bookingId}/cancel`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to cancel booking (${res.status})`);
  }

  return res.json();
}

export async function downloadTicket(bookingId: string): Promise<Blob> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/bookings/${bookingId}/ticket`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download ticket (${res.status})`);
  }

  return res.blob();
}

export async function emailTicket(bookingId: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/user/bookings/${bookingId}/email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to email ticket (${res.status})`);
  }

  return res.json();
}

/** ----------------- Real-time Booking Statistics ----------------- **/
export interface BookingStats {
  totalToday?: number;
  totalThisWeek?: number;
  popularMovies?: { movieId: string; title: string; bookingCount: number }[];
  popularShowtimes?: { showtime: string; bookingCount: number }[];
  theaterOccupancy?: { cinema: string; occupancyRate: number }[];
  
  // Analytics page fields
  totalRevenue: number;
  totalTickets: number;
  averageOccupancy: number;
  uniqueVisitors: number;
  genreStats: Array<{ genre: string; tickets: number; revenue: number }>;
  timeStats: Array<{ hour: string; bookings: number }>;
  weeklyStats: Array<{ day: string; attendance: number }>;
}

export async function getBookingStats(dateRange?: { from: string; to: string }): Promise<BookingStats> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');
  
  const params = new URLSearchParams();
  if (dateRange) {
    params.append('from', dateRange.from);
    params.append('to', dateRange.to);
  }
  
  const res = await fetch(`${BASE}/api/bookings/stats?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch booking stats (${res.status})`);
  return res.json();
}

/** ----------------- Movies by Date/Theater ----------------- **/
export interface MoviesByDate {
  date: string;
  movies: UiMovie[];
  totalShowtimes: number;
}

export async function getMoviesByDate(date: string): Promise<MoviesByDate> {
  const res = await fetch(`${BASE}/api/movies/by-date/${encodeURIComponent(date)}`);
  if (!res.ok) throw new Error(`Failed to fetch movies for date (${res.status})`);
  const data = await res.json();
  return {
    ...data,
    movies: data.movies.map(toUiMovie)
  };
}

/** ----------------- Static Theater Data ----------------- **/
export const THEATERS = [
  {
    id: 'downtown',
    name: 'Downtown Cinema',
    amenities: ['IMAX', 'Parking', 'Dining'],
    address: '123 Main St, Downtown',
    capacity: 250
  },
  {
    id: 'mall',
    name: 'Mall Cinema',
    amenities: ['Standard', 'Food Court'],
    address: '456 Mall Ave, Shopping District',
    capacity: 180
  },
  {
    id: 'luxury',
    name: 'Luxury Theater',
    amenities: ['VIP', 'Recliner', 'Bar'],
    address: '789 Luxury Blvd, Uptown',
    capacity: 120
  },
  {
    id: 'imax',
    name: 'IMAX Theater',
    amenities: ['IMAX', 'Dolby Atmos'],
    address: '321 Tech Park, Innovation District',
    capacity: 300
  }
];

export function getTheaters() {
  return THEATERS;
}

export function getTheaterById(id: string) {
  return THEATERS.find(theater => theater.id === id);
}

/** ----------------- Enhanced Showtime Utilities ----------------- **/
export interface ShowtimeAvailability {
  showtime: string;
  movieId: string;
  cinema: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  status: 'available' | 'filling-fast' | 'almost-full' | 'sold-out';
}

export async function getShowtimeAvailability(
  movieId: string,
  date: string,
  cinema?: string
): Promise<ShowtimeAvailability[]> {
  const params = new URLSearchParams({ movieId, date });
  if (cinema) params.append('cinema', cinema);

  const res = await fetch(`${BASE}/api/showtimes/availability?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch showtime availability (${res.status})`);
  return res.json();
}

/** ----------------- Auth ----------------- **/
export type LoginResponse = {
  token: string;
  user: { _id: string; name: string; email: string; role: "admin" | "user" };
};

export async function register(name: string, email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Registration failed (${res.status})`);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed (${res.status})`);
  return res.json();
}

export function saveAuth(token: string, user: LoginResponse["user"]) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getCurrentUser(): LoginResponse["user"] | null {
  const raw = localStorage.getItem("user");
  try {
    return raw ? (JSON.parse(raw) as LoginResponse["user"]) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/** ----------------- Food Items ----------------- **/
export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "snacks" | "drinks" | "combos";
  image: string;
  available: boolean;
}

export interface FoodOrderItem {
  itemId: string;
  quantity: number;
  price: number;
}

export async function getFoodItems(): Promise<FoodItem[]> {
  const res = await fetch(`${BASE}/api/food`);
  if (!res.ok) throw new Error(`Failed to fetch food items (${res.status})`);
  return res.json();
}

/** ----------------- Bookings ----------------- **/
export type CreateBookingBody = {
  movieId: string;
  showtime: string;
  seats: string[];
  cinema?: string;
  foodItems?: FoodOrderItem[];
};

export async function createBooking(token: string, payload: CreateBookingBody): Promise<{ _id: string }> {
  const res = await fetch(`${BASE}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Booking failed (${res.status})`);
  return res.json();
}

export async function getBookingById(bookingId: string): Promise<any> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/bookings/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch booking (${res.status})`);
  return res.json();
}

/** ----------------- Admin Movie Management ----------------- **/
export type CreateMovieBody = {
  title: string;
  genre: string[];
  rating: string;
  duration: string;
  releaseYear: string;
  poster?: string;
  synopsis?: string;
  director?: string;
  cast?: string[];
  showtimes?: string[];
  pricing?: { regular: number; premium: number; vip: number };
  status?: "now-showing" | "coming-soon";
  featured?: boolean;
  releaseDate?: string;
};

export async function createMovie(token: string, movieData: CreateMovieBody): Promise<{ message: string; movie: ApiMovie }> {
  const res = await fetch(`${BASE}/api/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movieData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to create movie (${res.status})`);
  }

  return res.json();
}

export async function updateMovie(token: string, movieId: string, movieData: CreateMovieBody): Promise<{ message: string; movie: ApiMovie }> {
  const res = await fetch(`${BASE}/api/movies/${movieId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movieData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to update movie (${res.status})`);
  }

  return res.json();
}

export async function deleteMovie(token: string, movieId: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/movies/${movieId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to delete movie (${res.status})`);
  }

  return res.json();
}

/** ----------------- Admin Theater Management ----------------- **/
export type Theater = {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  totalBookings?: number;
  occupancyRate?: number;
};

export async function getAdminTheaters(): Promise<Theater[]> {
  const res = await fetch(`${BASE}/api/theaters`);
  if (!res.ok) throw new Error(`Failed to fetch theaters (${res.status})`);
  return res.json();
}
export async function createTheater(token: string, theater: Omit<Theater, '_id'>): Promise<Theater> {
  const res = await fetch(`${BASE}/api/theaters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(theater),
  });
  if (!res.ok) throw new Error(`Failed to create theater (${res.status})`);
  return res.json();
}

export async function updateTheater(token: string, id: string, theater: Partial<Theater>): Promise<Theater> {
  const res = await fetch(`${BASE}/api/theaters/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(theater),
  });
  if (!res.ok) throw new Error(`Failed to update theater (${res.status})`);
  return res.json();
}

export async function deleteTheater(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/theaters/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to delete theater (${res.status})`);
}

/** ----------------- Analytics & Reports ----------------- **/
export async function getAnalytics(token: string, type: 'overview' | 'demographics' | 'trends'): Promise<any> {
  const res = await fetch(`${BASE}/api/analytics?type=${type}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch analytics (${res.status})`);
  return res.json();
}

/** ----------------- Rewards System ----------------- **/
export interface Reward {
  type: string;
  value: string;
  details: string;
  status: 'issued' | 'claimed' | 'expired';
  expiryDate: string;
  createdAt?: string;
  bookingId?: {
    bookingReference: string;
    movieId: {
      title: string;
      poster: string;
    };
    showtime: string;
    cinema: string;
    createdAt: string;
  };
}

export async function spinReward(bookingId: string): Promise<{ success: boolean; reward: Reward }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/rewards/spin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to spin reward (${res.status})`);
  }

  return res.json();
}

export async function getRewardByBookingId(bookingId: string): Promise<Reward | null> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/rewards/by-booking/${bookingId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    return null; // No reward found
  }

  if (!res.ok) throw new Error(`Failed to fetch reward (${res.status})`);
  return res.json();
}

export async function getMyRewards(status?: 'issued' | 'claimed' | 'expired'): Promise<Reward[]> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const res = await fetch(`${BASE}/api/rewards/mine?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch user rewards (${res.status})`);
  return res.json();
}

// Reviews
export interface Review {
  _id: string;
  userId: { _id: string; name: string };
  movieId: { _id: string; title: string };
  bookingId?: string;
  rating: number;
  comment: string;
  status: "published" | "flagged" | "removed";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function createReview(movieId: string, bookingId: string | null, rating: number, comment: string): Promise<{ message: string; review: Review }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ movieId, bookingId, rating, comment })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create review");
  }

  return res.json();
}

export async function updateReview(reviewId: string, rating: number, comment: string): Promise<{ message: string; review: Review }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update review");
  }

  return res.json();
}

export async function deleteReview(reviewId: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete review");
  }

  return res.json();
}

export async function getMovieReviews(movieId: string, page = 1, pageSize = 10, sort = "recent"): Promise<{ reviews: Review[]; pagination: any }> {
  const url = new URL(`${BASE}/api/reviews`);
  url.searchParams.append("movieId", movieId);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("pageSize", pageSize.toString());
  url.searchParams.append("sort", sort);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error("Failed to fetch movie reviews");
  }

  return res.json();
}

export async function getUserReviews(page = 1, pageSize = 10): Promise<{ reviews: Review[]; pagination: any }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const url = new URL(`${BASE}/api/reviews/my`);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("pageSize", pageSize.toString());

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user reviews");
  }

  return res.json();
}

// Reminders API
export interface Reminder {
  _id: string;
  userId: string;
  movieId: number;
  movieTitle: string;
  releaseDate: string;
  channels: string[];
  email?: string;
  phone?: string;
  timezone: string;
  status: 'active' | 'sent' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export async function createReminder(reminderData: {
  movieId: number;
  movieTitle: string;
  releaseDate: string;
  channels: string[];
  email?: string;
  phone?: string;
  timezone?: string;
}): Promise<{ message: string; reminder: Reminder }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/reminders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reminderData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create reminder');
  }

  return res.json();
}

export async function getMyReminders(): Promise<Reminder[]> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/reminders/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch reminders');
  }

  return res.json();
}

export async function cancelReminder(movieId: number): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/reminders/${movieId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to cancel reminder');
  }

  return res.json();
}

/** ----------------- Parking Integration ----------------- **/
export interface ParkingLot {
  lotId: string;
  name: string;
  location: string;
  available: number;
  capacity: number;
  priceHint: string;
}

export interface ParkingReservation {
  reservationId: string;
  lotName: string;
  location: string;
  startTime: string;
  endTime: string;
  price: number;
  holdExpiresAt: string;
}

export async function getParkingLots(cinemaId: string, showtimeISO: string): Promise<ParkingLot[]> {
  const params = new URLSearchParams({ cinemaId, showtime: showtimeISO });
  const res = await fetch(`${BASE}/api/parking/lots?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch parking lots (${res.status})`);
  return res.json();
}

export async function holdParking(
  bookingId: string, 
  lotId: string, 
  startISO: string, 
  endISO: string
): Promise<ParkingReservation> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/parking/reservations/hold`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bookingId,
      lotId,
      startTime: startISO,
      endTime: endISO
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to hold parking (${res.status})`);
  }

  return res.json();
}

export async function confirmParking(reservationId: string, bookingId: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/parking/reservations/${reservationId}/confirm`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to confirm parking (${res.status})`);
  }

  return res.json();
}

export async function releaseParking(reservationId: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/parking/reservations/${reservationId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to release parking (${res.status})`);
  }

  return res.json();
}

/** ----------------- Auditorium Previews ----------------- **/
export interface AuditoriumPreview {
  zoneId: string;
  url360: string;
  description: string;
}

export async function getAuditoriumPreviews(auditoriumId: string): Promise<AuditoriumPreview[]> {
  const res = await fetch(`${BASE}/api/auditoriums/${encodeURIComponent(auditoriumId)}/previews`);
  if (!res.ok) {
    if (res.status === 404) {
      return []; // Return empty array if auditorium not found
    }
    throw new Error(`Failed to fetch auditorium previews (${res.status})`);
  }
  return res.json();
}

/** ----------------- Predictions System ----------------- **/
export interface Prediction {
  _id: string;
  predictionText: string;
  createdAt: string;
  updatedAt: string;
  isWinner: boolean;
  movieId?: {
    _id: string;
    title: string;
    poster: string;
    status: string;
    releaseDate?: string;
  };
  rewardId?: {
    rewardType: string;
    rewardValue: string;
    rewardDetails: string;
    status: string;
  };
}

export interface PredictionStats {
  totalPredictions: number;
  winningPredictions: number;
  recentPredictions: number;
  winRate: string;
}

export async function createPrediction(movieId: string, predictionText: string): Promise<{ message: string; prediction: Prediction }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/predictions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ movieId, predictionText }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to create prediction (${res.status})`);
  }

  return res.json();
}

export async function getMyPredictions(page = 1, limit = 10): Promise<{ predictions: Prediction[]; pagination: any }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  const res = await fetch(`${BASE}/api/predictions/my?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user predictions (${res.status})`);
  }

  return res.json();
}

export async function getMoviePredictions(movieId: string, page = 1, limit = 20): Promise<{ predictions: any[]; pagination: any }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  const res = await fetch(`${BASE}/api/predictions/movie/${movieId}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch movie predictions (${res.status})`);
  }

  return res.json();
}

export async function markPredictionWinner(predictionId: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/predictions/${predictionId}/winner`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to mark prediction as winner (${res.status})`);
  }

  return res.json();
}

export async function deletePrediction(predictionId: string): Promise<{ message: string }> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/predictions/${predictionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || `Failed to delete prediction (${res.status})`);
  }

  return res.json();
}

export async function getPredictionStats(): Promise<PredictionStats> {
  const token = getToken();
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${BASE}/api/predictions/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch prediction statistics (${res.status})`);
  }

  return res.json();
}