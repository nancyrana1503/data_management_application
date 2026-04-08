require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Sequelize = require("sequelize");
const clientSessions = require("client-sessions");

const app = express();

// Global middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.use(clientSessions({
  cookieName: "session",
  secret: process.env.SESSION_SECRET,
  duration: 30 * 60 * 1000
}));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// PostgreSQL
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

sequelize.authenticate()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.log(err));

// models
const User = require("./models/user");
const Task = require("./models/task")(sequelize);

sequelize.sync();

// Routes
app.get("/", (req, res) => {
  res.send("Server is working");
});
app.use("/", require("./routes/auth")(User));
app.use("/", require("./routes/task")(Task));

// Start
module.exports = app;