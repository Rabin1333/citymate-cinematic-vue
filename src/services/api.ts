// src/services/api.ts
// Base URL comes from Vite env; fallback for local dev.
export const BASE =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

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
  releaseDate?: string; // ISO string
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

/** ----------------- Movies / Showtimes ----------------- **/
export async function getMovies(upcoming = false): Promise<UiMovie[]> {
  const res = await fetch(`${BASE}/api/movies${upcoming ? "?upcoming=true" : ""}`);
  if (!res.ok) throw new Error(`Failed to fetch movies (${res.status})`);
  const data: ApiMovie[] = await res.json();
  return data.map(toUiMovie);
}

// Optional helper if you later add GET /api/movies/:id
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

/** ----------------- Auth ----------------- **/
export type LoginResponse = {
  token: string;
  user: { _id: string; name: string; email: string; role: "admin" | "user" };
};

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

export function getCurrentUser():
  | LoginResponse["user"]
  | null {
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
  showtime: string; // e.g. "2:30 PM" or ISO if you change later
  seats: string[];  // ["A1","A2"]
  cinema?: string;  // optional
};

export async function createBooking(
  token: string, 
  payload: CreateBookingBody
): Promise<{ _id: string }> {
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