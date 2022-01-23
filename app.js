const config = require("./utils/config");
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
app.use(express.static("build"));
var bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");
const itemRouter = require("./controllers/item");
const resetRouter = require("./controllers/reset");
const subscriptionsRouter = require("./controllers/subscriptions");
const path = require("path");

const url = config.MONGODB_URI;

console.log("connecting to ", url);

mongoose.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);

app.use(middleware.tokenExtractor);
app.use(middleware.userExtractor);

app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/items", itemRouter);
app.use("/api/subscriptions", subscriptionsRouter);
if (config.NODE_ENV === "test") {
  app.use("/api/reset", resetRouter);
}
if (config.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/build/index.html"));
  });
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
