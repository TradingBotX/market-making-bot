const mongoose = require("mongoose");

const walletSnapShot = new mongoose.Schema(
  {
    snapId: { type: String, required: true, index: true },
    exchange: String,
    account: String,
    currency: [
      {
        currency: String,
        balance: Number,
        inTrade: Number,
        total: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("walletSnapShot", walletSnapShot);
