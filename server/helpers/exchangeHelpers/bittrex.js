const axiosHelper = require("../axiosHelper");
const cryptoJS = require("crypto-js");

module.exports = {
  orderBook: async (pair) => {
    try {
      const orderBookURL = `https://api.bittrex.com/v3/markets/${pair}/orderbook`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      const resp = {
        bids: orderBookData.data.bid,
        asks: orderBookData.data.ask,
      };
      return resp;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bittrex_orderBook_error : `, error.response.data);
      } else {
        logger.error(`bittrex_orderBook_error : `, error);
      }
      return { asks: [], bids: [] };
    }
  },

  placeOrder: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const pair = reqData.pair;
      const type = reqData.type.toUpperCase();
      const amount = reqData.amount;
      const price = reqData.price;
      const timestamp = new Date().getTime();
      const url = "https://api.bittrex.com/v3/orders";
      const method = "POST";
      const body = {
        marketSymbol: pair,
        direction: type,
        type: "LIMIT",
        quantity: amount,
        limit: price,
        timeInForce: "GOOD_TIL_CANCELLED",
        useAwards: false,
      };
      const contentHash = cryptoJS
        .SHA512(JSON.stringify(body))
        .toString(cryptoJS.enc.Hex);
      const preSign = [timestamp, url, method, contentHash, ""].join("");
      const signature = cryptoJS
        .HmacSHA512(preSign, apiSecret)
        .toString(cryptoJS.enc.Hex);
      const headers = {
        contentType: "application/json",
        "Api-Key": apiKey,
        "Api-Timestamp": timestamp,
        "Api-Content-Hash": contentHash,
        "Api-Signature": signature,
      };
      const config = {
        url: url,
        headers,
        data: body,
      };
      const responseData = await axiosHelper.makePOSTHeaderRequest(config);
      return responseData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bittrex_placeOrder_error : `, error.response.data);
      } else {
        logger.error(`bittrex_placeOrder_error : `, error);
      }
      return "error";
    }
  },

  cancelOrder: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const orderId = reqData.orderId;
      const timestamp = new Date().getTime();
      const url = `https://api.bittrex.com/v3/orders/${orderId}`;
      const method = "DELETE";
      const body = "";
      const contentHash = cryptoJS.SHA512(body).toString(cryptoJS.enc.Hex);
      const preSign = [timestamp, url, method, contentHash, ""].join("");
      const signature = cryptoJS
        .HmacSHA512(preSign, apiSecret)
        .toString(cryptoJS.enc.Hex);
      const headers = {
        contentType: "application/json",
        "Api-Key": apiKey,
        "Api-Timestamp": timestamp,
        "Api-Content-Hash": contentHash,
        "Api-Signature": signature,
      };
      const config = {
        url: url,
        headers,
        data: "",
      };
      const walletResponse = await axiosHelper.makeDELETEHeaderRequest(config);
      return walletResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bittrex_cancelOrder_error : `, error.response.data);
      } else {
        logger.error(`bittrex_cancelOrder_error : `, error);
      }
      return "error";
    }
  },

  orderStatus: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const orderId = reqData.orderId;
      const timestamp = new Date().getTime();
      const url = `https://api.bittrex.com/v3/orders/${orderId}`;
      const method = "GET";
      const body = "";
      const contentHash = cryptoJS.SHA512(body).toString(cryptoJS.enc.Hex);
      const preSign = [timestamp, url, method, contentHash, ""].join("");
      const signature = cryptoJS
        .HmacSHA512(preSign, apiSecret)
        .toString(cryptoJS.enc.Hex);
      const headers = {
        contentType: "application/json",
        "Api-Key": apiKey,
        "Api-Timestamp": timestamp,
        "Api-Content-Hash": contentHash,
        "Api-Signature": signature,
      };
      const config = {
        url: url,
        headers,
      };
      const walletResponse = await axiosHelper.makeGETHeaderRequest(config);
      return walletResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bittrex_orderStatus_error : `, error.response.data);
      } else {
        logger.error(`bittrex_orderStatus_error : `, error);
      }
      return "error";
    }
  },

  walletBalance: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const timestamp = new Date().getTime();
      const url = "https://api.bittrex.com/v3/balances";
      const method = "GET";
      const body = "";
      const contentHash = cryptoJS.SHA512(body).toString(cryptoJS.enc.Hex);
      const preSign = [timestamp, url, method, contentHash, ""].join("");
      const signature = cryptoJS
        .HmacSHA512(preSign, apiSecret)
        .toString(cryptoJS.enc.Hex);
      const headers = {
        contentType: "application/json",
        "Api-Key": apiKey,
        "Api-Timestamp": timestamp,
        "Api-Content-Hash": contentHash,
        "Api-Signature": signature,
      };
      const config = {
        url: url,
        headers,
      };
      const walletResponse = await axiosHelper.makeGETHeaderRequest(config);
      return walletResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bittrex_walletBalance_error : `, error.response.data);
      } else {
        logger.error(`bittrex_walletBalance_error : `, error);
      }
      return "error";
    }
  },

  ticker24Hr: async (pair) => {
    try {
      const orderBookURL = `https://api.bittrex.com/v3/markets/${pair}/summary`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      return orderBookData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bittrex_ticker24Hr_error : `, error.response.data);
      } else {
        logger.error(`bittrex_ticker24Hr_error : `, error);
      }
      return {};
    }
  },
};
