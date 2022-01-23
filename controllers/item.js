require("dotenv").config();
const itemRouter = require("express").Router();
var multer = require("multer");
const Item = require("../models/item");
const path = require("path");
const fs = require("fs");
const { json } = require("body-parser");
const jwt = require("jsonwebtoken");
const premiumVisibility = require("../models/premiumVisibility");

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
  jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
    if (!err) {
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

      Item.create(obj, (err, item) => {
        if (err) {
        } else {
          item
            .save()
            .then((r) => {
              res.status(200).json({ success: true });
            })
            .catch((err) => {
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
  let count = req.query.count;
  console.log(req.query);

  params = {};
  let options = {
    sort: { createdAt: "desc" },
    populate: "user",
    page: req.query.page || 1,
    limit: 10,
    collation: {
      locale: "en",
    },
  };
  if (location) params.location = location;
  if (category) params.category = category;

  if (count) options.limit = count;

  let items;
  console.log(params);

  await Item.paginate(params, options, (err, result) => {
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
      result.docs = result.docs.map((doc) => {
        if (doc.user) {
          doc.user.items = null;
          doc.user.passwordHash = null;
        }
        return doc;
      });
      res.json(result);
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
      res.json(result);
    });
});

itemRouter.get("/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  console.log("user found :  ", user);
  const userItems = await Item.find({ user: user._id });
  //console.log("user items found :  ",userItems)

  res.json(userItems);
});

itemRouter.delete("/:itemId", async (req, res) => {
  await premiumVisibility.deleteMany({});
  await Item.deleteMany({});
  const result = await Item.findByIdAndDelete(req.params.itemId);

  res.status(204).end();
});

itemRouter.delete("/", async (req, res) => {
  await Item.deleteMany({});

  res.status(204).end();
});

module.exports = itemRouter;
