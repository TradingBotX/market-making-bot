const axiosHelper = require("../axiosHelper");
const httpBuildQuery = require("http-build-query");
const crypto = require("crypto");

module.exports = {
  orderBook: async (pair) => {
    try {
      pair = convertPairForExchange(pair);
      const orderBookURL = `https://www.bitrue.com/api/v1/depth?symbol=${pair}`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      return orderBookData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitrue_orderBook_error : `, error.response.data);
      } else {
        logger.error(`bitrue_orderBook_error : `, error);
      }
      return { asks: [], bids: [] };
    }
  },

  placeOrder: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const pair = convertPairForExchange(reqData.pair);
      const price = reqData.price;
      const type = reqData.type.toUpperCase();
      const orderType = reqData.orderType || "LIMIT";
      const totalQuantity = reqData.amount;
      const body = {
        symbol: pair,
        // price,
        side: type,
        type: orderType,
        quantity: totalQuantity,
        timestamp: await getTimeStamp(),
      };
      if (orderType == "LIMIT") {
        body.price = price;
      }
      const payload = httpBuildQuery(body);
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("hex");
      body.signature = signature;
      const headers = {
        "X-MBX-APIKEY": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      };
      const config = {
        url: `https://www.bitrue.com/api/v1/order?${httpBuildQuery(body)}`,
        headers,
      };
      const orderResponse = await axiosHelper.makePOSTHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitrue_placeOrder_error_data : `, error.response.data);
      } else {
        logger.error(`bitrue_placeOrder_error_error : `, error);
      }
      return "error";
    }
  },

  cancelOrder: async (reqData) => {
    try {
      const pair = convertPairForExchange(reqData.pair);
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const orderId = reqData.orderId;
      const body = {
        symbol: pair,
        orderId,
        timestamp: await getTimeStamp(),
      };
      const payload = httpBuildQuery(body);
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("hex");
      body.signature = signature;
      const headers = {
        "X-MBX-APIKEY": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      };
      const config = {
        url: `https://www.bitrue.com/api/v1/order?${httpBuildQuery(body)}`,
        headers,
      };
      const orderResponse = await axiosHelper.makeDELETEHeaderRequest(config);
      // logger.info(`bitrue_cancelOrder_return`, reqData, orderResponse);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitrue_cancelOrder_error : `, error.response.data);
      } else {
        logger.error(`bitrue_cancelOrder_error : `, error);
      }
      return "error";
    }
  },

  orderStatus: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const pair = convertPairForExchange(reqData.pair);
      const orderId = reqData.orderId;
      const body = {
        symbol: pair,
        orderId,
        timestamp: await getTimeStamp(),
      };
      const payload = httpBuildQuery(body);
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("hex");
      body.signature = signature;
      const headers = {
        "X-MBX-APIKEY": apiKey,
        "Content-Type": "application/json",
      };
      const config = {
        url: `https://www.bitrue.com/api/v1/order?${httpBuildQuery(body)}`,
        headers,
      };
      const orderResponse = await axiosHelper.makeGETHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitrue_orderStatus_error : `, error.response.data);
        console.log(`bitrue_orderStatus_error_1 : `, error.response);
      } else {
        logger.error(`bitrue_orderStatus_error : `, error);
      }
      return "error";
    }
  },

  walletBalance: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const body = {
        timestamp: await getTimeStamp(),
      };
      const payload = httpBuildQuery(body);
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("hex");
      body.signature = signature;
      const headers = {
        "X-MBX-APIKEY": apiKey,
        "Content-Type": "application/json",
      };
      const config = {
        url: `https://www.bitrue.com/api/v1/account?${httpBuildQuery(body)}`,
        headers,
      };
      const orderResponse = await axiosHelper.makeGETHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitrue_walletBalance_error : `, error.response.data);
      } else {
        logger.error(`bitrue_walletBalance_error : `, error);
      }
      return "error";
    }
  },

  openOrder: async (reqData) => {
    try {
      const pair = convertPairForExchange(reqData.pair);
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const body = {
        symbol: pair,
        timestamp: await getTimeStamp(),
      };
      const payload = httpBuildQuery(body);
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("hex");
      body.signature = signature;
      const headers = {
        "X-MBX-APIKEY": apiKey,
        "Content-Type": "application/json",
      };
      const config = {
        url: `https://www.bitrue.com/api/v1/openOrders?${httpBuildQuery(body)}`,
        headers: headers,
      };
      const orderResponse = await axiosHelper.makeGETHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitrue_openOrder_error : `, error.response.data);
      } else {
        logger.error(`bitrue_openOrder_error : `, error);
      }
      return "error";
    }
  },

  ticker24Hr: async (pair) => {
    try {
      pair = convertPairForExchange(pair);
      const orderBookURL = `https://www.bitrue.com/api/v1/ticker/24hr?symbol=${pair}`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      return orderBookData.data[0];
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitrue_ticker24Hr_error : `, error.response.data);
      } else {
        logger.error(`bitrue_ticker24Hr_error : `, error);
      }
      return {};
    }
  },
};

/**
 * will represent the pair in a pattern specific to the exchange
 * @param {String} pair pair name as per the format 'ABC-XYZ'
 */
function convertPairForExchange(pair) {
  return pair.replace("-", "").toUpperCase();
}

async function getTimeStamp() {
  try {
    const config = {
      url: `https://www.bitrue.com/api/v1/time`,
      contentType: "application/json",
    };
    const orderResponse = await axiosHelper.makeGETRequest(config);
    return orderResponse.data.serverTime;
  } catch (error) {
    console.log("getTimeStamp_error", error);
    return Date.now();
  }
}
