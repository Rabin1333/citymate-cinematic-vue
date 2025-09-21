// server/src/middleware/auth.js
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const token = auth.split(" ")[1];
    const secret = process.env.JWT_SECRET || "devsecret";

    const payload = jwt.verify(token, secret);
    // Your login code signs: { _id, name, role }
    const id = (payload._id || payload.id || payload.userId || "").toString();

    if (!id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      id,
      name: payload.name,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error("requireAuth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
