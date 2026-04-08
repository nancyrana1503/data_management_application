require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Sequelize = require("sequelize");
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
  PG_DB: process.env.PG_DB,
  PG_USER: process.env.PG_USER,
  PG_HOST: process.env.PG_HOST,
  SESSION_SECRET: !!process.env.SESSION_SECRET
});

// MongoDB (safe)
try {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.log("❌ Mongo ERROR:", err));
} catch (e) {
  console.log("❌ Mongo crash:", e);
}

// PostgreSQL (safe)
const sequelize = new Sequelize(
  process.env.PG_DB,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

try {
  sequelize.authenticate()
    .then(() => console.log("✅ PostgreSQL connected"))
    .catch(err => console.log("❌ PG ERROR:", err));
} catch (e) {
  console.log("❌ PG crash:", e);
}

// 

// Models
let User, Task;
try {
  User = require("../models/user");
  Task = require("../models/task")(sequelize);
} catch (e) {
  console.log("❌ Model load error:", e);
}

// Test route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// Routes 
try {
  app.use("/", require("../routes/auth")(User));
  app.use("/", require("../routes/task")(Task));
} catch (e) {
  console.log("❌ Route load error:", e);
}

// Export
module.exports = serverless(app);