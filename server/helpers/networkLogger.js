const winston = require("winston");
const path = require("path");
const fs = require("fs");
const _ = require("lodash");

const { combine, timestamp, printf } = winston.format;

const logPath = path.join(__dirname, "../logs");
const networkPath = path.join(logPath, "network");

if (!fs.existsSync(logPath)) {
  console.log("[*] creating log folders");
  fs.mkdirSync(logPath);
  fs.mkdirSync(networkPath);
} else {
  if (!fs.existsSync(networkPath)) fs.mkdirSync(networkPath);
}

const NetLogger = winston.createLogger({
  levels: { req: 0 },
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
              return JSON.stringify(e);
            }
            return e;
          })
          .join(" ");
      }

      if (error) {
        if (error.stack)
          return `${timestamp} ${level}: ${message} Error:${error.stack} ${allRest}`;
        else {
          return `${timestamp} ${level}: ${message} Error:${JSON.stringify(
            error
          )} ${allRest}`;
        }
      }

      return `${timestamp} ${level}: ${message} ${allRest}`;
    })
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: `${networkPath}/network-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      level: "req",
    }),
  ],
});

require("winston-daily-rotate-file");

NetLogger.stream = {
  write: function (message, encoding) {
    NetLogger.req(message);
  },
};

exports.NetLogger = NetLogger;
