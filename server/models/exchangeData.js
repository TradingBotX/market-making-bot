const mongoose = require("mongoose");

const exchangeData = new mongoose.Schema(
  {
    uniqueId: { type: String, unique: true, required: true },
    exchange: { type: String, unique: true, required: true },
    apiKey: { type: String, default: "" },
    apiSecret: { type: String, default: "" },
    passPhrase: { type: String, default: "" },
    subAccUserId: { type: String, default: "" },
    accountId: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("exchangeData", exchangeData);
