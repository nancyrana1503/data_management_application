
require("dotenv").config();
require("pg");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Sequelize = require("sequelize");
const clientSessions = require("client-sessions");

const app = express();

app.set("views", path.resolve("./views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(clientSessions({
  cookieName: "session",
  secret: process.env.SESSION_SECRET,
  duration: 30 * 60 * 1000
}));

// PostgreSQL setup
const sequelize = new Sequelize(process.env.PG_URI, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    // MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // PostgreSQL
    await sequelize.authenticate();
    console.log("PostgreSQL connected");

    isConnected = true;
  } catch (err) {
    console.error("DB connection error:", err);
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Models
const User = require("./models/user");
const Task = require("./models/task")(sequelize);

// Routes
app.use("/", require("./routes/auth")(User));
app.use("/", require("./routes/task")(Task));

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/test", (req, res) => {
  res.send("WORKING ✅");
});

module.exports = app;

