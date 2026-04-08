require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const serverless = require("serverless-http");
const app = require("../server"); // 👈 import your existing app

module.exports = serverless(app);

// exporting for Vercel
module.exports = app;
module.exports.handler = serverless(app);