const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const ExchangePair = require("../models/exchangePair");
const ArbitrageOperations = require("../models/arbitrageOperations");
const orderPlacement = require("../helpers/orderPlacement");
const responseHelper = require("../helpers/RESPONSE");
const getSecondaryPair = require("../services/redis").getSecondaryPair;
// const { argv } = require("yargs");
// const secret = argv["secret"];
const fs = require("fs");
const path = require("path");

const ExchangeToPair = new Map();

const {
  UserExistsError,
  ExchangeDoesNotExistError,
  PairExists,
  PairDoesNotExists,
  ExchangeExistError,
  CurrencyExists,
  CurrencyDoesNotExists,
  CurrencyIdExists,
  ExchangeSymbolExists,
  AdminGranted,
  AdminRevoked,
} = require("../helpers/errors");
const adminHelper = require("../helpers/databaseHelpers/adminHelper");
const exchangeCurrencies = require("../models/exchangeCurrencies");
const dailyStats = require("../models/dailyStats");
const exchangePair = require("../models/exchangePair");
const { AESEncrypt } = require("../helpers/crypto");
const exchangeData = require("../models/exchangeData");
const dailyData = require("../models/dailyData");
const huobi = require("../helpers/exchangeHelpers/huobi");
const uuid = require("uuid").v4;

const tokenExpiryTime = process.env.TOKEN_EXPIRY_TIME || 900;

/*
 ***************************************** AUTH STARTS ********************************************
 */

exports.authStatus = async (req, res) => {
  res.status(200).json({ statusCode: 200, userData: req.user });
};

exports.signUp = async (req, res) => {
  logger.debug("called sign up");
  const { email, password, name } = req.body;
  const userExists = await Admin.findOne({ email });
  if (userExists !== null) {
    throw new UserExistsError(email);
  }
  const newAdmin = new Admin({
    email,
    name,
  });
  newAdmin.password = newAdmin.generateHash(password);
  await newAdmin.save();
  logger.debug(`new admin created: ${name}`);
  res.status(201).json({ statusCode: 201, message: "created new admin" });
};

exports.signIn = async (req, res) => {
  logger.debug("called sign in");
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (admin === null) {
    return res.status(400).json({
      statusCode: 400,
      errors: [{ message: "admin not found" }],
    });
  }
  if (
    admin.validPassword(password) !== true ||
    (admin.level !== 1 && admin.level !== 2)
  )
    return res.sendStatus(403);
  const adminObj = admin.toObject();
  delete adminObj.password;
  const accessToken = generateAccessToken(adminObj);
  const expiryDate = new Date(
    Date.now() + tokenExpiryTime * 60 * 1000
  ).toISOString();
  res
    .status(200)
    .json({ statusCode: 200, accessToken, expiryDate, userData: adminObj });
};

exports.AcceptAdmin = async (req, res) => {
  logger.debug("AcceptAdmin");
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (admin.level === 1) throw new AdminGranted(email);
  if (admin === null) {
    return res.status(400).json({
      statusCode: 400,
      errors: [{ message: "admin not found" }],
    });
  }
  admin.level = 1;
  await admin.save();
  res.status(200).json({ statusCode: 200, message: `admin ${email} accepted` });
};

exports.RejectAdmin = async (req, res) => {
  logger.debug("RejectAdmin");
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (admin.level === 0) throw new AdminRevoked(email);
  if (admin === null) {
    return res.status(400).json({
      statusCode: 400,
      errors: [{ message: "admin not found" }],
    });
  }
  admin.level = 0;
  await admin.save();
  res.status(200).json({ statusCode: 200, message: `admin ${email} revoked` });
};

exports.getAdmin = async (req, res) => {
  logger.debug("GetAdmin");
  const admin = await Admin.find({}).select({ password: false }).lean();
  if (admin === null) {
    return res.status(400).json({
      statusCode: 400,
      errors: [{ message: "admin not found" }],
    });
  }
  res
    .status(200)
    .json({ statusCode: 200, data: admin, message: "got admin data" });
};

exports.signOut = (req, res) => {
  try {
    InternalBus.emit(GlobalEvents.admin_logout, { email: req.user.email });
  } catch (e) {}
};

/*
 ***************************************** AUTH STOPS ********************************************
 */

/*
 ***************************************** EXCHANGE MNGT STARTS ********************************************
 */

