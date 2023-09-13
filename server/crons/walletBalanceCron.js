const CronJob = require("cron").CronJob;
const CronTime = require("cron").CronTime;
const moment = require("moment");
const _ = require("lodash");

const ExchangePair = require("../models/exchangePair");
const ExchangeCurrencies = require("../models/exchangeCurrencies");

const { ConvertToCronTime, Sleep } = require("../helpers/commonHelper");
const { RedisClient } = require("../services/redis");
// const { GetOrderBookFunction } = require("../helpers/abstractedFunction");
const { WalletBalance, GetAccount } = require("../helpers/orderPlacement");

const ExchangeToCron = new Map();
let exchanges = [];

const DefaultCronTime = "*/5 * * * *";

/**
 * @note create crons as per exchange
 */
// const job = new CronJob(
//   process.env.CRON_TIME || DefaultCronTime,
//   async function () {
//     try {
//       await fetchAllOrderbook();
//     } catch (e) {
//       logger.error(e);
//     }
//   },
//   null,
//   true,
//   "America/Los_Angeles"
// );

// job.start();

// --------------------------------- CRON API START -------------------------------------------------

exports.RestartCron = RestartCron;

exports.StopCron = StopCron;

exports.ChangeCronTime = ChangeCronTime;

exports.GetAllCronStatus = GetAllCronStatus;

exports.RunNow = RunNow;
// --------------------------------- CRON API STOP --------------------------------------------------

/**
 * will resatrt cron associated with an exchange
 * @param {string} exchange name of exchange
 */
async function RestartCron(exchange) {
  try {
    logger.debug(":restartcron");
    if (!ExchangeToCron.has(exchange)) return null;
    const cron = ExchangeToCron.get(exchange);
    if (cron.running === true) cron.stop();
    ExchangeToCron.set(exchange, createCron(exchange));
    logger.debug(":restartcron :success");
    return true;
  } catch (e) {
    logger.debug(":restartcron :error");
    logger.error(e);
    return null;
  }
}

/**
 * will stop the cron associated with the exchange
 * @param {string} exchange name of exchange
 */
function StopCron(exchange) {
  try {
    logger.debug(":stopcron", exchange, ExchangeToCron.has(exchange));
    if (!ExchangeToCron.has(exchange)) return null;
    const cron = ExchangeToCron.get(exchange);
    if (cron.running === true) {
      logger.debug(":stopcron :success");
      cron.stop();
    }
    return true;
  } catch (e) {
    logger.debug(":stopcron :error");
    logger.error(e);
    return null;
  }
}

/**
 * will update the cron-time for an exchange
 * @param {string} exchange name of the exchange
 * @param {string} time cron-time
 */
function ChangeCronTime(exchange, { minuteStep = 0, secondStep = 0 }) {
  try {
    logger.debug(":changecrontime");
    if (!ExchangeToCron.has(exchange)) return null;
    const cronTime = ConvertToCronTime({ minuteStep, secondStep });
    const cron = ExchangeToCron.get(exchange);
    cron.stop();
    ExchangeToCron.set(exchange, createCron(exchange, { cronTime }));
    return true;
  } catch (e) {
    logger.debug(":changecrontime :error");
    logger.error(e);
    return null;
  }
}

function GetAllCronStatus() {
  try {
    logger.debug(":getallcronstatus");
    const data = [];
    for (let [exchange, job] of ExchangeToCron) {
      const exchangeData = {};
      exchangeData["name"] = exchange;
      exchangeData["lastDate"] = job.lastDate();
      exchangeData["nextDate"] = job.nextDate();
      exchangeData["running"] = job.running;

      data.push(exchangeData);
    }

    logger.debug(":getallcronstatus :success");
    return data;
  } catch (e) {
    logger.debug(":getallcronstatus :error");
    logger.error(e);
    return null;
  }
}

async function RunNow(req, res) {
  logger.debug("called RunNow");
  const { exchange } = req.body;
  await RunCron(exchange);
  res.status(200).json({ statusCode: 200, message: "ran the cron" });
}

function startExchangeCrons() {
  for (let exchange of exchanges) {
    let existingCron = ExchangeToCron.get(exchange);
    if (existingCron) {
      existingCron.stop();
    }
    ExchangeToCron.set(exchange, createCron(exchange));
  }
}

function createCron(exchange, { cronTime = DefaultCronTime } = {}) {
  return new CronJob(
    cronTime,
    async function () {
      try {
        await RunCron(exchange);
      } catch (e) {
        logger.error(e);
      }
    },
    null,
    true,
    "America/Los_Angeles"
  );
}

async function RunCron(exchange) {
  if (exchange != "binance") {
    logger.debug(`:running-cron ${exchange}`);
    await RedisClient.set("wallet_balances", JSON.stringify([]));
    let balances = [];

    await Sleep(3000);
    const account = await GetAccount(exchange);
    if (account) {
      const walletBalances = await WalletBalance(exchange, { ...account });
      walletBalances.forEach((elem) => {
        balances.push({
          ...elem,
          exchange,
        });
      });

      const obj = { exchange, data: balances, ts: new Date().toUTCString() };
      let curr = JSON.parse(await RedisClient.get("wallet_balances"));
      if (curr == null || curr == "") {
        curr = {};
      }
      curr[exchange] = obj;
      await RedisClient.set("wallet_balances", JSON.stringify(curr));
      socket_io.in("wallet").emit("balances", curr);
      await emitSummary();
    }
  }
}

InternalBus.on(GlobalEvents.mongodb_connected, async () => {
  SyncExchangePairs();
});

InternalBus.on(GlobalEvents.exchange_updated, () => {
  SyncExchangePairs();
});

InternalBus.on(GlobalEvents.exchange_pair_updated, async () => {
  SyncExchangePairs();
});

InternalBus.on(GlobalEvents.exchange_deactivated, async (exchange) => {
  StopCron(exchange);
});

InternalBus.on(GlobalEvents.exchange_activated, async (exchange) => {
  SyncExchangePairs();
});

async function SyncExchangePairs() {
  try {
    logger.debug("fetching pairs in walletBalanceCron");
    const allExchanges = await ExchangeCurrencies.find({}).lean();
    exchanges = allExchanges.map(({ exchange }) => exchange);
    logger.debug("got exchange currencies", exchanges);
    startExchangeCrons();
  } catch (e) {
    logger.error(e);
  }
}

async function emitSummary() {
  const wallet_balance = JSON.parse(await RedisClient.get("wallet_balances"));
  const exchanges = Object.keys(wallet_balance);
  let data = [];
  for (let exchange of exchanges) {
    data = [
      ...data,
      ...wallet_balance[exchange].data.map((e) => {
        return { ...e };
      }),
    ];
  }

  data = data.reduce((acc, e) => {
    const index = acc.includesPartial({
      currency: e.currency,
      // botName: e.botName,
    });
    if (index !== null) {
      acc[index].balance += e.balance;
    } else {
      acc.push({
        ...e,
      });
    }
    return acc;
  }, []);

  socket_io.in("wallet").emit("live_snapshot", data);
}
