const mongoose = require("mongoose");

const premiumVisibilitySchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    subscriptionHours: { type: Number, required: true },
  },
  { timestamps: true }
);

premiumVisibilitySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("PremiumVisibility", premiumVisibilitySchema);
