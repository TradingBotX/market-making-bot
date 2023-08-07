const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let completedOrders = new Schema(
  {
    botType: { type: String, required: true },
    exchange: { type: String, required: true },
    pair: { type: String, required: true },
    type: { type: String, required: true, enum: ["buy", "sell"] },
    account: { type: String, required: true },
    exchangeId: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    usdtPrice: { type: Number, required: true, default: 0 },
    XDC: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 },
    USD: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    BTC: { type: Number, default: 0 },
    XRP: { type: Number, default: 0 },
    IDR: { type: Number, default: 0 },
    SGD: { type: Number, default: 0 },
    SRX: { type: Number, default: 0 },
    PLI: { type: Number, default: 0 },
    LBT: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    feeCurrency: { type: String, default: "USD" },
    feesUSDT: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    deletedAt: { type: String },
  },
  {
    timestamps: true,
  }
);

//export the model
module.exports = mongoose.model("completedOrders", completedOrders);
