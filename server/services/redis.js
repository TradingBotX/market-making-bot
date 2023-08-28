const redis = require("redis");
const Event = require("events");
const { promisify } = require("util");
const uuid = require("uuid").v4;
const logSymbols = require("log-symbols");

const Exchange = require("../models/exchangePair");
const ArbitrageOperations = require("../models/arbitrageOperations");
const {
  ExchangePairInfo,
  converterPairs,
  UsdtPairs,
} = require("../helpers/constant.js");

const RedisEmitter = new Event.EventEmitter();

let updateGlobalOrderbookQueue = {};
const exchangeWorkers = {};
const converter = {
  "USDT-USDT": {
    bid: [1],
    ask: [1],
  },
  "USDC-USDT": {
    bid: [1],
    ask: [1],
  },
  "UST-USDT": {
    bid: [1],
    ask: [1],
  },
  "USD-USDT": {
    bid: [1],
    ask: [1],
  },
  "DUSD-USDT": {
    bid: [1],
    ask: [1],
  },
  "IDR-USDT": {
    bid: [0.000069],
    ask: [0.000069],
  },
  "JPY-USDT": {
    bid: [0.009],
    ask: [0.009],
  },
  "SGD-USDT": {
    bid: [0.72],
    ask: [0.72],
  },
  "INR-USDT": {
    bid: [0.014],
    ask: [0.014],
  },
  "USDG-USDT": {
    bid: [1],
    ask: [1],
  },
  "LUNA-USDT": {
    bid: [0],
    ask: [0],
  },
  "USPLUS-USDT": {
    bid: [1.0001],
    ask: [0.9999],
  },
  "FXD-USDT": {
    bid: [1.0001],
    ask: [0.9999],
  },
};
const TradeFee = {};
const ArbitradeOperations = {
  minPrice: 0,
  minAmount: {},
  maxAmount: {},
  minPriceBy: [],
  connections: {},
  connectionDetails: {},
  status: false,
};

let converter_started = {};

/**
 * @var exchanges list og exchange name consistently fetched from the database
 */
let exchanges = [];

/**
 * This file will export 'promisified instances of GET & SET'.
 *
 * @todo
 *  - add reconnection strategy -> emitting events & fetching latest pulls from ws/apis
 *  - benchmark the speed improvisation over 100% mongo save
 */

const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || "6379",
  prefix: process.env.REDIS_PREFIX || "MMBot",
  socket_keepalive: true,
  retry_max_delay: 10000,
});

const RedisGet = promisify(client.get).bind(client);
const RedisSet = promisify(client.set).bind(client);

client
  .on("connect", () => {
    logger.info(`[`, logSymbols.success, `] redis client connected`);
  })
  .on("error", function (error) {
    console.log("here", error);
  });

/*
---------------------------------------------------------------------------------
                      Classes Starts
---------------------------------------------------------------------------------
*/

class MatchMaker {
  constructor() {
    this.pendingCount = 0;
    this.obpendingCount = 0;
    this.inUse = false;
    this.obinUse = false;
  }

