const jwt = require("jsonwebtoken");

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  console.log("dfgsfdg", request.headers);
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7);
  }
  next();
};

const userExtractor = (request, response, next) => {
  const authorization = request.headers.authorization;
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    const token = authorization.substring(7);

    const decodedToken = jwt.verify(token, process.env.SECRET);
    request.user = decodedToken.username;
  }

  next();
};

const errorHandler = (error, request, response, next) => {
  if (error.name === "ValidationError") {
    console.log(error.message);
    return response.status(400).send({ error: error.message });
  }
  if (error.name === "TokenExpiredError") {
    console.log(error.message);
    return response.status(401).send({ error: error.message });
  }
  if (error.name === "TypeError") {
    console.log(error.message);
    return response.status(500).send({ error: error.message });
  }
  if (error.name === "CastError") {
    console.log(error.message);
    return response.status(400).send({ error: error.message });
  }
  if (error.name === "MongooseServerSelectionError") {
    console.log(error.message);
    return response.status(500).send({ error: "Error connecting to database" });
  }
  if (error.name === "MongooseError") {
    console.log(error.message);
    return response.status(500).send({ error: "Error connecting to database" });
  }
  console.log("unknown error: ", error);
  next(error);
};

module.exports = {
  errorHandler,
  tokenExtractor,
  userExtractor,
  unknownEndpoint,
};
