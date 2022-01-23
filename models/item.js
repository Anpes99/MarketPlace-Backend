const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const itemSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    subCategory: String,
    desc: String,
    price: Number,
    premium: { type: mongoose.Schema.Types.ObjectId, ref: "premiumVisibility" },
    location: String,
    img: {
      data: Buffer,
      contentType: String,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

itemSchema.plugin(mongoosePaginate);

itemSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Item", itemSchema);
