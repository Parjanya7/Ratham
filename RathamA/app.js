//Module Dependencies
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const { updateCompletedSessionsAndSlots } = require('./crons/updateCompletedSessionsAndSlots.cron');

//Defining an express instance
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

//Importing Routes
require('./routes')(app);

//Global Error Handler
app.use(function (err, req, res, next) {
  res.status(400).json({
    message: 'An Error has occured',
    error: err.message
  });
});

//Cron Jobs
updateCompletedSessionsAndSlots();

module.exports = app;
