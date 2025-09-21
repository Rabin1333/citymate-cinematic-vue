// server/src/db.js
require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env");

  // Optional: allow selecting DB name via env
  const dbName = process.env.MONGODB_DB || undefined;

  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB error:", err.message);
  });

  await mongoose.connect(uri, { dbName });
}

module.exports = { connectDB };
