const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let exchangePair = new Schema(
  {
    exchange: { type: String, unique: true, required: true },
    pair: [
      {
        name: { type: String, required: true },
        decimalsAmount: { type: Number },
        decimalsPrice: { type: Number },
        minAmount: { type: Number, default: 0 },
        maxAmount: { type: Number },
      },
    ],
    tradeFee: { type: Number, required: true, default: 0 },
    disabled: { type: Boolean, default: false },
    deletedAt: { type: String },
  },
  {
    timestamps: true,
  }
);

//export the model
module.exports = mongoose.model("exchangePair", exchangePair);
