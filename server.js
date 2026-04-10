
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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(clientSessions({
  cookieName: "session",
  secret: process.env.SESSION_SECRET,
  duration: 30 * 60 * 1000
}));

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
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

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

const User = require("./models/user");
const Task = require("./models/task")(sequelize);

app.use("/", require("./routes/auth")(User));
app.use("/", require("./routes/task")(Task));

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/test", (req, res) => {
  res.send("Working");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
