const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.get("/", (req, res) => {
  res.send("FINAL CLEAN TEST 🚀");
});

module.exports = serverless(app);