exports.addExchange = async (req, res) => {
  logger.debug("called addExchange");
  const { exchange, tradeFee } = req.body;
  const existingExchange = await ExchangePair.findOne({ exchange });
  if (existingExchange !== null) throw new ExchangeExistError(exchange);
  const newExchange = new ExchangePair({
    exchange,
    tradeFee,
  });

  await newExchange.save();
  res.status(201).json({ statusCode: 201, message: "new exchange created" });
  logger.debug(`new exchange created ${exchange}`);
};

exports.addExchangePair = async (req, res) => {
  logger.debug("called addExchangePair", req.body);
  const {
    pair,
    decimalsAmount,
    decimalsPrice,
    minAmount,
    maxAmount,
    exchange,
  } = req.body;
  const exchangeObj = await ExchangePair.findOne({ exchange });
  if (exchangeObj === null) {
    throw new ExchangeDoesNotExistError(exchange);
  }
  if (exchangeObj.pair.map((e) => e.name).includes(pair)) {
    throw new PairExists(pair);
  }
  logger.debug("fetched the exchange");
  const newPair = {
    name: pair,
    decimalsAmount,
    decimalsPrice,
    minAmount,
    maxAmount,
  };
  exchangeObj.pair.push(newPair);
  exchangeObj.markModified("pair");
  await exchangeObj.save();
  const arbitrageOperation = await ArbitrageOperations.findOne({});
  if (arbitrageOperation) {
    const connectionDetails = arbitrageOperation.connectionDetails || {};
    const exchangePairs = await exchangePair.findOne({ exchange: exchange });
    if (connectionDetails.buy) {
      if (!Object.keys(connectionDetails.buy).includes(exchange))
        connectionDetails.buy[exchange] = [];
    } else {
      connectionDetails.buy = {};
      connectionDetails.buy[exchange] = [];
    }
    if (connectionDetails.sell) {
      if (!Object.keys(connectionDetails.sell).includes(exchange))
        connectionDetails.sell[exchange] = [];
    } else {
      connectionDetails.sell = {};
      connectionDetails.sell[exchange] = [];
    }
    if (exchangePairs) {
      for (let i = 0; i < exchangePairs.pair.length; i++) {
        if (
          !connectionDetails.buy[exchange].includes(exchangePairs.pair[i].name)
        )
          connectionDetails.buy[exchange].push(exchangePairs.pair[i].name);
        if (
          !connectionDetails.sell[exchange].includes(exchangePairs.pair[i].name)
        )
          connectionDetails.sell[exchange].push(exchangePairs.pair[i].name);
      }
    }
    arbitrageOperation.connectionDetails = connectionDetails;
    arbitrageOperation.markModified("connectionDetails");
    arbitrageOperation.markModified("exchangeConnection");
    await arbitrageOperation.save();
  }
  logger.debug("added new pair");
  InternalBus.emit(GlobalEvents.exchange_pair_updated);
  res.status(201).json({ statusCode: 201, message: "new exchange pair added" });
};

exports.ActivateExchange = async (req, res) => {
  logger.debug("Activate Exchange...", req.body);
  const { exchange } = req.body;
  const exchangeObj = await ExchangePair.findOne({ exchange });
  if (exchangeObj === null) {
    throw new ExchangeDoesNotExistError(exchange);
  }
  exchangeObj.disabled = false;
  await exchangeObj.save();
  res.status(200).json({ statusCode: 200, message: `${exchange} enabled` });
  InternalBus.emit(GlobalEvents.exchange_activated, exchange);
  logger.debug("Activate Exchange...", req.body);
};

exports.DeactivateExchange = async (req, res) => {
  logger.debug("Deactivate...", req.body);
  const { exchange } = req.body;
  const exchangeObj = await ExchangePair.findOne({ exchange });
  if (exchangeObj === null) {
    throw new ExchangeDoesNotExistError(exchange);
  }
  exchangeObj.disabled = true;
  await exchangeObj.save();
  res.status(200).json({ statusCode: 200, message: `${exchange} disabled` });
  InternalBus.emit(GlobalEvents.exchange_deactivated, exchange);
  logger.debug("Deactivate done");
};

exports.UpdateExchangeTradeFee = async (req, res) => {
  logger.debug("Update Exchange Trade...", req.body);
  const { exchange, tradeFee } = req.body;
  const exchangeObj = await ExchangePair.findOne({ exchange });
  if (exchangeObj === null) {
    throw new ExchangeDoesNotExistError(exchange);
  }
  exchangeObj.tradeFee = tradeFee;
  await exchangeObj.save();
  res
    .status(200)
    .json({ statusCode: 200, message: `${exchange} trade fee updated` });
  InternalBus.emit(GlobalEvents.exchange_updated);
  logger.debug("Update Exchange Trade done");
};

