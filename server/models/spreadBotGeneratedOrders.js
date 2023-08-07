const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let spreadBotGeneratedOrders = new Schema(
  {
    uniqueId: { type: String, unique: true, required: true },
    currency: { type: String, required: true },
    type: { type: String, required: true },
    usdtPrice: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: "active" },
    revOrderId: { type: String, default: "" },
    oppOrderId: { type: String, default: "" },
    mappedOrders: [],
  },
  {
    timestamps: true,
  }
);

//export the model
module.exports = mongoose.model(
  "spreadBotGeneratedOrders",
  spreadBotGeneratedOrders
);
