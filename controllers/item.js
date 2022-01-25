require("dotenv").config();
const itemRouter = require("express").Router();
var multer = require("multer");
const Item = require("../models/item");
const path = require("path");
const fs = require("fs");
const { json } = require("body-parser");
const jwt = require("jsonwebtoken");
const { shuffle } = require("../utils/utils");
const User = require("../models/user");
const { sendEmail } = require("../services/email");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

itemRouter.post("/", upload.single("image"), async (req, res, next) => {
  console.log("gfdsfdgsdfgfsd");
  console.log("token:  @@@@@@@@@@@@@@@@@", req.token);
  jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
    console.log("decoded:  @@@@ ", decoded);
    console.log("error:   ", err);

    if (!err) {
      if (path.extname(req.file.originalname).toLowerCase() !== ".png") {
        return res.status(400).send("Only .png files are accepted.");
      }
      let fileUpload = fs.readFileSync(
        path.join(
          __dirname.substring(0, __dirname.length - 12) +
            "/uploads/" +
            req.file.filename
        )
      );
      console.log("!err");
      var obj = {
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        category: req.body.category,
        img:
          req.file !== undefined
            ? {
                data: fileUpload,
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
            .then(async (r) => {
              console.log(item);
              const user = await User.findById(decoded.id);
              user.items.push(item._id);
              const result = await User.findByIdAndUpdate(decoded.id, {
                items: user.items,
              });
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
      console.log(err);
      next(err);
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

itemRouter.get("/:itemId", async (req, res) => {
  //console.log("",req.params)
  const result = await Item.findOne({ _id: req.params.itemId }).populate(
    "user",
    "username name"
  );

  console.log("gfgs", result);
  return res.json(result);
});

itemRouter.delete("/:itemId", async (req, res) => {
  const result = await Item.findByIdAndDelete(req.params.itemId);

  return res.status(204).end();
});
itemRouter.put("/:itemId", async (req, res) => {
  const { body } = req;

  const item = await Item.findById(req.params.itemId);
  console.log(item);
  if (body.price) item.price = body.price;
  if (body.location) item.location = body.location;
  if (body.category) item.category = body.category;
  if (body.description) item.description = body.description;
  if (body.name) item.name = body.name;

  await Item.findByIdAndUpdate(req.params.itemId, item);

  const users = await User.find({}, "favourites email");
  const favouritedUsers = users.filter((user) =>
    user.favourites.includes(req.params.itemId)
  );
  console.log(favouritedUsers);
  const favouritedEmails = favouritedUsers.map((user) => user.email);
  console.log("favourited emails:   ", favouritedEmails);
  /// sends  email to all users that have favourited this item
  await sendEmail(
    favouritedEmails.join(),
    "Update on a favourited item",
    `there was an update on a one of your favourited items. ${item.name}`
  ).catch(console.error);

  return res.status(200).end();
});

/*itemRouter.delete("/", async (req, res) => {
  await Item.deleteMany({});

  return res.status(204).end();
});*/

module.exports = itemRouter;
