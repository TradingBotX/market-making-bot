const bitrue = require("../helpers/exchangeHelpers/bitrue");
const bitfinex = require("./exchangeHelpers/bitfinex");
const RedisClient = require("../services/redis").RedisClient;
const getSecondaryPair = require("../services/redis").getSecondaryPair;
const ExchangePair = require("../models/exchangePair");
const {
  ExchangePairInfo: ExchangePairInfoDef,
  setExchangePairInfo,
} = require("../helpers/constant");
const exchangeCurrencies = require("../models/exchangeCurrencies");
const { GetDecryptedEnv } = require("./decryptedEnv");
const completedOrders = require("../models/completedOrders");
const kucoin = require("./exchangeHelpers/kucoin");
const ArbitrageOperations = require("../models/arbitrageOperations");
const bittrex = require("./exchangeHelpers/bittrex");
const gateio = require("./exchangeHelpers/gateio");
const huobi = require("./exchangeHelpers/huobi");
const exchangeData = require("../models/exchangeData");
const ExchangePairInfo = { ...ExchangePairInfoDef };

exports.PlaceOrder = async (exchange, orderData) => {
  try {
    let orderId;
    orderData = {
      ...orderData,
      price: parseFloat(orderData.price).toFixed(
        ExchangePairInfo[exchange][orderData.pair].decimalsPrice
      ),
      amount: parseFloat(orderData.amount).toFixed(
        ExchangePairInfo[exchange][orderData.pair].decimalsAmount
      ),
    };

    if (
      (orderData.amount || 0) <
      ExchangePairInfo[exchange][orderData.pair].minAmount
    ) {
      logger.error(":PlaceOrder minAmount not met for order", orderData);
      return "error";
    }

    if (exchange == "bitrue") {
      const resp = await bitrue.placeOrder(orderData);
      if (resp != "" && resp != "error" && resp != null) {
        orderId = resp.orderIdStr;
      } else {
        logger.error(exchange, orderData, resp);
        orderId = "error";
      }
    } else if (exchange == "bitfinex") {
      orderData.nonce = await bitfinex.GetNonce();
      const resp = await bitfinex.placeOrder(orderData);
      await bitfinex.releaseNonce();
      if (
        resp != "" &&
        resp != "error" &&
        resp != null &&
        resp.is_live == true
      ) {
        orderId = resp.order_id;
      } else {
        logger.error(exchange, orderData, resp);
        orderId = "error";
      }
    } else if (exchange == "kucoin") {
      const resp = await kucoin.placeOrder(orderData);
      if (resp != "" && resp != "error" && resp != null) {
        orderId = resp.data.orderId;
      } else {
        logger.error(exchange, orderData, resp);
        orderId = "error";
      }
    } else if (exchange == "bittrex") {
      const resp = await bittrex.placeOrder(orderData);
      if (resp != "" && resp != "error" && resp != null) {
        orderId = resp.id;
      } else {
        logger.error(exchange, orderData, resp);
        orderId = "error";
      }
    } else if (exchange == "gateio") {
      const resp = await gateio.placeOrder(orderData);
      if (resp != "" && resp != "error" && resp != null) {
        orderId = resp.id;
      } else {
        logger.error(exchange, orderData, resp);
        orderId = "error";
      }
    } else if (exchange == "huobi") {
      const resp = await huobi.placeOrder(orderData);
      if (resp != "" && resp != "error" && resp != null) {
        orderId = resp.data;
      } else {
        logger.error(exchange, orderData, resp);
        orderId = "error";
      }
    }

    if (orderId !== "error") {
      // add in sheet
    }

    return orderId;
  } catch (e) {
    logger.error(e);
    return "error";
  }
};

