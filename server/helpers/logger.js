/**
 * logger.js file to print logs in a more structured manner.
 * there are two levels of logs 'error', 'info' and 'debug'.
 * use info for as how you use console.log
 * use debug to print more info which you feel might be required to log in case of debugging
 *
 * @NOTE logger accepts only one arguement which has to a string or a non-circular json
 */

const winston = require("winston");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const { argv } = require("yargs");
const stack = require("callsite");

require("winston-daily-rotate-file");

const { combine, timestamp, printf } = winston.format;

const logPath = path.join(__dirname, "../logs");
const appPath = path.join(logPath, "info");
const debugPath = path.join(logPath, "debug");
const errorPath = path.join(logPath, "error");
const networkPath = path.join(logPath, "network");

const defaultLogLevel = "info";
const validLogLevels = ["info", "debug", "error", "silly", "orders"];
let logLevel = defaultLogLevel;

if (argv["log-level"]) {
  if (validLogLevels.includes(argv["log-level"]) === true) {
    console.warn(`[*] log level: ${argv["log-level"]}`);
    logLevel = argv["log-level"];
  } else {
    console.warn("[*] invalid log level");
  }
}

if (!fs.existsSync(logPath)) {
  console.log("[*] creating log folders");
  fs.mkdirSync(logPath);
  fs.mkdirSync(appPath);
  fs.mkdirSync(debugPath);
  fs.mkdirSync(errorPath);
  fs.mkdirSync(networkPath);
} else {
  if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
  if (!fs.existsSync(debugPath)) fs.mkdirSync(debugPath);
  if (!fs.existsSync(errorPath)) fs.mkdirSync(errorPath);
  if (!fs.existsSync(networkPath)) fs.mkdirSync(networkPath);
}

const levels = {
  error: 0,
  info: 1,
  debug: 2,
  silly: 3,
};

const logger = winston.createLogger({
  levels,
  format: combine(
    timestamp(),
    printf(({ level, message, timestamp, error, ...rest }) => {
      if (_.isObject(message)) message = JSON.stringify(message);

      let allRest = "";
      rest = rest[Symbol.for("splat")] || [];

      if (rest.length > 0) {
        allRest = rest
          .map((e) => {
            if (_.isObject(e)) {
              if (e.stack) {
                return e.stack;
              }
              delete e.apiKey;
              delete e.apiSecret;
              delete e.token;
              delete e.tokenId;
              delete e.tokenSecret;
              delete e.walletAddress;
              delete e.privateKey;
              delete e.passPhrase;
              return JSON.stringify(e);
            }
            return e;
          })
          .join(" ");
      }

      let infoStack = "\nStackTrace::: ";

      stack().forEach(function (site) {
        infoStack += `File: ${site.getFileName()}:${site.getLineNumber()} Function: ${
          site.getFunctionName() || "anonymous"
        } \n`;
      });

      if (error) {
        if (error.stack)
          return `${timestamp} ${level}: ${message} Error:${error.stack} ${allRest}`;
        else {
          return `${timestamp} ${level}: ${infoStack}: ${message} Error: ${JSON.stringify(
            error
          )} ${allRest}`;
        }
      }

      if (level === "error") {
        return `${timestamp} ${level}: ${infoStack} ${message} ${allRest}`;
      }

      return `${timestamp} ${level}: ${message} ${allRest}`;
    })
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: `${errorPath}/error-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "10m",
    }),
    new winston.transports.DailyRotateFile({
      filename: `${appPath}/info-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxSize: "10m",
    }),
    new winston.transports.DailyRotateFile({
      filename: `${debugPath}/debug-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      level: "debug",
      maxSize: "10m",
    }),
    // new winston.transports.DailyRotateFile({
    //   filename: `${networkPath}/network-%DATE%.log`,
    //   datePattern: "YYYY-MM-DD",
    //   level: "silly",
    // }),
    new winston.transports.Console({
      level: logLevel,
    }),
  ],
});

// logger.debug("in debug file only");
// logger.info("in files above ( including ) info");
// logger.error("in all files");

// logger.stream = {
//   write: function (message, encoding) {
//     logger.silly(message);
//   },
// };

global.logger = logger;

// try {
//   throw new Error("test error");
// } catch (e) {
//   logger.error("this will thow error", e);
// }
