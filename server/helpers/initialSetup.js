const admin = require("../models/admin");
const exchangeCurrencies = require("../models/exchangeCurrencies");
const exchangePair = require("../models/exchangePair");
const { passwordGenerator, emailGenerator } = require("./commonHelper");
const {
  ExchangePairInfo,
  Exchanges,
  ExchangeCurrencyInfo,
} = require("./constant");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = {
  checkSetup: async () => {
    try {
      const checkAdmin = await admin.findOne({});
      if (!checkAdmin || process.env.RESET_ADMIN == true) {
        if (process.env.RESET_ADMIN == true) {
          await admin.deleteMany({});
        }
        const email = await emailGenerator(10);
        const password = await passwordGenerator(10);
        const newAdmin = new admin({
          email,
          name: "User",
          level: 2,
          alerts: 2,
        });
        newAdmin.password = newAdmin.generateHash(password);
        await newAdmin.save();
        console.log(
          "Please use the following email and password to login, it won't be displayed again",
          email,
          password
        );
      }
      let data = fs.readFileSync(path.resolve(__dirname, "data.json"), "UTF-8");
      let secret = JSON.parse(data).secret;
      while (secret == "" || secret.length != 32) {
        let updatedSecret = crypto.randomBytes(16).toString("hex");
        let jsonSecret = JSON.stringify({ secret: updatedSecret });
        fs.writeFileSync(path.resolve(__dirname, "data.json"), jsonSecret);
        data = fs.readFileSync(path.resolve(__dirname, "data.json"), "UTF-8");
        secret = JSON.parse(data).secret;
      }
      let i,
        j,
        k,
        exchange,
        pairs,
        upsertData = {},
        pair,
        exchangeData,
        currencies,
        currency;
      for (i = 0; i < Exchanges.length; i++) {
        exchange = Exchanges[i];
        //insert default pairs
        upsertData.exchange = exchange;
        upsertData.tradeFee = 0;
        upsertData.disabled = false;
        await exchangePair.findOneAndUpdate(
          { exchange },
          { upsertData },
          { upsert: true }
        );
        exchangeData = await exchangePair.findOne({ exchange });
        pairs = Object.keys(ExchangePairInfo[exchange]);
        for (j = 0; j < pairs.length; j++) {
          pair = pairs[j];
          if (exchangeData.pair.map((e) => e.name).includes(pair)) {
            for (k = 0; k < exchangeData.pair.length; k++) {
              if (exchangeData.pair[k].name == pair) {
                exchangeData.pair[k].decimalsAmount =
                  ExchangePairInfo[exchange][pair].decimalsAmount || 0;
                exchangeData.pair[k].decimalsPrice =
                  ExchangePairInfo[exchange][pair].decimalsPrice || 0;
                exchangeData.pair[k].minAmount =
                  ExchangePairInfo[exchange][pair].minAmount || 0;
                exchangeData.pair[k].maxAmount =
                  ExchangePairInfo[exchange][pair].maxAmount || 0;
                exchangeData.pair[k].markModified("decimalsAmount");
                exchangeData.pair[k].markModified("decimalsPair");
                exchangeData.pair[k].markModified("minAmount");
                exchangeData.pair[k].markModified("maxAmount");
                exchangeData.markModified("pair");
              }
            }
          } else {
            exchangeData.pair.push({
              name: pair,
              decimalsAmount:
                ExchangePairInfo[exchange][pair].decimalsAmount || 0,
              decimalsPrice:
                ExchangePairInfo[exchange][pair].decimalsPrice || 0,
              minAmount: ExchangePairInfo[exchange][pair].minAmount || 0,
              maxAmount: ExchangePairInfo[exchange][pair].maxAmount || 0,
            });
            exchangeData.markModified("pair");
          }
          await exchangeData.save();
        }
        //insert default currencies
        await exchangeCurrencies.findOneAndUpdate(
          { exchange },
          { exchange },
          { upsert: true }
        );
        exchangeData = await exchangeCurrencies.findOne({ exchange });
        currencies = Object.keys(ExchangeCurrencyInfo[exchange]);
        for (j = 0; j < currencies.length; j++) {
          currency = currencies[j];
          if (exchangeData.currency.map((e) => e.symbol).includes(currency)) {
            for (k = 0; k < exchangeData.currency.length; k++) {
              if (exchangeData.currency[k].symbol == currency) {
                exchangeData.currency[k].exchangeSymbol =
                  ExchangeCurrencyInfo[exchange][currency].exchangeSymbol ||
                  currency;
                exchangeData.currency[k].name =
                  ExchangeCurrencyInfo[exchange][currency].name || currency;
                exchangeData.currency[k].currencyId =
                  ExchangeCurrencyInfo[exchange][currency].currencyId || "";
                exchangeData.currency[k].markModified("exchangeSymbol");
                exchangeData.currency[k].markModified("name");
                exchangeData.currency[k].markModified("currencyId");
                exchangeData.markModified("currency");
              }
            }
          } else {
            exchangeData.currency.push({
              symbol: currency,
              exchangeSymbol:
                ExchangeCurrencyInfo[exchange][currency].exchangeSymbol ||
                currency,
              name: ExchangeCurrencyInfo[exchange][currency].name || currency,
              currencyId:
                ExchangeCurrencyInfo[exchange][currency].currencyId || "",
            });
            exchangeData.markModified("currency");
          }
          await exchangeData.save();
        }
      }
      InternalBus.emit(GlobalEvents.exchange_pair_updated);
    } catch (error) {
      logger.error(`initialSetup_checkSetup_error`, error);
    }
  },
};
