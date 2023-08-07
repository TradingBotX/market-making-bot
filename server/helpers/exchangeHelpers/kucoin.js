const axiosHelper = require("../axiosHelper");
const uuid = require("uuid").v4;
const crypto = require("crypto");
const qs = require("querystring");

module.exports = {
  orderBook: async (pair) => {
    try {
      const orderBookURL = `https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=${pair}`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      return orderBookData.data.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_orderBook_error : `, error.response.data);
      } else {
        logger.error(`kucoin_orderBook_error : `, error);
      }
      return { asks: [], bids: [] };
    }
  },

  placeOrder: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const passPhrase = reqData.passPhrase;
      const symbol = reqData.pair;
      const side = reqData.type;
      const type = "limit";
      const size = reqData.amount;
      const clientOid = uuid();
      const price = reqData.price;
      const method = "POST";
      const url = `/api/v1/orders`;
      const timeStamp = Date.now();
      const body = {
        side,
        symbol,
        type,
        price,
        size,
        clientOid,
      };
      const payload = `${timeStamp}${method}${url}${JSON.stringify(body)}`;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("base64");
      const encPassPhrase = crypto
        .createHmac("sha256", apiSecret)
        .update(passPhrase)
        .digest("base64");
      const headers = {
        "Content-Type": "application/json",
        "KC-API-KEY": apiKey,
        "KC-API-SIGN": signature,
        "KC-API-TIMESTAMP": timeStamp,
        "KC-API-PASSPHRASE": encPassPhrase,
        "KC-API-KEY-VERSION": 2,
      };
      const config = {
        url: `https://api.kucoin.com/api/v1/orders`,
        headers: headers,
        data: JSON.stringify(body),
      };
      const orderResponse = await axiosHelper.makePOSTHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_placeOrder_error : `, error.response.data);
      } else {
        logger.error(`kucoin_placeOrder_error : `, error);
      }
      return "error";
    }
  },

  orderStatus: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const passPhrase = reqData.passPhrase;
      const orderId = reqData.orderId;
      const method = "GET";
      const timeStamp = Date.now() + "";
      const body = {};
      const url = `/api/v1/orders/${orderId}`;
      const payload = `${timeStamp}${method}${url}${module.exports.formatQuery(
        body
      )}`;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("base64");
      const encPassPhrase = crypto
        .createHmac("sha256", apiSecret)
        .update(passPhrase)
        .digest("base64");
      const headers = {
        "Content-Type": "application/json",
        "KC-API-KEY": apiKey,
        "KC-API-SIGN": signature,
        "KC-API-TIMESTAMP": timeStamp,
        "KC-API-PASSPHRASE": encPassPhrase,
        "KC-API-KEY-VERSION": 2,
      };
      const config = {
        url: `https://api.kucoin.com/api/v1/orders/${orderId}`,
        headers: headers,
      };
      const orderResponse = await axiosHelper.makeGETHeaderRequest(config);
      return orderResponse.data.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_orderStatus_error : `, error.response.data);
      } else {
        logger.error(`kucoin_orderStatus_error : `, error);
      }
      return "error";
    }
  },

  cancelOrder: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const passPhrase = reqData.passPhrase;
      const orderId = reqData.orderId;
      const method = "DELETE";
      const timeStamp = Date.now() + "";
      const body = {};
      const url = `/api/v1/orders/${orderId}`;
      const payload = `${timeStamp}${method}${url}${module.exports.formatQuery(
        body
      )}`;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("base64");
      const encPassPhrase = crypto
        .createHmac("sha256", apiSecret)
        .update(passPhrase)
        .digest("base64");
      const headers = {
        "Content-Type": "application/json",
        "KC-API-KEY": apiKey,
        "KC-API-SIGN": signature,
        "KC-API-TIMESTAMP": timeStamp,
        "KC-API-PASSPHRASE": encPassPhrase,
        "KC-API-KEY-VERSION": 2,
      };
      const config = {
        url: `https://api.kucoin.com/api/v1/orders/${orderId}`,
        headers: headers,
      };
      const orderResponse = await axiosHelper.makeDELETEHeaderRequest(config);
      return orderResponse.data.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_cancelOrder_error : `, error.response.data);
      } else {
        logger.error(`kucoin_cancelOrder_error : `, error);
      }
      return "error";
    }
  },

  walletBalance: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const passPhrase = reqData.passPhrase;
      const method = "GET";
      const timeStamp = Date.now() + "";
      const body = {};
      const url = `/api/v1/accounts${module.exports.formatQuery(body)}`;
      const payload = `${timeStamp}${method}${url}${module.exports.formatQuery(
        body
      )}`;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("base64");
      const encPassPhrase = crypto
        .createHmac("sha256", apiSecret)
        .update(passPhrase)
        .digest("base64");
      const headers = {
        "Content-Type": "application/json",
        "KC-API-KEY": apiKey,
        "KC-API-SIGN": signature,
        "KC-API-TIMESTAMP": timeStamp,
        "KC-API-PASSPHRASE": encPassPhrase,
        "KC-API-KEY-VERSION": 2,
      };
      const config = {
        url: `https://api.kucoin.com/api/v1/accounts`,
        headers: headers,
      };
      const orderResponse = await axiosHelper.makeGETHeaderRequest(config);
      return orderResponse.data.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_walletBalance_error : `, error.response.data);
      } else {
        logger.error(`kucoin_walletBalance_error : `, error);
      }
      return "error";
    }
  },

  subAccountWalletBalance: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const passPhrase = reqData.passPhrase;
      const subAccUserId = reqData.subAccUserId;
      const method = "GET";
      const timeStamp = Date.now() + "";
      const body = {};
      const url = `/api/v1/sub-accounts/${subAccUserId}?includeBaseAmount=true`;
      const payload = `${timeStamp}${method}${url}`;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("base64");
      const encPassPhrase = crypto
        .createHmac("sha256", apiSecret)
        .update(passPhrase)
        .digest("base64");
      const headers = {
        "Content-Type": "application/json",
        "KC-API-KEY": apiKey,
        "KC-API-SIGN": signature,
        "KC-API-TIMESTAMP": timeStamp,
        "KC-API-PASSPHRASE": encPassPhrase,
        "KC-API-KEY-VERSION": 2,
      };
      const config = {
        url: `https://api.kucoin.com/api/v1/sub-accounts/${subAccUserId}?includeBaseAmount=true`,
        headers: headers,
      };
      const orderResponse = await axiosHelper.makeGETHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_walletBalance_error : `, error.response.data);
      } else {
        logger.error(`kucoin_walletBalance_error : `, error);
      }
      return "error";
    }
  },

  getSubAccounts: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const passPhrase = reqData.passPhrase;
      const method = "GET";
      const timeStamp = Date.now() + "";
      const body = {};
      const url = `/api/v1/sub/user${module.exports.formatQuery(body)}`;
      const payload = `${timeStamp}${method}${url}${module.exports.formatQuery(
        body
      )}`;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(payload)
        .digest("base64");
      const encPassPhrase = crypto
        .createHmac("sha256", apiSecret)
        .update(passPhrase)
        .digest("base64");
      const headers = {
        "Content-Type": "application/json",
        "KC-API-KEY": apiKey,
        "KC-API-SIGN": signature,
        "KC-API-TIMESTAMP": timeStamp,
        "KC-API-PASSPHRASE": encPassPhrase,
        "KC-API-KEY-VERSION": 2,
      };
      const config = {
        url: `https://api.kucoin.com/api/v1/sub/user`,
        headers: headers,
      };
      const orderResponse = await axiosHelper.makeGETHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_sa_error : `, error.response.data);
      } else {
        logger.error(`kucoin_sa_error : `, error);
      }
      return "error";
    }
  },

  ticker24Hr: async (pair) => {
    try {
      const orderBookURL = `https://api.kucoin.com/api/v1/market/stats?symbol=${pair}`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      return orderBookData.data.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_ticker24Hr_error : `, error.response.data);
      } else {
        logger.error(`kucoin_ticker24Hr_error : `, error);
      }
      return {};
    }
  },

  formatQuery: function (queryObj) {
    if (JSON.stringify(queryObj).length !== 2) {
      return "?" + qs.stringify(queryObj);
    } else {
      return "";
    }
  },
};
