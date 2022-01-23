const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
require("express-async-errors");
const Item = require("../models/item");
const req = require("express/lib/request");

usersRouter.post("/", async (request, response) => {
  const { body } = request;
  if (!(body.username && body.password)) {
    return response.status(400).json({ error: "username or password missing" });
  }
  if (!(body.username.length > 2 && body.password.length > 2)) {
    return response
      .status(400)
      .json({ error: "username or password is too short" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
    items: [],
  });

  const savedUser = await user.save();

  response.json(savedUser);
});

usersRouter.get("/", async (req, res) => {
  const users = await User.find({});
  res.json(users.map((user) => user.toJSON()));
});

usersRouter.delete("/:username", async (req, res) => {
  const result = await User.findOneAndDelete({ username: req.params.username });
  res.json(result);
});

module.exports = usersRouter;