  async scanOrderbook() {
    try {
      if (this.inUse === true) {
        this.pendingCount++;
        return;
      }

      logger.debug("[*] scanning orderbook");

      this.inUse = true;

      // ---------------- Check Arbitrage Starts

      const allNamespaces = Object.keys(exchangeWorkers).map(
        (k) => exchangeWorkers[k].namespace
      );

      const prices = {},
        priceTableBid = [],
        priceTableAsk = [];

      for (let currName of allNamespaces) {
        const [exchange, pair] = parseNameSpace(currName);
        const orderbook = JSON.parse(await RedisGet(currName));
        prices[exchange] = prices[exchange] || {};

        let formatedBook = parseOrderbook(exchange, {
          bid: orderbook.bids[0],
          ask: orderbook.asks[0],
        });

        let x = 0,
          y = 0;
        while (
          formatedBook.bid[1] < ExchangePairInfo[exchange][pair].minAmount &&
          x < orderbook.bids.length
        ) {
          x++;
          formatedBook = parseOrderbook(exchange, {
            bid: orderbook.bids[x],
            ask: orderbook.asks[0],
          });
        }
        while (
          formatedBook.ask[1] < ExchangePairInfo[exchange][pair].minAmount &&
          y < orderbook.asks.length
        ) {
          y++;
          formatedBook = parseOrderbook(exchange, {
            bid: orderbook.bids[x],
            ask: orderbook.asks[y],
          });
        }

        prices[exchange][pair] = {
          ...formatedBook,
          cbid: formatedBook.bid[0] * converter[getSecondaryPair(pair)].bid[0],
          // *0.995
          cask: formatedBook.ask[0] * converter[getSecondaryPair(pair)].ask[0],
          // *1.0015
        };

        priceTableBid.push({
          bid: formatedBook.bid[0],
          exchange,
          pair,
          amount: formatedBook.bid[1],
          cbid: formatedBook.bid[0] * converter[getSecondaryPair(pair)].bid[0],
          // *0.9985
        });

        priceTableAsk.push({
          ask: formatedBook.ask[0],
          exchange,
          pair,
          amount: formatedBook.ask[1],
          cask: formatedBook.ask[0] * converter[getSecondaryPair(pair)].ask[0],
          // *1.0015
        });
      }

      socket_io.in("best_price").emit("global_book", prices);

      let bids = priceTableBid;
      let asks = priceTableAsk;

      bids.sort((a, b) => parseFloat(b.cbid) - parseFloat(a.cbid));
      asks.sort((a, b) => parseFloat(a.cask) - parseFloat(b.cask));

      await RedisSet("bestPriceBook", JSON.stringify({ asks, bids }));

      socket_io
        .in("best_price")
        .emit("calculateOrders", { bid: priceTableBid, ask: priceTableAsk });

      this.inUse = false;
      if (this.pendingCount > 0) {
        this.pendingCount--;
        await this.scanOrderbook();
      }
    } catch (e) {
      logger.error("redis_scanOrderBook_error", e);
      this.pendingCount = 0;
      this.inUse = false;
    }
  }
}

class Worker {
  constructor(_namespace) {
    this.queue = [];
    this.busy = false;
    this.namespace = _namespace;
  }

  async process(data) {
    const parentSelf = this;

    try {
      if (this.busy === true) {
        this.queue.push(data);
      } else {
        this.busy = true;
        await RedisSet(this.namespace, data);
        this.queue.shift();
        this.busy = false;
        if (this.queue.length > 0) {
          parentSelf.process(this.queue[0]);
        }
      }
    } catch (e) {
      logger.error(`redis worker error`, e);
    }
  }

  getState() {
    return this.busy;
  }

  getQueue() {
    return this.queue;
  }

  getQueueLength() {
    return this.queue.length;
  }
}

/*
---------------------------------------------------------------------------------
                      Classes Stop
---------------------------------------------------------------------------------
*/

// RedisEmitter.on("sync-book", async () => {});

/**
 * Global orderbook queue funcs
 */

// function removeFromQueue(exchangeName, pairName) {
//   if (exchanges.includes(exchangeName)) {
//     const key = getBookNameSpace(exchangeName, pairName);
//     const i = updateGlobalOrderbookQueue[exchangeName].indexOf(key);
//     if (i >= 0) {
//       updateGlobalOrderbookQueue = updateGlobalOrderbookQueue[
//         exchangeName
//       ].splice(i, 1);
//     }
//     return true;
//   }
//   return false;
// }

/*
---------------------------------------------------------------------------------
                      Event Listeners Start
---------------------------------------------------------------------------------
*/

const newMatchMaker = new MatchMaker();

InternalBus.on(GlobalEvents.mongodb_connected, async () => {
  SyncNamespaces();
  SyncTradeFee();
  SyncArbitrageOperations();
});

