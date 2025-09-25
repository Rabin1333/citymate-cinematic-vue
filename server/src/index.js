// server/src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ——— Mount ALL routers ———
const moviesRouter = require("./routes/movies");
const showtimesRouter = require("./routes/showtimes");
const authRouter = require("./routes/auth");
const bookingsRouter = require("./routes/bookings");
const userRouter = require("./routes/user");          // ADD THIS
const theatersRouter = require("./routes/theaters");  // ADD THIS
const adminRouter = require("./routes/admin");
const rewardsRouter = require("./routes/rewards");    // ADD REWARDS
const reviewsRouter = require("./routes/reviews");
const remindersRouter = require("./routes/reminders");
const foodRouter = require("./routes/food");
const parkingRouter = require("./routes/parking");
const auditoriumsRouter = require("./routes/auditoriums");
const predictionsRouter = require("./routes/predictions");

app.use("/api/movies", moviesRouter);
app.use("/api/showtimes", showtimesRouter);
app.use("/api/auth", authRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/user", userRouter);           // ADD THIS
app.use("/api/theaters", theatersRouter);   // ADD THIS
app.use("/api/admin", adminRouter);
app.use("/api/rewards", rewardsRouter);     // ADD REWARDS
app.use("/api/reviews", reviewsRouter);
app.use("/api/reminders", remindersRouter);
app.use("/api/food", foodRouter);
app.use("/api/parking", parkingRouter);
app.use("/api/auditoriums", auditoriumsRouter);
app.use("/api/predictions", predictionsRouter);

const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 API running on http://localhost:${PORT}`)
  );
}).catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});