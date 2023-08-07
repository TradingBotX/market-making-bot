const mongoose = require("mongoose");

const exchangeCurrencies = new mongoose.Schema(
  {
    exchange: { type: String, unique: true, required: true },
    currency: [
      {
        symbol: String,
        name: String,
        currencyId: String,
        exchangeSymbol: String,
        minimumBalance: Number,
        minArbBalance: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("exchangeCurrencies", exchangeCurrencies);