InternalBus.on(GlobalEvents.arbitrage_updated, async () => {
  SyncArbitrageOperations();
});

InternalBus.on(GlobalEvents.best_price, async () => {
  if (converter_started["BTC-USDT"]) {
    await newMatchMaker.scanOrderbook();
  }
});

InternalBus.on(GlobalEvents.exchange_orderbook_update, async (data) => {
  try {
    logger.debug("event -> exchange_orderbook_update");
    const { exchangeName, pair, orderbook } = data;
    const key = getBookNameSpace(exchangeName, pair);
    if (exchangeWorkers[key]) {
      await exchangeWorkers[key].process(orderbook);
      if (converter_started[getSecondaryPair(pair)]) {
        await newMatchMaker.scanOrderbook();
      }
      let { bids, asks } = JSON.parse(await RedisGet(key));
      socket_io
        .in(`${exchangeName}__${pair}`)
        .emit(`${exchangeName}__${pair}`, { bids, asks });
    }
  } catch (e) {
    logger.error(`error at exchange_orderbook_update:`, e);
  }
});

InternalBus.on(GlobalEvents.exchange_activated, () => {
  SyncNamespaces();
});

InternalBus.on(GlobalEvents.exchange_deactivated, () => {
  SyncNamespaces();
});

InternalBus.on(GlobalEvents.exchange_pair_updated, () => {
  SyncNamespaces();
});

InternalBus.on(GlobalEvents.converter_price, (data) => {
  try {
    Object.keys(data).forEach(async (pair) => {
      let updatedAt = "",
        minuteDifference,
        currentTime = new Date();
      if (converterPairs.includes(pair)) {
        if (pair in converter) {
          if (converter[pair].bid && converter[pair].ask) {
            if (
              converter[pair].bid[0] == data[pair].bid[0] ||
              converter[pair].ask[0] == data[pair].ask[0]
            ) {
              let lastUpdatedAt = converter[pair].updatedAt;
              if (lastUpdatedAt) {
                lastUpdatedAt = new Date(lastUpdatedAt);
                minuteDifference = parseInt(
                  (currentTime - lastUpdatedAt) / 1000 / 60
                );
                if (minuteDifference > 15) {
                  // const emails = await commonHelper.getEmailsForMail(2);
                  // const emails = [""];
                  // await mail.send(
                  //   emails,
                  //   `Converter Rate not updated in ${pair}.`,
                  //   `Converter Rate not updated in ${pair}, since ${minuteDifference} minutes, please check.<br> Previous data : ${JSON.stringify(
                  //     converter[pair]
                  //   )},<br> Current Data : ${JSON.stringify(data[pair])}.`
                  // );
                }
                updatedAt = lastUpdatedAt;
              }
            }
          }
        }
      }
      if (updatedAt == "") {
        updatedAt = currentTime;
      }
      updatedAt = new Date(updatedAt);
      data[pair].updatedAt = updatedAt;
      converter[pair] = data[pair];
      await RedisSet("converterPrice", JSON.stringify(converter));
    });
  } catch (e) {
    logger.error(e);
  }
});

InternalBus.on(GlobalEvents.converter_started, (pair) => {
  try {
    converter_started[pair] = true;
  } catch (e) {
    logger.error(e);
  }
});

/*
---------------------------------------------------------------------------------
                      Event Listeners Stop
---------------------------------------------------------------------------------
*/

/*
---------------------------------------------------------------------------------
                      Helper Function Starts
---------------------------------------------------------------------------------
*/

/**
 *
 * parses as per front-end function
 *
 * @param {Object} data prices as per format
 */
function parsePrices(data) {
  let x = [];

  Object.keys(data).forEach((exchangeName) => {
    Object.keys(data[exchangeName]).forEach((pair) => {
      x.push({
        pair,
        exchangeName,
        buy: parseFloat(data[exchangeName][pair].bid[0]),
        amount: parseFloat(data[exchangeName][pair].bid[1]),
        cbuy: parseFloat(data[exchangeName][pair].cbid),
      });
    });
  });

  x.sort((a, b) => b.cbuy - a.cbuy);

  return x;
}

