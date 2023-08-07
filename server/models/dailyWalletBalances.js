const mongoose = require("mongoose");

const dailyWalletBalances = new mongoose.Schema(
  {
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
    time: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("dailyWalletBalances", dailyWalletBalances);
