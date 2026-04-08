require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const clientSessions = require("client-sessions");
const serverless = require("serverless-http");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.use(clientSessions({
  cookieName: "session",
  secret: process.env.SESSION_SECRET,
  duration: 30 * 60 * 1000
}));

// 🔍 ENV DEBUG
console.log("ENV CHECK:", {
  MONGO_URI: !!process.env.MONGO_URI,
  SESSION_SECRET: !!process.env.SESSION_SECRET
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ Mongo ERROR:", err));

// ✅ ONLY Mongo model
let User;
try {
  User = require("../models/user");
} catch (e) {
  console.log("❌ Model load error:", e);
}

// Test route
app.get("/", (req, res) => {
  res.send("API running (no postgres) 🚀");
});

// Routes (only auth for now)
try {
  app.use("/", require("../routes/auth")(User));
} catch (e) {
  console.log("❌ Route load error:", e);
}

// Export
module.exports = serverless(app);