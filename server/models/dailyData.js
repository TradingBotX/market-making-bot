const mongoose = require("mongoose");

const dailyData = new mongoose.Schema(
  {
    id: { type: Number },
    data: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("dailyData", dailyData);