exports.GetMaxMinPrice = async (exchange, pair) => {
  let orderBookData,
    bids,
    asks,
    maxPrice,
    minPrice,
    orgPair,
    orgExchange,
    lastPrice;

  if (exchange == "bitrue") {
    orderBookData = await bitrue.orderBook(pair);
    bids = orderBookData.bids;
    asks = orderBookData.asks;
    maxPrice = parseFloat(
      parseFloat(Object.values(asks)).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
    minPrice = parseFloat(
      parseFloat(Object.values(bids)).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
  } else if (exchange == "bitfinex") {
    orderBookData = await bitfinex.orderBook(pair);
    bids = orderBookData.bids;
    asks = orderBookData.asks;
    maxPrice = parseFloat(
      parseFloat(asks[0].price).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
    minPrice = parseFloat(
      parseFloat(bids[0].price).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
  } else if (exchange == "bitfinexVB") {
    let orderBookDataXU = await bitfinex.orderBook("XDC-USD");
    let orderBookDataXT = await bitfinex.orderBook("XDC-USDT");
    let bidsXU = orderBookDataXU.bids;
    let asksXU = orderBookDataXU.asks;
    let bidsXT = orderBookDataXT.bids;
    let asksXT = orderBookDataXT.asks;
    let maxPriceXU = parseFloat(
      parseFloat(asksXU[0].price).toFixed(
        ExchangePairInfo["bitfinex"]["XDC-USD"].decimalsPrice
      )
    );
    let minPriceXU = parseFloat(
      parseFloat(bidsXU[0].price).toFixed(
        ExchangePairInfo["bitfinex"]["XDC-USD"].decimalsPrice
      )
    );

    let maxPriceXT = parseFloat(
      parseFloat(asksXT[0].price).toFixed(
        ExchangePairInfo["bitfinex"]["XDC-USDT"].decimalsPrice
      )
    );
    let minPriceXT = parseFloat(
      parseFloat(bidsXT[0].price).toFixed(
        ExchangePairInfo["bitfinex"]["XDC-USDT"].decimalsPrice
      )
    );

    if (maxPriceXT > maxPriceXU) {
      maxPrice = maxPriceXU;
    } else {
      maxPrice = maxPriceXT;
    }
    if (minPriceXT < minPriceXU) {
      minPrice = minPriceXU;
    } else {
      minPrice = minPriceXT;
    }
  } else if (exchange == "kucoin") {
    orderBookData = await kucoin.orderBook(pair);
    bids = orderBookData.bids;
    asks = orderBookData.asks;
    maxPrice = parseFloat(
      parseFloat(asks[0][0]).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
    minPrice = parseFloat(
      parseFloat(bids[0][0]).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
  } else if (exchange == "bittrex") {
    orderBookData = await bittrex.orderBook(pair);
    bids = orderBookData.bids;
    asks = orderBookData.asks;
    maxPrice = parseFloat(
      parseFloat(asks[0].rate).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
    minPrice = parseFloat(
      parseFloat(bids[0].rate).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
  } else if (exchange == "huobi") {
    orderBookData = await huobi.orderBook(pair);
    bids = orderBookData.bids;
    asks = orderBookData.asks;
    maxPrice = parseFloat(
      parseFloat(asks[0][0]).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
    minPrice = parseFloat(
      parseFloat(bids[0][0]).toFixed(
        ExchangePairInfo[exchange][pair].decimalsPrice
      )
    );
  }

  return { maxPrice, minPrice };
};

exports.GetAccount = async (exchange) => {
  const data = await exchangeData.findOne({ exchange });
  if (data) {
    if (exchange == "kucoin") {
      return {
        apiKey: GetDecryptedEnv(data.apiKey),
        apiSecret: GetDecryptedEnv(data.apiSecret),
        passPhrase: GetDecryptedEnv(data.passPhrase),
        subAccUserId:
          data.subAccUserId != "" ? GetDecryptedEnv(data.subAccUserId) : "",
      };
    } else if (exchange == "huobi") {
      return {
        apiKey: GetDecryptedEnv(data.apiKey),
        apiSecret: GetDecryptedEnv(data.apiSecret),
        accountId: GetDecryptedEnv(data.accountId),
      };
    } else {
      return {
        apiKey: GetDecryptedEnv(data.apiKey),
        apiSecret: GetDecryptedEnv(data.apiSecret),
      };
    }
  } else {
    return null;
  }
};

/**
 *
 * @param {String} exchange exchange name
 * @param {Object} reqData
 * @param {Object} reqData.orderId orderId as per exchange
 * @param {Object} reqData.pair pair name
 * @param {Object} reqData.apiKey api key from env
 * @param {Object} reqData.apiSecret apie secret from env
 */
exports.GetOrderStatus = async (exchange, reqData) => {
  try {
    if (
      reqData.orderId == "error" ||
      reqData.orderId == null ||
      reqData.orderId == ""
    )
      return { status: "cancelled", filledQty: 0, fees: 0, feeCurrency: "USD" };
    const converter = JSON.parse(await RedisClient.get("converterPrice"));
    let amountDecimals =
      ExchangePairInfo[exchange][reqData.pair].decimalsAmount;
    let status,
      filledQty = 0,
      responseData,
      remainingAmount,
      fees = 0,
      feeCurrency = "USD",
      feesUSDT = 0;
    if (exchange == "bitrue") {
      responseData = await bitrue.orderStatus(reqData);
      reqData.price = responseData.price;
      reqData.usdtPrice = parseFloat(
        parseFloat(
          responseData.price * converter[getSecondaryPair(reqData.pair)].bid[0]
        ).toFixed(6)
      );
      status = responseData.status;
      if (status == "FILLED") {
        status = "completed";
      } else if (status == "CANCELED") {
        status = "cancelled";
      } else {
        status = "active";
      }
      if (status == "completed") {
        filledQty = responseData.origQty;
      } else {
        filledQty = parseFloat(responseData.executedQty).toFixed(
          amountDecimals
        );
      }
      // let feePer = 0.00098;
      // if (reqData.pair.split("-")[1] == "XRP") {
      //   feePer = 0.0028;
      // } else if (reqData.pair.split("-")[0] == "XRP") {
      //   feePer = 0.002;
      // }
      // if (reqData.type == "buy") {
      //   feeCurrency = reqData.pair.split("-")[0];
      //   fees = filledQty * feePer;
      // } else {
      //   feeCurrency = reqData.pair.split("-")[1];
      //   fees = filledQty * reqData.price * feePer;
      // }
      fees = 0;
      feeCurrency = "USDT";
    } else if (exchange == "bitfinex") {
      reqData.nonce = await bitfinex.GetNonce();
      responseData = await bitfinex.orderStatus(reqData);
      await bitfinex.releaseNonce();
      filledQty = parseFloat(responseData.executed_amount);
      remainingAmount = parseFloat(responseData.remaining_amount);
      if (responseData.remaining_amount == 0) {
        status = "completed";
      } else if (responseData.is_cancelled == true) {
        status = "cancelled";
      } else {
        status = "active";
      }
      reqData.nonce = await bitfinex.GetNonce();
      responseData = await bitfinex.orderTrades(reqData);
      await bitfinex.releaseNonce();
      if (responseData && responseData != "error") {
        for (let i = 0; i < responseData.length; i++) {
          if (Math.abs(responseData[i][9]) > 0) {
            fees = fees + Math.abs(responseData[i][9]);
            feeCurrency = responseData[i][10];
          }
        }
      }
    } else if (exchange == "kucoin") {
      responseData = await kucoin.orderStatus(reqData);
      filledQty = parseFloat(responseData.dealSize);
      status = responseData.isActive;
      if (status == true) {
        status = "active";
      } else if (status == false && responseData.cancelExist == true) {
        status = "cancelled";
      } else {
        status = "completed";
      }
      fees = responseData.fee;
      feeCurrency = responseData.feeCurrency;
    } else if (exchange == "bittrex") {
      responseData = await bittrex.orderStatus(reqData);
      filledQty = parseFloat(responseData.fillQuantity);
      status = responseData.status;
      remainingAmount =
        parseFloat(responseData.quantity) -
        parseFloat(responseData.fillQuantity);
      if (remainingAmount == 0 && status == "CLOSED") {
        status = "completed";
      } else if (remainingAmount > 0 && status == "CLOSED") {
        status = "cancelled";
      } else {
        status = "active";
      }
      fees = responseData.commission;
      feesUSDT = responseData.commission;
      feeCurrency = "USDT";
    } else if (exchange == "gateio") {
      responseData = await gateio.orderStatus(reqData);
      filledQty = parseFloat(
        parseFloat(responseData.amount) - parseFloat(responseData.left)
      );
      status = responseData.status;
      fees = responseData.fee;
      feeCurrency = responseData.fee_currency;
      if (status == "closed") {
        status = "completed";
      } else if (status == "cancelled") {
        status = "cancelled";
      } else {
        status = "active";
      }
    } else if (exchange == "huobi") {
      responseData = await huobi.orderStatus(reqData);
      filledQty = parseFloat(
        responseData.data["field-amount"] || responseData.data["filled-amount"]
      );
      status = responseData.data.state;
      if (status == "canceled" || status == "partial-canceled") {
        status = "cancelled";
      } else if (status == "filled") {
        status = "completed";
      } else {
        status = "active";
      }
      if (reqData.type == "buy") {
        fees = filledQty * 0.002;
        feeCurrency = reqData.pair.split("-")[0];
      } else {
        fees = filledQty * reqData.price * 0.002;
        feeCurrency = reqData.pair.split("-")[1];
      }
    }

    filledQty = parseFloat(filledQty);
    if (isNaN(filledQty)) filledQty = 0;
    if (isNaN(fees)) fees = 0;
    feesUSDT = fees * (converter[`${feeCurrency}-USDT`].bid[0] || 0);
    if (filledQty > 0) {
      await updateCompletedOrders(reqData, {
        status,
        filledQty,
        fees,
        feeCurrency,
        feesUSDT,
        updatedTotal: filledQty * reqData.price,
        price: reqData.price,
      });
    }
    return {
      status,
      filledQty,
      fees,
      feeCurrency,
      feesUSDT,
      updatedTotal: filledQty * reqData.price,
      price: reqData.price,
    };
  } catch (e) {
    logger.error(":GetOrderStatus", e);
    return {
      status: "active",
      filledQty: 0,
      fees: 0,
      feeCurrency: "USD",
      feesUSDT: 0,
      updatedTotal: 0,
      price: reqData.price,
    };
  }
};

exports.GetMaxMinPriceVB = async (exchange, pair) => {
  try {
    const orderBook = JSON.parse(await RedisClient.get("bestPriceBook"));
    const converter = JSON.parse(await RedisClient.get("converterPrice"));
    let i, maxPriceUSDT, minPriceUSDT;
    for (i = 0; i < orderBook.asks.length; i++) {
      if (orderBook.asks[i].pair.split("-")[0] == pair.split("-")[0]) {
        maxPriceUSDT = parseFloat(
          parseFloat(orderBook.asks[i].cask).toFixed(6)
        );
        break;
      }
    }
    for (i = 0; i < orderBook.asks.length; i++) {
      if (orderBook.bids[i].pair.split("-")[0] == pair.split("-")[0]) {
        minPriceUSDT = parseFloat(
          parseFloat(orderBook.bids[i].cbid).toFixed(6)
        );
        break;
      }
    }
    if (minPriceUSDT >= maxPriceUSDT) {
      minPriceUSDT = parseFloat(parseFloat(maxPriceUSDT * 0.985).toFixed(6));
    }
    const maxPrice = parseFloat(
      parseFloat(
        maxPriceUSDT / converter[getSecondaryPair(pair)].ask[0]
      ).toFixed(ExchangePairInfo[exchange][pair].decimalsPrice)
    );
    const minPrice = parseFloat(
      parseFloat(
        minPriceUSDT / converter[getSecondaryPair(pair)].bid[0]
      ).toFixed(ExchangePairInfo[exchange][pair].decimalsPrice)
    );
    return { maxPrice, minPrice };
  } catch (error) {
    logger.error("orderPlacement_GetMaxMinPriceVB_error", error);
    return { maxPrice: 0, minPrice: 0 };
  }
};

InternalBus.on(GlobalEvents.mongodb_connected, async () => {
  try {
    await SyncExchangeInfo();
  } catch (e) {
    logger.error(e);
  }
});

InternalBus.on(GlobalEvents.exchange_pair_updated, async () => {
  try {
    await SyncExchangeInfo();
  } catch (e) {
    logger.error(e);
  }
});

InternalBus.on(GlobalEvents.exchange_updated, async () => {
  try {
    await SyncExchangeInfo();
  } catch (e) {
    logger.error(e);
  }
});

async function SyncExchangeInfo() {
  const allExchanges = await ExchangePair.find({}).lean();
  const arbitrageOperations = await ArbitrageOperations.findOne({}).lean();
  for (let exchangeObj of allExchanges) {
    exchangeObj.pair.forEach((data) => {
      if (!ExchangePairInfo[exchangeObj.exchange]) {
        ExchangePairInfo[exchangeObj.exchange] = {};
      }
      if (!ExchangePairInfo[exchangeObj.exchange][data.name]) {
        ExchangePairInfo[exchangeObj.exchange][data.name] = {};
      }
      ExchangePairInfo[exchangeObj.exchange][data.name] = {
        decimalsAmount:
          data.decimalsAmount ||
          ExchangePairInfoDef[exchangeObj.exchange][data.name].decimalsAmount ||
          0,

        decimalsPrice:
          data.decimalsPrice ||
          ExchangePairInfoDef[exchangeObj.exchange][data.name].decimalsPrice ||
          0,

        minAmount:
          data.minAmount ||
          ExchangePairInfoDef[exchangeObj.exchange][data.name].minAmount ||
          arbitrageOperations.minAmount[data.name.split("-")[0]] ||
          0,
        maxAmount:
          data.maxAmount ||
          ExchangePairInfoDef[exchangeObj.exchange][data.name].maxAmount ||
          arbitrageOperations.maxAmount[data.name.split("-")[0]] ||
          0,
      };
    });
  }
  logger.debug(":orderPlacement decimals synced");
  setExchangePairInfo(ExchangePairInfo);
  socket_io.in("best_price").emit("exchangePairInfo", ExchangePairInfo);
}

exports.WalletBalance = async (exchange, accountData) => {
  try {
    let walletData = [],
      responseData,
      array = {},
      i,
      balanceArray = [];
    const exchangeData = await exchangeCurrencies.findOne({ exchange });
    switch (exchange) {
      case "bitrue":
        responseData = await bitrue.walletBalance(accountData);
        for (i = 0; i < exchangeData.currency.length; i++) {
          if (
            responseData.balances.some(
              (e) => e.asset == exchangeData.currency[i].exchangeSymbol
            )
          ) {
            const data = responseData.balances.filter(
              (e) => e.asset == exchangeData.currency[i].exchangeSymbol
            )[0];
            array = {};
            array.currency = exchangeData.currency[i].symbol;
            array.balance = parseFloat(data.free);
            array.inTrade = parseFloat(data.locked);
            array.minBalance =
              typeof exchangeData.currency[i].minimumBalance !==
              typeof undefined
                ? exchangeData.currency[i].minimumBalance
                : 0;
            array.minArbBalance =
              typeof exchangeData.currency[i].minArbBalance !== typeof undefined
                ? exchangeData.currency[i].minArbBalance
                : 0;
            array.total = array.balance + array.inTrade;
            walletData.push(array);
          }
        }
        break;
      case "bitfinex":
        accountData.nonce = await bitfinex.GetNonce();
        responseData = await bitfinex.walletBalance(accountData);
        await bitfinex.releaseNonce();
        for (i = 0; i < exchangeData.currency.length; i++) {
          if (
            responseData.some(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                (e.type == "exchange" || e.type == "trading")
            )
          ) {
            const data = responseData.filter(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                e.type == "exchange"
            )[0];
            const data1 = responseData.filter(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                e.type == "trading"
            )[0];
            array = {};
            array.currency = exchangeData.currency[i].symbol;
            array.balance = parseFloat(data ? data.available : 0);
            array.total = parseFloat(
              parseFloat(data ? data.amount : 0) +
                parseFloat(data1 ? data1.amount : 0)
            );
            array.minBalance =
              typeof exchangeData.currency[i].minimumBalance !==
              typeof undefined
                ? exchangeData.currency[i].minimumBalance
                : 0;
            array.minArbBalance =
              typeof exchangeData.currency[i].minArbBalance !== typeof undefined
                ? exchangeData.currency[i].minArbBalance
                : 0;
            array.inTrade = array.total - array.balance;
            walletData.push(array);
          }
        }
        break;
      case "kucoin":
        responseData = await kucoin.walletBalance(accountData);
        for (i = 0; i < exchangeData.currency.length; i++) {
          if (
            responseData.some(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                (e.type == "trade" || e.type == "main")
            )
          ) {
            const data = responseData.filter(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                e.type == "trade"
            )[0];
            const data1 = responseData.filter(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                e.type == "main"
            )[0];
            array = {};
            array.currency = exchangeData.currency[i].symbol;
            array.balance = parseFloat(data ? data.available : 0);
            array.total = parseFloat(
              parseFloat(data ? data.balance : 0) +
                parseFloat(data1 ? data1.balance : 0)
            );
            array.minBalance =
              typeof exchangeData.currency[i].minimumBalance !==
              typeof undefined
                ? exchangeData.currency[i].minimumBalance
                : 0;
            array.minArbBalance =
              typeof exchangeData.currency[i].minArbBalance !== typeof undefined
                ? exchangeData.currency[i].minArbBalance
                : 0;
            array.inTrade = array.total - array.balance;
            walletData.push(array);
          }
        }
        break;
      case "bittrex":
        responseData = await bittrex.walletBalance(accountData);
        for (i = 0; i < exchangeData.currency.length; i++) {
          if (
            responseData.some(
              (e) => e.currencySymbol == exchangeData.currency[i].exchangeSymbol
            )
          ) {
            const data = responseData.filter(
              (e) => e.currencySymbol == exchangeData.currency[i].exchangeSymbol
            )[0];
            array = {};
            array.currency = exchangeData.currency[i].symbol;
            array.balance = parseFloat(data.available);
            array.total = parseFloat(data.total);
            array.minBalance =
              typeof exchangeData.currency[i].minimumBalance !==
              typeof undefined
                ? exchangeData.currency[i].minimumBalance
                : 0;
            array.minArbBalance =
              typeof exchangeData.currency[i].minArbBalance !== typeof undefined
                ? exchangeData.currency[i].minArbBalance
                : 0;
            array.inTrade = array.total - array.balance;
            walletData.push(array);
          }
        }
        break;
      case "gateio":
        responseData = await gateio.walletBalance(accountData);
        for (i = 0; i < exchangeData.currency.length; i++) {
          if (
            responseData.some(
              (e) => e.currency == exchangeData.currency[i].exchangeSymbol
            )
          ) {
            const data = responseData.filter(
              (e) => e.currency == exchangeData.currency[i].exchangeSymbol
            )[0];
            array = {};
            array.currency = exchangeData.currency[i].symbol;
            array.balance = parseFloat(data.available);
            array.inTrade = parseFloat(data.locked);
            array.minBalance =
              typeof exchangeData.currency[i].minimumBalance !==
              typeof undefined
                ? exchangeData.currency[i].minimumBalance
                : 0;
            array.minArbBalance =
              typeof exchangeData.currency[i].minArbBalance !== typeof undefined
                ? exchangeData.currency[i].minArbBalance
                : 0;
            array.total = array.inTrade + array.balance;
            walletData.push(array);
          }
        }
        break;
      case "huobi":
        responseData = await huobi.walletBalance(accountData);
        for (i = 0; i < exchangeData.currency.length; i++) {
          if (
            responseData.data.list.some(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                (e.type == "trade" || e.type == "frozen")
            )
          ) {
            const data = responseData.data.list.filter(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                e.type == "trade"
            )[0];
            const data1 = responseData.data.list.filter(
              (e) =>
                e.currency == exchangeData.currency[i].exchangeSymbol &&
                e.type == "frozen"
            )[0];
            array = {};
            array.currency = exchangeData.currency[i].symbol;
            array.balance = parseFloat(data ? data.available : 0);
            array.total = parseFloat(
              parseFloat(data ? data.balance : 0) +
                parseFloat(data1 ? data1.balance : 0)
            );
            array.minBalance =
              typeof exchangeData.currency[i].minimumBalance !==
              typeof undefined
                ? exchangeData.currency[i].minimumBalance
                : 0;
            array.minArbBalance =
              typeof exchangeData.currency[i].minArbBalance !== typeof undefined
                ? exchangeData.currency[i].minArbBalance
                : 0;
            array.inTrade = array.total - array.balance;
            walletData.push(array);
          }
        }
        break;
      default:
        break;
    }

    // for (i = 0; i < walletData.length; i++) {
    //   if (parseFloat(walletData[i].balance) < parseFloat(walletData[i].minBalance)) {
    //     mailMsg = mailMsg + `Available balance low for ${walletData[i].currency} in ${exchange}, minimum balance : ${walletData[i].minBalance} current balance : ${walletData[i].balance}<br>`;
    //   }
    // }
    // if (mailMsg != '') {
    //   // const emails = await commonHelper.getEmailsForMail(2);
    //   const emails = [''];
    //   await mail.send(emails, `Balance low in ${exchange} for ${accountData.account}`, mailMsg);
    //   // console.log(mailMsg);
    // }

    return walletData;
  } catch (error) {
    logger.error("orderPlacement_WalletBalance_error", error);
    return [];
  }
};

exports.CancelOrder = async (exchange, reqData) => {
  try {
    switch (exchange) {
      case "bitrue":
        await bitrue.cancelOrder(reqData);
        break;
      case "bitfinex":
        reqData.nonce = await bitfinex.GetNonce();
        await bitfinex.cancelOrder(reqData);
        await bitfinex.releaseNonce();
        break;
      case "kucoin":
        await kucoin.cancelOrder(reqData);
        break;
      case "bittrex":
        await bittrex.cancelOrder(reqData);
        break;
      case "gateio":
        await gateio.cancelOrder(reqData);
        break;
      case "huobi":
        await huobi.cancelOrder(reqData);
        break;
      default:
        break;
    }
    return true;
  } catch (error) {
    logger.error("orderPlacement_CancelOrder_error", error);
    return false;
  }
};

async function updateCompletedOrders(reqData, orderStatus) {
  try {
    const checkOrder = await completedOrders.findOne({
      exchange: reqData.exchange,
      exchangeId: reqData.orderId,
    });
    const pair = reqData.pair;
    const [firstCurrency, secondCurrency] = pair.split("-").map((e) => e);
    let filledQty = orderStatus.filledQty;
    const price = reqData.price;
    let total = filledQty * price;
    let type = reqData.type;
    if (type == "buy") {
      total = total * -1;
    } else {
      filledQty = filledQty * -1;
    }
    if (checkOrder == "" || checkOrder == null) {
      (
        await new completedOrders({
          botType: reqData.botType,
          exchange: reqData.exchange,
          pair: reqData.pair,
          type: type,
          account: reqData.account,
          exchangeId: reqData.orderId,
          price: price,
          usdtPrice: reqData.usdtPrice,
          [firstCurrency]: filledQty,
          [secondCurrency]: total,
          fees: orderStatus.fees,
          feeCurrency: orderStatus.feeCurrency,
          feesUSDT: orderStatus.feesUSDT,
          status: orderStatus.status,
        })
      ).save();
    } else {
      await completedOrders.updateOne(
        { exchange: reqData.exchange, exchangeId: reqData.orderId },
        {
          $set: {
            [firstCurrency]: filledQty,
            [secondCurrency]: total,
            fees: orderStatus.fees,
            feeCurrency: orderStatus.feeCurrency,
            feesUSDT: orderStatus.feesUSDT,
            status: orderStatus.status,
          },
        }
      );
    }
  } catch (error) {
    logger.error("orderPlacement_updateCompletedOrders_error", error);
  }
}

exports.LastTradedPrice = async (exchange, pair) => {
  try {
    let tickerData;
    switch (exchange) {
      case "bitrue":
        tickerData = await bitrue.ticker24Hr(pair);
        return tickerData.lastPrice;
      case "bitfinex":
        tickerData = await bitfinex.ticker24Hr(pair);
        return tickerData.last_price;
      case "kucoin":
        tickerData = await kucoin.ticker24Hr(pair);
        return tickerData.last;
      case "huobi":
        tickerData = await huobi.ticker24Hr(pair);
        return tickerData.tick.close;
      case "gateio":
        tickerData = await gateio.ticker24Hr(pair);
        return tickerData.last;
      default:
        return 0;
    }
  } catch (error) {
    logger.error(`orderPlacement_LastTradedPrice_error`, error);
    return 0;
  }
};

exports.last24HrVolume = async (exchange, pair) => {
  try {
    let tickerData;
    switch (exchange) {
      case "bitfinex":
        tickerData = await bitfinex.ticker24Hr(pair);
        return tickerData.volume;
      case "bitrue":
        tickerData = await bitrue.ticker24Hr(pair);
        return parseFloat(tickerData.volume) * parseFloat(tickerData.lastPrice);
      case "bittrex":
        tickerData = await bittrex.ticker24Hr(pair);
        return tickerData.volume;
      case "gateio":
        tickerData = await gateio.ticker24Hr(pair);
        return tickerData.base_volume;
      case "kucoin":
        tickerData = await kucoin.ticker24Hr(pair);
        return tickerData.vol;
      case "huobi":
        tickerData = await huobi.ticker24Hr(pair);
        return tickerData.tick.amount;
      default:
        return 0;
    }
  } catch (error) {
    logger.error(`orderPlacement_last24HrVolume_error`, error);
    return 0;
  }
};