exports.GetExchange = async (req, res) => {
  logger.debug("Getting Exchange", req.body);
  const exchanges = await ExchangePair.find({}).lean();
  res.json({
    statusCode: 200,
    message: "successfully got the exchange data",
    data: exchanges,
  });
  logger.debug("Getting Exchange done");
};

exports.UpdateExchangePairDecimals = async (req, res) => {
  logger.debug(":UpdatePairDecimals start");
  const {
    exchange,
    pair,
    decimalsPrice = null,
    decimalsAmount = null,
    minAmount = null,
  } = req.body;
  const exchangeObj = await ExchangePair.findOne({ exchange });
  if (!exchangeObj) throw new ExchangeDoesNotExistError(exchange);
  if (!exchangeObj.pair.some(({ name }) => name === pair))
    throw new PairDoesNotExists(pair);
  for (let i = 0; i < exchangeObj.pair.length; i++) {
    if (exchangeObj.pair[i].name !== pair) continue;
    if (decimalsAmount) exchangeObj.pair[i].decimalsAmount = decimalsAmount;
    if (decimalsPrice) exchangeObj.pair[i].decimalsPrice = decimalsPrice;
    if (minAmount) exchangeObj.pair[i].minAmount = minAmount;
    break;
  }
  await exchangeObj.save();
  res.json({
    statusCode: 200,
    message: `successfully updated exchange ${exchange}-${pair}`,
  });
  logger.debug(":UpdatePairDecimals done");
  InternalBus.emit(GlobalEvents.exchange_updated);
};

/*
 ***************************************** EXCHANGE MNGT STARTS ********************************************
 */

exports.GetArbitrageOperation = async (req, res) => {
  logger.debug("Getting Arbitrage Operation...");
  const exisitingOperation = await ArbitrageOperations.findOne({});
  res.status(200).json({
    statusCode: 200,
    message: "successfully got arbitrage operation",
    data: exisitingOperation,
  });
  logger.debug("Getting Arbitrage Operation done");
};

exports.forceFetchOrderbook = (req, res) => {};

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: `${tokenExpiryTime}m`,
  });
}

exports.updateMailPref = async (req, res) => {
  try {
    const email = req.user.email;
    const level = req.body.level;
    await adminHelper.updateAlertLevel(email, level);
    return responseHelper.successWithMessage(res, "Admin alert level updated");
  } catch (error) {
    logger.error(`adminController_updateMailPref_error : `, error);
    return responseHelper.serverError(res, error);
  }
};

exports.getExchangePairDetails = async (req, res) => {
  try {
    const exchangeData = await ExchangePair.find();
    // let i, j, exchangeData = [], array = {}, pairArray = [], array1 = {};
    // for (i = 0; i < data.length; i++) {
    //   array = {}, pairArray = [], array1 = {};
    //   array.exchange = data[i].exchange;
    //   for (j = 0; j < data[i].pair.length; j++) {
    //     array1 = {
    //       name: data[i].pair[j].name,
    //       minAmount: data[i].pair[j].minAmount,
    //       decimalsPrice: data[i].pair[j].decimalsPrice,
    //       decimalsAmount: data[i].pair[j].decimalsAmount,
    //     };
    //     pairArray.push(array1);
    //   }
    //   array.pairs = pairArray;
    //   exchangeData.push(array);
    // }
    return responseHelper.successWithData(res, "Got Data", { exchangeData });
  } catch (error) {
    logger.error(`adminController_getExchangePairDetails_error : `, error);
    return responseHelper.serverError(res, error);
  }
};

exports.getExchangeCurrencies = async (req, res) => {
  try {
    const exchangeData = await exchangeCurrencies.find();
    return responseHelper.successWithData(res, "Got Currency", {
      exchangeData,
    });
  } catch (error) {
    logger.error(`adminController_getExchangeCurrencies_error : `, error);
    return responseHelper.serverError(res, error);
  }
};

