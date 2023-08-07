const mongoose = require("mongoose");

const arbitrageOperationsSchema = mongoose.Schema(
  {
    minAmount: {},
    maxAmount: {},
    minPriceBy: [
      {
        type: String,
        enum: ["total_amount", "price_diff"],
        default: "total_amount",
      },
    ],
    minPrice: {
      total_amount: Number,
      price_diff: Number,
    },
    virtualArbitrage: { type: Boolean, default: false },
    exchangeConnection: {},
    connectionDetails: {},
    status: { type: Boolean, default: false },
    activeOrderTolerance: Number,
    statusMsg: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ArbitrageOperations",
  arbitrageOperationsSchema
);
