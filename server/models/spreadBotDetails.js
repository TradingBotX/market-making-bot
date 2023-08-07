const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let spreadBotDetails = new Schema(
  {
    uniqueId: { type: String, required: true, unique: true },
    exchange: { type: String, required: true },
    pair: { type: String, required: true },
    maxOrders: { type: Number, required: true, default: 0 },
    percentGap: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    usdtPrice: { type: Number, required: true, default: 0 },
    amountBuy: { type: Number, required: true, default: 0 },
    amountSell: { type: Number, required: true, default: 0 },
    placedAmountBuy: { type: Number, required: true, default: 0 },
    filledAmountBuy: { type: Number, required: true, default: 0 },
    placedTotalBuy: { type: Number, default: 0 }, //in USDT
    updatedTotalBuy: { type: Number, default: 0 }, //in USDT
    placedAmountSell: { type: Number, required: true, default: 0 },
    filledAmountSell: { type: Number, required: true, default: 0 },
    placedTotalSell: { type: Number, default: 0 }, //in USDT
    updatedTotalSell: { type: Number, default: 0 }, //in USDT
    mappedOrders: [],
    status: { type: String, required: true, default: "active" },
    // started: { type: Boolean, required: true, default: false },
    ordersGenerated: { type: Boolean, required: true, default: false },
    balanceToBeMaintanedC1: { type: Number, required: true, default: 0 },
    balanceToBeMaintanedC2: { type: Number, required: true, default: 0 },
    lastSettledAtC1: { type: Number, required: true, default: 0 },
    lastSettledAtC2: { type: Number, required: true, default: 0 },
    deletedAt: { type: String },
  },
  {
    timestamps: true,
  }
);

//export the model
module.exports = mongoose.model("spreadBotDetails", spreadBotDetails);
