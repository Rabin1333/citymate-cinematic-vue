// server/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI missing");
    const dbName = process.env.MONGODB_DB || undefined;
    await mongoose.connect(uri, { dbName });

    // ——— Minimal schemas just for seeding ———
    const MovieSchema = new mongoose.Schema({
      title: String,
      genre: [String],
      rating: String,
      duration: String,
      releaseYear: String,
      poster: String,
      synopsis: String,
      director: String,
      cast: [String],
      showtimes: [String], // matches your UI (e.g., "2:30 PM")
      pricing: {
        regular: Number,
        premium: Number,
        vip: Number,
      },
      status: { type: String, enum: ["now-showing", "coming-soon"], default: "now-showing" },
      featured: Boolean,
      releaseDate: String, // ISO string (or date as string for UI compatibility)
    });

    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      passwordHash: String,
      role: { type: String, enum: ["admin", "user"], default: "user" },
      createdAt: { type: Date, default: Date.now },
    });

    const BookingSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      movieId: mongoose.Schema.Types.ObjectId,
      showtime: String,
      seats: [String],
      createdAt: { type: Date, default: Date.now },
    });

    const Movie = mongoose.model("Movie", MovieSchema);
    const User = mongoose.model("User", UserSchema);
    const Booking = mongoose.model("Booking", BookingSchema);

    // ——— Clean old data (safe for dev) ———
    await Promise.all([Movie.deleteMany({}), User.deleteMany({}), Booking.deleteMany({})]);

    // Helper
    const times = ["11:00 AM", "2:30 PM", "6:15 PM", "9:00 PM"];

    const today = new Date();
    const plusDays = (d) => {
      const x = new Date(today);
      x.setDate(x.getDate() + d);
      return x.toISOString();
    };

    // ——— 8–10 movies (2 upcoming) ———
    const movies = [
      {
        title: "The Dark Knight",
        genre: ["Action", "Crime", "Drama"],
        rating: "PG-13",
        duration: "152 min",
        releaseYear: "2008",
        poster: "/posters/the-dark-knight.jpg",
        synopsis:
          "Batman faces the Joker, who brings chaos to Gotham.",
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
        showtimes: times,
        pricing: { regular: 14, premium: 18, vip: 22 },
        status: "now-showing",
      },
      {
        title: "Inception",
        genre: ["Action", "Sci-Fi", "Thriller"],
        rating: "PG-13",
        duration: "148 min",
        releaseYear: "2010",
        poster: "/posters/inception.jpg",
        synopsis:
          "A thief who steals corporate secrets through dream-sharing.",
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
        showtimes: times,
        pricing: { regular: 14, premium: 18, vip: 22 },
        status: "now-showing",
      },
      {
        title: "Interstellar",
        genre: ["Adventure", "Drama", "Sci-Fi"],
        rating: "PG-13",
        duration: "169 min",
        releaseYear: "2014",
        poster: "/posters/interstellar.jpg",
        synopsis: "Explorers travel through a wormhole in space.",
        director: "Christopher Nolan",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        showtimes: times,
        pricing: { regular: 14, premium: 18, vip: 22 },
        status: "now-showing",
      },
      {
        title: "Avatar",
        genre: ["Action", "Adventure", "Fantasy"],
        rating: "PG-13",
        duration: "162 min",
        releaseYear: "2009",
        poster: "/posters/avatar.jpg",
        synopsis: "A marine on an alien planet torn between duty and conscience.",
        director: "James Cameron",
        cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
        showtimes: times,
        pricing: { regular: 14, premium: 18, vip: 22 },
        status: "now-showing",
      },
      {
        title: "Parasite",
        genre: ["Comedy", "Drama", "Thriller"],
        rating: "R",
        duration: "132 min",
        releaseYear: "2019",
        poster: "/posters/parasite.jpg",
        synopsis: "A poor family schemes to become employed by a wealthy family.",
        director: "Bong Joon-ho",
        cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
        showtimes: times,
        pricing: { regular: 14, premium: 18, vip: 22 },
        status: "now-showing",
      },
      {
        title: "Dune",
        genre: ["Adventure", "Drama", "Sci-Fi"],
        rating: "PG-13",
        duration: "155 min",
        releaseYear: "2021",
        poster: "/posters/dune.jpg",
        synopsis: "Paul Atreides leads nomads against galactic emperor.",
        director: "Denis Villeneuve",
        cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac"],
        showtimes: times,
        pricing: { regular: 14, premium: 18, vip: 22 },
        status: "now-showing",
      },
      // Upcoming (future dates for countdown)
      {
        title: "City Mate: The Premiere",
        genre: ["Drama"],
        rating: "PG",
        duration: "120 min",
        releaseYear: "2025",
        poster: "/posters/city-mate.jpg",
        synopsis: "A heartwarming tale of community cinema.",
        director: "R. Basnet",
        cast: ["A. Singh", "B. Mishra"],
        showtimes: [], // not yet
        pricing: { regular: 16, premium: 20, vip: 24 },
        status: "coming-soon",
        releaseDate: plusDays(14), // 2 weeks ahead
      },
      {
        title: "Future Noir",
        genre: ["Sci-Fi", "Thriller"],
        rating: "M",
        duration: "130 min",
        releaseYear: "2026",
        poster: "/posters/future-noir.jpg",
        synopsis: "A detective hunts truth across parallel timelines.",
        director: "J. Doe",
        cast: ["TBD"],
        showtimes: [],
        pricing: { regular: 16, premium: 20, vip: 24 },
        status: "coming-soon",
        releaseDate: plusDays(30), // 1 month ahead
      },
    ];

    const insertedMovies = await Movie.insertMany(movies);

    // Users
    const adminPass = await bcrypt.hash("Admin#12345", 10);
    const userPass = await bcrypt.hash("User#12345", 10);

    await User.insertMany([
      { name: "Admin", email: "admin@citymate.local", passwordHash: adminPass, role: "admin" },
      { name: "Test User", email: "user@citymate.local", passwordHash: userPass, role: "user" },
    ]);

    console.log(`✅ Seed complete: ${insertedMovies.length} movies, 2 users, 0 bookings`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
})();
