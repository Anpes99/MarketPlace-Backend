const resetRouter = require("express").Router();
const User = require("../models/user");
const Item = require("../models/item");

resetRouter.post("/", async (req, res) => {
  await User.deleteMany({});

  await Item.deleteMany({});

  res.status(204).end();
});

module.exports = resetRouter;