async function SyncTradeFee() {
  try {
    const resp = await Exchange.find({ disabled: false }).lean();
    for (let { exchange, tradeFee } of resp) {
      TradeFee[exchange] = tradeFee;
    }
  } catch (e) {
    logger.error(e);
  }
}

async function SyncNamespaces() {
  {
    try {
      logger.debug("fetching exchange names");
      const resp = await Exchange.find({}).lean();
      let newNamespaces = resp.reduce((acc, { exchange, pair, disabled }) => {
        if (disabled) {
          pair.forEach(({ name }) => {
            let currNamespace = getBookNameSpace(exchange, name);
            exchangeWorkers[currNamespace] = undefined;
            delete exchangeWorkers[currNamespace];
          });

          return acc;
        }
        pair.forEach(({ name }) => {
          acc.push(getBookNameSpace(exchange, name));
        });
        return acc;
      }, []);
      logger.debug(":SyncNamespaces", newNamespaces);
      logger.debug("fetched exchange names");
      for (let currNamespace of newNamespaces) {
        if (exchangeWorkers.hasOwnProperty(currNamespace) !== true) {
          // spawn a worker
          exchangeWorkers[currNamespace] = new Worker(currNamespace);
        }
      }
    } catch (e) {
      logger.error(
        `Error at ${__filename} while fetching exchange names: `,
        {
          error: e,
        },
        { after: "as" },
        "asd"
      );
    }
  }
}

async function SyncArbitrageOperations() {
  try {
    const arbitrageOperations = await ArbitrageOperations.findOne({}).lean();
    if (arbitrageOperations === null) {
      logger.debug("no arbitrage operations set, using default");
    } else {
      ArbitradeOperations["minAmount"] = arbitrageOperations.minAmount;
      ArbitradeOperations["maxAmount"] = arbitrageOperations.maxAmount;
      ArbitradeOperations["minPriceBy"] = arbitrageOperations.minPriceBy;
      ArbitradeOperations["minPrice"] = arbitrageOperations.minPrice;
      const connections = arbitrageOperations.exchangeConnection;
      ArbitradeOperations.connections = connections;
      ArbitradeOperations.connectionDetails =
        arbitrageOperations.connectionDetails;
      ArbitradeOperations["status"] = arbitrageOperations.status || false;
      logger.debug(":SyncArbitrageOperations redis");
    }
    socket_io.emit("arbitrageOperations", ArbitradeOperations);
  } catch (e) {
    logger.error(`redis_SyncArbitrageOperations_error`, e);
  }
}

function parseOrderbook(exchange, book) {
  try {
    switch (exchange) {
      case "bitrue": {
        return {
          bid: book.bid.slice(0, 2),
          ask: book.ask.slice(0, 2),
        };
      }
      case "bitfinex": {
        return {
          bid: [parseFloat(book.bid.price), parseFloat(book.bid.amount)],
          ask: [parseFloat(book.ask.price), parseFloat(book.ask.amount)],
        };
      }
      case "kucoin": {
        return {
          bid: [parseFloat(book.bid[0]), parseFloat(book.bid[1])],
          ask: [parseFloat(book.ask[0]), parseFloat(book.ask[1])],
        };
      }
      case "bittrex": {
        return {
          bid: [parseFloat(book.bid.rate), parseFloat(book.bid.quantity)],
          ask: [parseFloat(book.ask.rate), parseFloat(book.ask.quantity)],
        };
      }
      case "gateio": {
        return {
          bid: [parseFloat(book.bid[0]), parseFloat(book.bid[1])],
          ask: [parseFloat(book.ask[0]), parseFloat(book.ask[1])],
        };
      }
      case "huobi": {
        return {
          bid: [parseFloat(book.bid[0]), parseFloat(book.bid[1])],
          ask: [parseFloat(book.ask[0]), parseFloat(book.ask[1])],
        };
      }
    }
  } catch (error) {
    logger.error(`redis_parseOrderBook_error`, error, exchange, book);
    return {
      bid: [],
      ask: [],
    };
  }
}

