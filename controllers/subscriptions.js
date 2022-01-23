const PremiumVisibility = require("../models/premiumVisibility");
const subscriptionsRouter = require("express").Router();
const { shuffle } = require("../utils/utils");

subscriptionsRouter.post("/premiumVisibility/:itemId", async (req, res) => {
  //console.log("",req.params)
  const itemId = req.params.itemId;
  console.log(req.body);
  const premiumItem = new PremiumVisibility({
    item: itemId,
    subscriptionHours: req.body.subscriptionHours,
  });

  const savedPremiumItem = await premiumItem.save();

  res.json(savedPremiumItem);
});

subscriptionsRouter.get("/premiumVisibility", async (req, res) => {
  //console.log("",req.params)
  let premiumItems = await PremiumVisibility.find({}).populate("item");
  let timeNow = new Date();

  for (const item of premiumItems) {
    let subscriptionAllowance = item.subscriptionHours * 3600000;
    let createdAt = new Date(item.createdAt);

    const timeAlive = timeNow.getTime() - createdAt.getTime();

    if (timeAlive > subscriptionAllowance) {
      console.log("timealive    ", timeAlive);
      console.log("allowance     ", subscriptionAllowance);
      await PremiumVisibility.findByIdAndDelete(item._id);
      premiumItems = premiumItems.filter((item1) => item._id !== item1._id);
    }
  }

  console.log(premiumItems);
  const shuffledItems = shuffle(premiumItems);
  const itemsToReturn = shuffledItems.slice(
    0,
    req.query.count ? req.query.count : 10
  );
  console.log(itemsToReturn.length);
  res.json(itemsToReturn);
});

/*subscriptionsRouter.delete("/", async (req, res) => {
  await PremiumVisibility.deleteMany({});

  res.status(204).end();
});*/

module.exports = subscriptionsRouter;
