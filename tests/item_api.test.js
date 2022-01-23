const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Item = require("../models/item.js");
const api = supertest(app);
const path = require("path");
const fs = require("fs");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

var initialItems = [
  {
    name: "testItem1",
    desc: "this is item1 description",
    price: 500,
    category: "vapaa-aika",
    img: {
      data: fs.readFileSync(path.join(__dirname) + "/testFile"),
      contentType: "image/png",
    },
    user: null,
    location: "location1",
    date: new Date(),
  },
  {
    name: "testItem2",
    desc: "this is item2 description",
    price: 555,
    category: "elektroniikka",
    img: {
      data: fs.readFileSync(path.join(__dirname) + "/testFile"),
      contentType: "image/png",
    },
    user: null,
    location: "location2",
    date: new Date(),
  },
];

let testUser;

beforeAll(async () => {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash("testPassword", 10);
  const newUser = new User({
    username: "testUser",
    passwordHash,
    name: "testName",
    items: [],
  });
  testUser = await newUser.save();
  initialItems[0].user = testUser._id;
  initialItems[1].user = testUser._id;
});
jest.setTimeout(30000);
beforeEach(async () => {
  await Item.deleteMany({});
  let newItem = new Item(initialItems[0]);
  await newItem.save();
  newItem = new Item(initialItems[1]);
  await newItem.save();
});

test("getting all items from items_api succeeds with status code 200 and data is correct", async () => {
  const res = await api
    .get("/api/items")
    .expect(200)
    .expect("Content-Type", "application/json; charset=utf-8");
  console.log("items0 name:  ", res.body);
  console.log("items0 user.id:  ", res.body[0].user.id);

  let unixDateString = String(initialItems[0].date.getTime());

  expect(res.body[0].name).toBe(initialItems[0].name);
  expect(res.body[1].name).toBe(initialItems[1].name);
  expect(res.body[0].price).toEqual(initialItems[0].price);
  expect(res.body[0].category).toBe(initialItems[0].category);
  expect(res.body[0].img.contentType).toBe(initialItems[0].img.contentType);
  expect(res.body[0].location).toBe(initialItems[0].location);
  expect(new Date(res.body[0].date).getTime()).toBe(
    Number(unixDateString.substring(0, unixDateString.length - 3) + "000")
  );

  expect(String(res.body[0].user.id)).toStrictEqual(String(testUser._id));
  expect(String(res.body[1].user.id)).toStrictEqual(String(testUser._id));
});

afterAll(() => {
  mongoose.connection.close();
});
