// src/services/api.ts - COMPLETE VERSION WITH ALL FEATURES
export const BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

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

/** ----------------- Bookings ----------------- **/
export type CreateBookingBody = {
  movieId: string;
  showtime: string;
  seats: string[];
  cinema?: string;
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