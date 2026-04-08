require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  res.send("App is running 🚀");
});

// exporting for Vercel
module.exports = app;
module.exports.handler = serverless(app);