exports.ecAddExchange = async (req, res) => {
  const { exchange } = req.body;
  const existingExchange = await exchangeCurrencies.findOne({ exchange });
  if (existingExchange !== null) throw new ExchangeExistError(exchange);
  const newExchange = new exchangeCurrencies({
    exchange,
  });
  await newExchange.save();
  return responseHelper.successWithMessage(res, "Exchange added");
};

exports.ecAddExchangeCurrency = async (req, res) => {
  const {
    symbol,
    name,
    exchange,
    exchangeSymbol,
    minimumBalance,
    minArbBalance = 0,
  } = req.body;
  const exchangeObj = await exchangeCurrencies.findOne({ exchange });
  if (exchangeObj === null) {
    throw new ExchangeDoesNotExistError(exchange);
  }
  if (exchangeObj.currency.map((e) => e.symbol).includes(symbol)) {
    throw new CurrencyExists(symbol);
  }
  const currencyId = await orderPlacement.GetCurrencyId(
    exchange,
    exchangeSymbol
  );
  if (
    currencyId &&
    exchangeObj.currency.map((e) => e.currencyId).includes(currencyId)
  ) {
    throw new CurrencyIdExists(currencyId);
  }
  if (
    exchangeObj.currency.map((e) => e.exchangeSymbol).includes(exchangeSymbol)
  ) {
    throw new ExchangeSymbolExists(exchangeSymbol);
  }
  const newCurrency = {
    symbol,
    name,
    currencyId,
    exchangeSymbol,
    minimumBalance,
    minArbBalance,
  };
  exchangeObj.currency.push(newCurrency);
  exchangeObj.markModified("currency");
  await exchangeObj.save();
  return responseHelper.successWithMessage(res, "New Exchange Currency added");
};

exports.ecUpdateExchangeCurrency = async (req, res) => {
  const {
    exchange,
    symbol,
    name = null,
    exchangeSymbol = null,
    minimumBalance = null,
    minArbBalance = null,
  } = req.body;
  const exchangeObj = await exchangeCurrencies.findOne({ exchange });
  if (!exchangeObj) throw new ExchangeDoesNotExistError(exchange);
  if (!exchangeObj.currency.map((e) => e.symbol).includes(symbol))
    throw new CurrencyDoesNotExists(symbol);
  if (
    exchangeObj.currency.map((e) => e.exchangeSymbol).includes(exchangeSymbol)
  ) {
    throw new ExchangeSymbolExists(exchangeSymbol);
  }
  const currencyId = await orderPlacement.GetCurrencyId(
    exchange,
    exchangeSymbol
  );
  if (
    currencyId &&
    exchangeObj.currency.map((e) => e.currencyId).includes(currencyId)
  ) {
    throw new CurrencyIdExists(currencyId);
  }
  for (let i = 0; i < exchangeObj.currency.length; i++) {
    if (exchangeObj.currency[i].symbol !== symbol) continue;
    if (name) exchangeObj.currency[i].name = name;
    if (currencyId) exchangeObj.currency[i].currencyId = currencyId;
    if (exchangeSymbol) exchangeObj.currency[i].exchangeSymbol = exchangeSymbol;
    if (minimumBalance) exchangeObj.currency[i].minimumBalance = minimumBalance;
    if (minArbBalance) exchangeObj.currency[i].minArbBalance = minArbBalance;
    break;
  }
  await exchangeObj.save();
  return responseHelper.successWithMessage(
    res,
    `Successfully updated exchange ${exchange}-${symbol}`
  );
};

// exports.ecRemoveExchangeCurrency = async (req, res) => {
//   try {
//     const exchangeData = await exchangeCurrencies.find();
//     return responseHelper.successWithData(res, 'Got Data', { exchangeData });
//   } catch (error) {
//     logger.error(`adminController_ecRemoveExchangeCurrency_error : `, error);
//     return responseHelper.serverError(res, error);
//   }
// };

/**
 *
 *************************************** Hourly Wallet Snap Shot ****************************************
 *
 */

exports.getTimestamps = async (req, res) => {
  try {
    const timestampData = await dailyStats.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$time", created: { $last: "$createdAt" } } },
      { $sort: { created: -1 } },
      { $limit: 48 },
    ]);
    let timestamps = [];
    for (let i = 0; i < timestampData.length; i++) {
      timestamps.push(timestampData[i]._id);
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Sucessfully got the timestamps",
      data: timestamps,
    });
  } catch (error) {
    logger.error("adminController_getTimestamps_error", error);
    return res.status(200).json({ statusCode: 500, message: "Server Error" });
  }
};