function parseCompleteOrderBook(exchange, book) {
  try {
    let bidArray = [],
      askArray = [],
      i;
    switch (exchange) {
      case "bitrue": {
        for (i = 0; i < book.bid.length && i < 10; i++) {
          bidArray.push(book.bid[i].slice(0, 2));
        }
        for (i = 0; i < book.ask.length && i < 10; i++) {
          askArray.push(book.ask[i].slice(0, 2));
        }
        return {
          bid: bidArray,
          ask: askArray,
        };
      }
      case "bitfinex": {
        for (i = 0; i < book.bid.length && i < 10; i++) {
          bidArray.push([book.bid[i].price, book.bid[i].amount]);
        }
        for (i = 0; i < book.ask.length && i < 10; i++) {
          askArray.push([book.ask[i].price, book.ask[i].amount]);
        }
        return {
          bid: bidArray,
          ask: askArray,
        };
      }
      case "kucoin": {
        for (i = 0; i < book.bid.length && i < 10; i++) {
          bidArray.push([book.bid[i][0], book.bid[i][1]]);
        }
        for (i = 0; i < book.ask.length && i < 10; i++) {
          askArray.push([book.ask[i][0], book.ask[i][1]]);
        }
        return {
          bid: bidArray,
          ask: askArray,
        };
      }
      case "bittrex": {
        for (i = 0; i < book.bid.length && i < 10; i++) {
          bidArray.push([book.bid[i].rate, book.bid[i].quantity]);
        }
        for (i = 0; i < book.ask.length && i < 10; i++) {
          askArray.push([book.ask[i].rate, book.ask[i].quantity]);
        }
        return {
          bid: bidArray,
          ask: askArray,
        };
      }
      case "gateio": {
        for (i = 0; i < book.bid.length && i < 10; i++) {
          bidArray.push([book.bid[i][0], book.bid[i][1]]);
        }
        for (i = 0; i < book.ask.length && i < 10; i++) {
          askArray.push([book.ask[i][0], book.ask[i][1]]);
        }
        return {
          bid: bidArray,
          ask: askArray,
        };
      }
      case "huobi": {
        for (i = 0; i < book.bid.length && i < 10; i++) {
          bidArray.push([book.bid[i][0], book.bid[i][1]]);
        }
        for (i = 0; i < book.ask.length && i < 10; i++) {
          askArray.push([book.ask[i][0], book.ask[i][1]]);
        }
        return {
          bid: bidArray,
          ask: askArray,
        };
      }
    }
  } catch (error) {
    logger.error(`redis_parseCompleteOrderBook_error`, error);
    return {
      bid: [],
      ask: [],
    };
  }
}

exports.parseCompleteOrderBook = parseCompleteOrderBook;

function MinOf(a, b) {
  return parseFloat(a) <= parseFloat(b) ? parseFloat(a) : parseFloat(b);
}

exports.MinOf = MinOf;

/*
---------------------------------------------------------------------------------
                      Helper Function Stops
---------------------------------------------------------------------------------
*/

/**
 *
 * @todo use determistic hash func. to get a smaller namespace
 * return a unique & deterministic namespace as per exchangename & pairName
 * @param {string} exchangeName
 * @param {string} pairName
 */
function getBookNameSpace(exchangeName, pairName) {
  return `${exchangeName}__${pairName}`;
}

function parseNameSpace(namespace) {
  return namespace.split("__");
}

function getSecondaryPair(pair) {
  return `${pair.split("-")[1]}-USDT`;
}

exports.getSecondaryPair = getSecondaryPair;

exports.RedisClient = {
  client: client,
  get: RedisGet,
  set: RedisSet,
};

exports.RedisEmitter = RedisEmitter;
