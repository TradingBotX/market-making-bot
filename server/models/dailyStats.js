const mongoose = require("mongoose");

const dailyStats = new mongoose.Schema(
  {
    exchange: String,
    account: String,
    stats: [
      {
        currency: String,
        yesterdayBalance: Number,
        todayBalance: Number,
        balanceChange: Number,
        type: { type: String, enum: ["profit", "loss"] },
        diffUSDT: Number,
      },
    ],
    time: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("dailyStats", dailyStats);