exports.getDataByTimestamp = async (req, res) => {
  try {
    const timestamp = req.body.timestamp;
    const walletData = await dailyStats.find({ time: timestamp }).lean();
    if (walletData && walletData != "error") {
      let totalUSDT = 0,
        i,
        j;
      for (i = 0; i < walletData.length; i++) {
        for (j = 0; j < walletData[i].stats.length; j++) {
          if (walletData[i].exchange == "total") {
            totalUSDT = totalUSDT + parseFloat(walletData[i].stats[j].diffUSDT);
          }
        }
      }
      walletData.push({
        exchange: "Total Difference(USDT)",
        account: "total",
        stats: [
          {
            currency: "USDT",
            yesterday: 0,
            today: 0,
            difference: 0,
            diffUSDT: parseFloat(totalUSDT).toFixed(4),
          },
        ],
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Successfully got the data",
      data: walletData,
    });
  } catch (error) {
    logger.error("adminController_getDataByTimestamp", error);
    return res.status(200).json({ statusCode: 500, message: "Server Error" });
  }
};

/**
 *
 *************************************** Hourly Wallet Snap Shot ****************************************
 *
 */

exports.addKey = async (req, res) => {
  try {
    // const data = fs.readFileSync(
    //   path.resolve(__dirname, "../helpers/data.json"),
    //   "UTF-8"
    // );
    // const secret = JSON.parse(data).secret;
    const data = await dailyData.findOne({ id: 1 });
    const secret = data.data;
    const exchange = req.body.exchange;
    const checkData = await exchangeData.findOne({ exchange });
    if (!checkData) {
      let apiKey,
        apiSecret,
        passPhrase,
        subAccUserId,
        accountId,
        encApiKey,
        encApiSecret,
        encPassPhrase,
        encSubAccUserId,
        encAccountId;
      apiKey = req.body.apiKey || "";
      apiSecret = req.body.apiSecret || "";
      passPhrase = req.body.passPhrase || "";
      subAccUserId = req.body.subAccUserId || "";
      accountId = req.body.accountId || "";
      if (exchange == "huobi") {
        const accountData = await huobi.getAccounts({ apiKey, apiSecret });
        if (accountData != "error" && accountData.data) {
          if (accountData.data.some((e) => e.type == "spot")) {
            accountId = accountData.data
              .filter((e) => e.type == "spot")[0]
              .id.toString();
          } else {
            return responseHelper.error(res, "Spot trading rights not given");
          }
        } else {
          return responseHelper.error(res, "Invalid API Key or Secret");
        }
      }
      encApiKey = apiKey == "" ? "" : AESEncrypt(apiKey, secret);
      encApiSecret = apiSecret == "" ? "" : AESEncrypt(apiSecret, secret);
      encPassPhrase = passPhrase == "" ? "" : AESEncrypt(passPhrase, secret);
      encSubAccUserId =
        subAccUserId == "" ? "" : AESEncrypt(subAccUserId, secret);
      encAccountId = accountId == "" ? "" : AESEncrypt(accountId, secret);
      const data = new exchangeData({
        uniqueId: uuid(),
        exchange,
        apiKey: encApiKey,
        apiSecret: encApiSecret,
        passPhrase: encPassPhrase,
        subAccUserId: encSubAccUserId,
        accountId: encAccountId,
      });
      await data.save();
      return responseHelper.successWithMessage(res, "Key Added succesfully");
    } else {
      return responseHelper.error(res, "Key already added for the exchange");
    }
  } catch (error) {
    logger.error(`adminController_addKey_error`, error);
    return responseHelper.serverError(res, error);
  }
};

exports.getKeys = async (req, res) => {
  try {
    const keys = await exchangeData.find({});
    return responseHelper.successWithData(res, "Got data", keys);
  } catch (error) {
    logger.error(`adminController_getKeys_error`, error);
    return responseHelper.serverError(res, error);
  }
};

exports.deleteKey = async (req, res) => {
  try {
    const keyId = req.body.keyId;
    const data = await exchangeData.findOne({ uniqueId: keyId });
    if (data) {
      await exchangeData.findOneAndRemove({ uniqueId: keyId });
      return responseHelper.successWithMessage(res, "Key Removed");
    } else {
      return responseHelper.error(res, "Invalid key id");
    }
  } catch (error) {
    logger.error(`adminController_deleteKey_error`, error);
    return responseHelper.serverError(res, error);
  }
};
