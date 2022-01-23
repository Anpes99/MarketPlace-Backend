const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");
const res = require("express/lib/response");

loginRouter.post("/", async (request, response) => {
  const { body } = request;
  try {
    const user = await User.findOne({ username: body.username });

    const passwordCorrect =
      user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return response.status(401).json({
        error: "invalid username or password",
      });
    }
    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: 60 * 60,
    });

    response
      .status(200)
      .send({ token, username: user.username, name: user.name, id: user._id });
  } catch (error) {
    console.log(error);
    res.status(401).json(error);
  }
});

module.exports = loginRouter;
