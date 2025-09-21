// server/src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");

const app = express();

// ——— Middleware ———
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// ——— Health check ———
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ——— Routers ———
const moviesRouter = require("./routes/movies");
const showtimesRouter = require("./routes/showtimes");
const authRouter = require("./routes/auth");
const bookingsRouter = require("./routes/bookings");

app.use("/api/movies", moviesRouter);
app.use("/api/showtimes", showtimesRouter);
app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingsRouter);

// ——— Start server ———
const PORT = process.env.PORT || 4000;
connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 API running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
