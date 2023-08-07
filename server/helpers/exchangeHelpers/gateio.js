const axiosHelper = require("../axiosHelper");
const crypto = require("crypto");
const querystring = require("querystring");

module.exports = {
  orderBook: async (pair) => {
    try {
      const orderBookURL = `https://api.gateio.ws/api/v4/spot/order_book?currency_pair=${convertPairForExchange(
        pair
      )}`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      const resp = {
        bids: orderBookData.data.bids,
        asks: orderBookData.data.asks,
      };
      return resp;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`gateio_orderBook_error : `, error.response.data);
      } else {
        logger.error(`gateio_orderBook_error : `, error);
      }
      return { asks: [], bids: [] };
    }
  },

  placeOrder: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const pair = convertPairForExchange(reqData.pair);
      const type = reqData.type.toLowerCase();
      const amount = reqData.amount;
      const price = reqData.price;
      const timestamp = (new Date().getTime() / 1000).toString();
      const url = "https://api.gateio.ws/api/v4/spot/orders";
      const method = "POST";
      const body = {
        currency_pair: pair,
        type: "limit",
        side: type,
        amount,
        price,
        time_in_force: "gtc",
      };
      const contentHash = crypto
        .createHash("sha512")
        .update(JSON.stringify(body))
        .digest("hex");
      const preSign = [
        method,
        new URL(url).pathname,
        unescape(querystring.stringify("")),
        contentHash,
        timestamp,
      ].join("\n");
      const signature = crypto
        .createHmac("sha512", apiSecret)
        .update(preSign)
        .digest("hex");
      const headers = {
        "Content-Type": "application/json",
        KEY: apiKey,
        Timestamp: timestamp,
        SIGN: signature,
      };
      const config = {
        url: url,
        headers,
        data: JSON.stringify(body),
      };
      const responseData = await axiosHelper.makePOSTHeaderRequest(config);
      return responseData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`gateio_placeOrder_error : `, error.response.data);
      } else {
        logger.error(`gateio_placeOrder_error : `, error);
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
      const timestamp = (new Date().getTime() / 1000).toString();
      const url = `https://api.gateio.ws/api/v4/spot/orders/${encodeURIComponent(
        String(orderId)
      )}`;
      const method = "GET";
      const body = "";
      const queryParam = { currency_pair: String(pair) };
      const contentHash = crypto
        .createHash("sha512")
        .update(body)
        .digest("hex");
      const preSign = [
        method,
        new URL(url).pathname,
        unescape(querystring.stringify(queryParam)),
        contentHash,
        timestamp,
      ].join("\n");
      const signature = crypto
        .createHmac("sha512", apiSecret)
        .update(preSign)
        .digest("hex");
      const headers = {
        contentType: "application/json",
        KEY: apiKey,
        Timestamp: timestamp,
        SIGN: signature,
      };
      const config = {
        url: `${url}?${unescape(querystring.stringify(queryParam))}`,
        headers,
      };
      const responseData = await axiosHelper.makeGETHeaderRequest(config);
      return responseData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`gateio_orderStatus_error : `, error.response.data);
      } else {
        logger.error(`gateio_orderStatus_error : `, error);
      }
      return "error";
    }
  },

  cancelOrder: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const pair = convertPairForExchange(reqData.pair);
      const orderId = reqData.orderId;
      const timestamp = (new Date().getTime() / 1000).toString();
      const url = `https://api.gateio.ws/api/v4/spot/orders/${encodeURIComponent(
        String(orderId)
      )}`;
      const method = "DELETE";
      const body = "";
      const queryParam = { currency_pair: String(pair) };
      const contentHash = crypto
        .createHash("sha512")
        .update(body)
        .digest("hex");
      const preSign = [
        method,
        new URL(url).pathname,
        unescape(querystring.stringify(queryParam)),
        contentHash,
        timestamp,
      ].join("\n");
      const signature = crypto
        .createHmac("sha512", apiSecret)
        .update(preSign)
        .digest("hex");
      const headers = {
        contentType: "application/json",
        KEY: apiKey,
        Timestamp: timestamp,
        SIGN: signature,
      };
      const config = {
        url: `${url}?${unescape(querystring.stringify(queryParam))}`,
        headers,
      };
      const responseData = await axiosHelper.makeDELETEHeaderRequest(config);
      return responseData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`gateio_cancelOrder_error : `, error.response.data);
      } else {
        logger.error(`gateio_cancelOrder_error : `, error);
      }
      return "error";
    }
  },

  walletBalance: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const timestamp = (new Date().getTime() / 1000).toString();
      const url = "https://api.gateio.ws/api/v4/spot/accounts";
      const method = "GET";
      const body = "";
      const contentHash = crypto
        .createHash("sha512")
        .update(body)
        .digest("hex");
      const preSign = [
        method,
        new URL(url).pathname,
        unescape(querystring.stringify("")),
        contentHash,
        timestamp,
      ].join("\n");
      const signature = crypto
        .createHmac("sha512", apiSecret)
        .update(preSign)
        .digest("hex");
      const headers = {
        contentType: "application/json",
        KEY: apiKey,
        Timestamp: timestamp,
        SIGN: signature,
      };
      const config = {
        url: url,
        headers,
      };
      const responseData = await axiosHelper.makeGETHeaderRequest(config);
      return responseData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`gateio_walletBalance_error : `, error.response.data);
      } else {
        logger.error(`gateio_walletBalance_error : `, error);
      }
      return "error";
    }
  },

  ticker24Hr: async (pair) => {
    try {
      const tickerURL = `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${convertPairForExchange(
        pair
      )}`;
      const config = {
        url: tickerURL,
        contentType: "application/json",
      };
      const tickerData = await axiosHelper.makeGETRequest(config);
      return tickerData.data[0];
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`gateio_ticker24Hr_error : `, error.response.data);
      } else {
        logger.error(`gateio_ticker24Hr_error : `, error);
      }
      return {};
    }
  },
};

function convertPairForExchange(pair) {
  return pair.replace("-", "_").toUpperCase();
}
