require("dotenv").config();
const itemRouter = require("express").Router();
var multer = require("multer");
const Item = require("../models/item");
const path = require("path");
const fs = require("fs");
const { json } = require("body-parser");
const jwt = require("jsonwebtoken");
const { shuffle } = require("../utils/utils");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

itemRouter.post("/", upload.single("image"), (req, res, next) => {
  console.log("gfdsfdgsdfgfsd");
  console.log("token:  @@@@@@@@@@@@@@@@@", req.token);
  jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
    console.log("decoded:  @@@@ ", decoded);
    console.log("error:   ", err);

    if (!err) {
      console.log("!err");
      var obj = {
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        category: req.body.category,
        img:
          req.file !== undefined
            ? {
                data: fs.readFileSync(
                  path.join(
                    __dirname.substring(0, __dirname.length - 12) +
                      "/uploads/" +
                      req.file.filename
                  )
                ),
                contentType: "image/png",
              }
            : null,
        user: decoded.id,
        location: req.body.location,
      };
      console.log("!err@@");

      Item.create(obj, (err, item) => {
        if (err) {
          console.log("err@@:", err);
        } else {
          item
            .save()
            .then((r) => {
              console.log("item saved  ", r);
              res.status(200).json({ success: true });
            })
            .catch((err) => {
              console.log("error:  @@", err);
              res.status(500).json(err);
            });
        }
      });
    } else {
      res.json(err);
    }
  });
});

itemRouter.get("/", async (req, res) => {
  let location = req.query.location;
  let category = req.query.category;
  let premium = req.query.premium;
  let limit = req.query.limit;
  let fields = req.query.fields;
  let sort = req.query.sort;
  let random = req.query.random;
  fields = fields ? fields.split(",") : fields;
  console.log("fields:   ", fields);
  console.log(req.query);

  params = {};
  let options = {
    sort: { createdAt: "desc" },
    populate: "user",
    page: req.query.page || 1,
    collation: {
      locale: "en",
    },
  };
  if (location) params.location = location;
  if (category) params.category = category;
  if (premium) params.isPremium = true;
  if (random) options.limit = 5000;
  else {
    options.limit = limit || 10;
  }
  if (fields) options.select = fields;

  console.log("sort ", sort);
  if (sort) options.sort = sort.replace(/,/g, " "); // descending example: &sort=-location,

  let items;
  console.log(params);

  await Item.paginate(params, options, async (err, result) => {
    console.log("error", err);
    //result.docs
    // result.totalDocs = 100
    // result.limit = 10
    // result.page = 1
    // result.totalPages = 10
    // result.hasNextPage = true
    // result.nextPage = 2
    // result.hasPrevPage = false
    // result.prevPage = null
    // result.pagingCounter = 1
    console.log("res: ", result);
    try {
      ///////////////////////////////////////////////////////////////////////
      ///////////////// deletes expired premium items
      if (premium) {
        let timeNow = new Date();
        for (const premItem of result.docs) {
          let subscriptionAllowance =
            premItem.premium.subscriptionHours * 3600000;
          let createdAt = new Date(premItem.premium.date);

          const timeAlive = timeNow.getTime() - createdAt.getTime();

          if (timeAlive > subscriptionAllowance) {
            console.log("timealive    ", timeAlive);
            console.log("allowance     ", subscriptionAllowance);
            await Item.findByIdAndUpdate(premItem._id, { isPremium: false });
            result.docs = result.docs.filter(
              (item) => premItem._id !== item._id
            );
          }
        }
      }
      ////////////////////////////////////////////////////////////////////////////
      ////////////// deletes   unwanted user fields
      result.docs = result.docs.map((doc) => {
        if (doc.user) {
          doc.user.items = null;
          doc.user.passwordHash = null;
        }
        return doc;
      });

      if (premium && random) {
        ///  shuffles and returns premium items with limit
        result.docs = shuffle(result.docs);
        result.docs = result.docs.slice(
          0,
          req.query.limit ? req.query.limit : 10
        );
        return res.json(result.docs);
      }

      return res.json(result);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  });
});

itemRouter.get("/:itemId", (req, res) => {
  //console.log("",req.params)
  Item.findOne({ _id: req.params.itemId })
    .populate("user")
    .then((result) => {
      console.log(result);
      return res.json(result);
    });
});

itemRouter.get("/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  console.log("user found :  ", user);
  const userItems = await Item.find({ user: user._id });
  //console.log("user items found :  ",userItems)

  return res.json(userItems);
});

itemRouter.delete("/:itemId", async (req, res) => {
  await premiumVisibility.deleteMany({});
  await Item.deleteMany({});
  const result = await Item.findByIdAndDelete(req.params.itemId);

  return res.status(204).end();
});

itemRouter.delete("/", async (req, res) => {
  await Item.deleteMany({});

  return res.status(204).end();
});

module.exports = itemRouter;
