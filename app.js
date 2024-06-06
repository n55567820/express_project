const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const indexRouter = require("./routes/index");
const postRouter = require("./routes/posts");
const mongoose = require("mongoose");
const app = express();

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("資料庫連接成功"))
  .catch(() => console.log("資料庫連接失敗"));

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use('/', indexRouter);
app.use("/posts", postRouter);

module.exports = app;
