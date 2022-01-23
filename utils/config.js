require("dotenv").config();

const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const PORT = process.env.PORT;

const NODE_ENV = process.env.NODE_ENV;

module.exports = { MONGODB_URI, PORT, NODE_ENV };
