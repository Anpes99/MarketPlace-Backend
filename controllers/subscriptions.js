const subscriptionsRouter = require("express").Router();
const { shuffle } = require("../utils/utils");
const Item = require("../models/item");

subscriptionsRouter.post("/premiumVisibility/:itemId", async (req, res) => {
  //console.log("",req.params)
  try {
    const result = await Item.findByIdAndUpdate(req.params.itemId, {
      isPremium: true,
      premium: { date: new Date(), subscriptionHours: Number(req.query.hours) },
    });
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
});

module.exports = subscriptionsRouter;
