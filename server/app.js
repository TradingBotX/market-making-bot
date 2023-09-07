const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morganLogger = require("morgan");
const logSymbols = require("log-symbols");
const mongoose = require("mongoose");

require("./helpers/globals");

function connectToMongoDB() {
  try {
    mongoose
      .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
      })
      .then(() => {
        logger.info("[", logSymbols.success, "] connected to mongodb");
        logger.debug("emitting event in internal bus");
        InternalBus.emit(GlobalEvents.mongodb_connected);
      })
      .catch((e) => {
        console.log(e);
        logger.error(`[*] error while connecting to mongodb:`, e);
        logger.info("[*] Retrying connection to mongodb in 5 seconds...");
        setTimeout(connectToMongoDB, 5000);
      });
  } catch (err0) {
    logger.error(
      `[*] error while connecting to mongodb:  ${JSON.stringify(err0)}`
    );
    logger.error(
      `[*] error while connecting to mongodb at :${process.env.MONGO_URL}`
    );
    logger.info("[*] Retrying connection to mongodb in 5 seconds...");
    setTimeout(connectToMongoDB, 5000);
  }
}

connectToMongoDB();

const { checkSetup } = require("./helpers/initialSetup");

checkSetup();

require("dotenv").config();
require("./services/redis");
require("./helpers/logger");
require("./helpers/RESPONSE");
require("./helpers/MAIL");
require("./helpers/socket_io");
require("./crons/scheduledCrons");
require("./helpers/exchangeSocket/bitfinex");

require("events").EventEmitter.defaultMaxListeners = 20;

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const spreadBotRouter = require("./routes/spreadBot");
const bitrue = require("./helpers/exchangeHelpers/bitrue");
const bittrex = require("./helpers/exchangeHelpers/bittrex");

const NetLogger = require("./helpers/networkLogger").NetLogger;

const app = express();

app.use(
  morganLogger(":method :url :status :remote-addr", {
    stream: NetLogger.stream,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(morganLogger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use("/", indexRouter);
app.use("/api/admin", adminRouter);
app.use("/api/spreadbot", spreadBotRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

logger.info("[", logSymbols.success, "] server started");

async function updatePrices() {
  const currencies = [
    "XDC",
    "SRX",
    "PLI",
    "LBT",
    "USPLUS",
    "FXD",
    "PRNT",
    "GBEX",
    "XTT",
    "XSP",
  ];
  let i,
    orderBook,
    query = {},
    pair;
  for (i = 0; i < currencies.length; i++) {
    pair = `${currencies[i]}-USDT`;
    orderBook = await bitrue.orderBook(pair);
    if (orderBook.bids[0] && orderBook.asks[0])
      query[pair] = {
        bid: [parseFloat(parseFloat(orderBook.bids[0][0]).toFixed(12))],
        ask: [parseFloat(parseFloat(orderBook.asks[0][0]).toFixed(12))],
      };
  }
  InternalBus.emit(GlobalEvents.converter_price, query);
}

//EUR price update
async function updateEURPrice() {
  let query = {};
  const EURUSDTBook = await bittrex.orderBook("USDT-EUR");
  if (EURUSDTBook.bids[1] && EURUSDTBook.asks[1])
    query[`EUR-USDT`] = {
      bid: [parseFloat(parseFloat(1 / EURUSDTBook.asks[1].rate).toFixed(8))],
      ask: [parseFloat(parseFloat(1 / EURUSDTBook.bids[1].rate).toFixed(8))],
    };
  InternalBus.emit(GlobalEvents.converter_price, query);
}

updatePrices();
updateEURPrice();

setInterval(async () => {
  updatePrices();
}, 300000);

setInterval(async () => {
  updateEURPrice();
}, 120000);

module.exports = app;
