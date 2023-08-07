const Event = require("events");
const InternalBus = new Event.EventEmitter();
const requestIp = require("request-ip");

const isset = async function (variable) {
  return typeof variable !== typeof undefined ? true : false;
};

global.isset = isset;

const GlobalEvents = Object.freeze({
  mongodb_connected: 0,
  exchange_pair_updated: 1,
  exchange_orderbook_update: 2,
  crons_synced: 3,
  admin_logout: 4,
  socket_sync: 5,
  best_price: 6,
  monitor: 7,
  converter_price: 8,
  converter_started: 9,
  exchange_updated: 10,
  exchange_deactivated: 11,
  volume_bot_updated: 12,
  arbitrage_updated: 13,
  favourable_orders: 14,
  arbitrage_order_placed: 15,
});

/**
 * Applicaitons internal bus to be used for pushing data across files on certain events
 * For: database connection.
 *
 * @NOTE Theres a cap on the amount of listeners on the app ( max-listernes ); only use when no other option
 */
global.InternalBus = InternalBus;
global.GlobalEvents = GlobalEvents;

global.timeouts = {};
global.flags = {};

/**
 * Global Stack Trace
 */

Object.defineProperty(global, "__stack", {
  get: function () {
    const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    const err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    const stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  },
});

Object.defineProperty(Object.prototype, "partialMatch", {
  value: function (fields) {
    for (let key of Object.keys(fields)) {
      if (Object.keys(this).includes(key)) {
        if (this[key] === fields[key]) continue;
        return false;
      } else {
        return false;
      }
    }
    return true;
  },
});

Object.defineProperty(Array.prototype, "includesPartial", {
  value: function (fields) {
    for (let i = 0; i < this.length; i++) {
      const obj = this[i];
      if (obj.partialMatch(fields)) {
        return i;
      }
    }
    return null;
  },
});

// Object.defineProperty(global, "__line", {
//   get: function () {
//     return __stack[1].getLineNumber();
//   },
// });

function getCallerIP(request) {
  const clientIp = requestIp.getClientIp(request);
  var ip =
    request.headers["x-forwarded-for"] ||
    request.connection.remoteAddress ||
    request.socket.remoteAddress ||
    request.connection.socket.remoteAddress;
  let ipa = ip.split(",").shift();

  ip = ipa.split(":").slice(-1).shift(); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
  if (isCorrectIP(ip) === false) {
    let ipNew = ipa.split(":").shift();
    if (isCorrectIP(ipNew) === false) {
      return "Not Found";
    } else {
      return ipNew;
    }
  } else {
    return ip;
  }
}
global.getCallerIP = getCallerIP;

async function isCorrectIP(ip) {
  const isIp = require("is-ip");
  if (isIp(ip)) {
    return true;
  } else {
    return false;
  }
}
