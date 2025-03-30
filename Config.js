const express_ = require("express");
const app = express_();
const bodyparser = require("body-parser");
const helmet = require("helmet");
var cors = require("cors");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const mongoose = require("mongoose");
require("dotenv").config();

// const uri = 'mongodb+srv://susalabs:susalabs@cluster0.xn0yck9.mongodb.net/?retryWrites=true&w=majority';
const uri = process.env.MONGO_URI || process;

exports.connectToDatabase = async () => {
  try {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB is connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
