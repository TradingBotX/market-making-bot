const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let spreadBotMaintainOrders = new Schema(
  {
    orderId: { type: String, required: true },
    uniqueId: { type: String, unique: true, required: true },
    mappingId: { type: String, required: true },
    exchange: { type: String, required: true },
    pair: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    usdtPrice: { type: Number, required: true, default: 0 },
    originalQty: { type: Number, required: true, default: 0 },
    filledQty: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    usdtTotal: { type: Number, required: true, default: 0 },
    updatedTotal: { type: Number, required: true, default: 0 },
    updatedUsdtTotal: { type: Number, required: true, default: 0 },
    fees: { type: Number, default: 0 },
    feeCurrency: { type: String, default: "USD" },
    feesUSDT: { type: Number, default: 0 },
    status: { type: String, required: true, default: "active" },
    currentBalance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "" },
  },
  {
    timestamps: true,
  }
);

//export the model
module.exports = mongoose.model(
  "spreadBotMaintainOrders",
  spreadBotMaintainOrders
);
