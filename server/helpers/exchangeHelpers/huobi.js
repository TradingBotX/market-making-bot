const crypto = require("crypto");
const axiosHelper = require("../axiosHelper");
const site = "api.huobi.pro";
const base = "https://" + site;

module.exports = {
  orderBook: async (pair) => {
    try {
      const orderBookURL = `https://api.huobi.pro/market/depth?symbol=${convertPairForExchange(
        pair
      )}&type=step0`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      // const resp = {
      //   bids: orderBookData.data.tick.bids,
      //   asks: orderBookData.data.tick.asks,
      // };
      // return resp;
      return orderBookData.data.tick;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`huobi_orderBook_error : `, error.response.data);
      } else {
        logger.error(`huobi_orderBook_error : `, error);
      }
      return { asks: [], bids: [] };
    }
  },

  walletBalance: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const accountId = reqData.accountId;
      const Timestamp = new Date().toISOString().split(".")[0];
      const SignatureMethod = "HmacSHA256";
      const SignatureVersion = 2;
      const AccessKeyId = apiKey;
      const method = "GET";
      const endPoint = `/v1/account/accounts/${accountId}/balance`; //main account
      // const endPoint = `/v1/account/accounts/${accountId}`; //sub account
      const url = `${base}${endPoint}`;
      const data = {
        AccessKeyId,
        SignatureMethod,
        SignatureVersion,
        Timestamp,
      };
      const query = Object.keys(data)
        .sort((a, b) => (a > b ? 1 : -1))
        .reduce(function (a, k) {
          a.push(k + "=" + encodeURIComponent(data[k]));
          return a;
        }, [])
        .join("&");
      const source = method + "\n" + site + "\n" + endPoint + "\n" + query;
      const signature = encodeURIComponent(
        crypto.createHmac("sha256", apiSecret).update(source).digest("base64")
      ); //digest('hex'); // set the HMAC hash header
      const config = {
        url: `${url}?${query}&Signature=${signature}`,
        contentType: "application/json",
      };
      const walletData = await axiosHelper.makeGETRequest(config);
      return walletData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(
          `huobi_walletBalance_error_response : `,
          error.response.data
        );
      } else {
        logger.error(`huobi_walletBalance_error : `, error);
      }
      return "error";
    }
  },

  getAccounts: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const Timestamp = new Date().toISOString().split(".")[0];
      const SignatureMethod = "HmacSHA256";
      const SignatureVersion = 2;
      const AccessKeyId = apiKey;
      const method = "GET";
      const endPoint = `/v1/account/accounts`;
      // const endPoint = `/v2/sub-user/user-list`;
      const url = `${base}${endPoint}`;
      const data = {
        AccessKeyId,
        SignatureMethod,
        SignatureVersion,
        Timestamp,
      };
      const query = Object.keys(data)
        .sort((a, b) => (a > b ? 1 : -1))
        .reduce(function (a, k) {
          a.push(k + "=" + encodeURIComponent(data[k]));
          return a;
        }, [])
        .join("&");
      const source = method + "\n" + site + "\n" + endPoint + "\n" + query;
      const signature = encodeURIComponent(
        crypto.createHmac("sha256", apiSecret).update(source).digest("base64")
      ); //digest('hex'); // set the HMAC hash header
      const config = {
        url: `${url}?${query}&Signature=${signature}`,
        contentType: "application/json",
      };
      const walletData = await axiosHelper.makeGETRequest(config);
      return walletData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`huobi_getAccounts_error : `, error.response.data);
      } else {
        logger.error(`huobi_getAccounts_error : `, error);
      }
      return "error";
    }
  },

  placeOrder: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const accountId = reqData.accountId;
      const pair = convertPairForExchange(reqData.pair);
      const amount = reqData.amount;
      const type = reqData.type.toLowerCase();
      const orderType = (reqData.orderType || "limit").toLowerCase();
      const price = reqData.price;
      const Timestamp = new Date().toISOString().split(".")[0];
      const SignatureMethod = "HmacSHA256";
      const SignatureVersion = 2;
      const AccessKeyId = apiKey;
      const method = "POST";
      const endPoint = `/v1/order/orders/place`;
      const url = `${base}${endPoint}`;
      const data = {
        AccessKeyId,
        SignatureMethod,
        SignatureVersion,
        Timestamp,
        "account-id": accountId,
        symbol: pair,
        type: `${type}-${orderType}`,
        amount,
        price,
      };
      const query = Object.keys(data)
        .sort((a, b) => (a > b ? 1 : -1))
        .reduce(function (a, k) {
          a.push(k + "=" + encodeURIComponent(data[k]));
          return a;
        }, [])
        .join("&");
      const source = method + "\n" + site + "\n" + endPoint + "\n" + query;
      const signature = encodeURIComponent(
        crypto.createHmac("sha256", apiSecret).update(source).digest("base64")
      ); //digest('hex'); // set the HMAC hash header
      const config = {
        url: `${url}?${query}&Signature=${signature}`,
        contentType: "application/json",
        data,
      };
      const orderData = await axiosHelper.makePOSTRequest(config);
      return orderData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`huobi_placeOrder_error : `, error.response.data);
      } else {
        logger.error(`huobi_placeOrder_error : `, error);
      }
      return "error";
    }
  },

  orderStatus: async (reqData) => {
    try {
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const Timestamp = new Date().toISOString().split(".")[0];
      const SignatureMethod = "HmacSHA256";
      const SignatureVersion = 2;
      const AccessKeyId = apiKey;
      const method = "GET";
      const orderId = reqData.orderId;
      const endPoint = `/v1/order/orders/${orderId}`;
      const url = `${base}${endPoint}`;
      const data = {
        AccessKeyId,
        SignatureMethod,
        SignatureVersion,
        Timestamp,
      };
      const query = Object.keys(data)
        .sort((a, b) => (a > b ? 1 : -1))
        .reduce(function (a, k) {
          a.push(k + "=" + encodeURIComponent(data[k]));
          return a;
        }, [])
        .join("&");
      const source = method + "\n" + site + "\n" + endPoint + "\n" + query;
      const signature = encodeURIComponent(
        crypto.createHmac("sha256", apiSecret).update(source).digest("base64")
      ); //digest('hex'); // set the HMAC hash header
      const config = {
        url: `${url}?${query}&Signature=${signature}`,
        contentType: "application/json",
      };
      const orderData = await axiosHelper.makeGETRequest(config);
      return orderData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`huobi_orderStatus_error : `, error.response.data);
      } else {
        logger.error(`huobi_orderStatus_error : `, error);
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
      const Timestamp = new Date().toISOString().split(".")[0];
      const SignatureMethod = "HmacSHA256";
      const SignatureVersion = 2;
      const AccessKeyId = apiKey;
      const method = "POST";
      const endPoint = `/v1/order/orders/${orderId}/submitcancel`;
      const url = `${base}${endPoint}`;
      const data = {
        AccessKeyId,
        SignatureMethod,
        SignatureVersion,
        Timestamp,
        "order-id": orderId,
        symbol: pair,
      };
      const query = Object.keys(data)
        .sort((a, b) => (a > b ? 1 : -1))
        .reduce(function (a, k) {
          a.push(k + "=" + encodeURIComponent(data[k]));
          return a;
        }, [])
        .join("&");
      const source = method + "\n" + site + "\n" + endPoint + "\n" + query;
      const signature = encodeURIComponent(
        crypto.createHmac("sha256", apiSecret).update(source).digest("base64")
      ); //digest('hex'); // set the HMAC hash header
      const config = {
        url: `${url}?${query}&Signature=${signature}`,
        contentType: "application/json",
        data,
      };
      const orderData = await axiosHelper.makePOSTRequest(config);
      return orderData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`huobi_cancelOrder_error : `, error.response.data);
      } else {
        logger.error(`huobi_cancelOrder_error : `, error);
      }
      return "error";
    }
  },

  ticker24Hr: async (pair) => {
    try {
      const orderBookURL = `https://api.huobi.pro/market/detail?symbol=${convertPairForExchange(
        pair
      )}`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      return orderBookData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`kucoin_ticker24Hr_error : `, error.response.data);
      } else {
        logger.error(`kucoin_ticker24Hr_error : `, error);
      }
      return {};
    }
  },
};

function convertPairForExchange(pair) {
  return pair.replace("-", "").toLowerCase();
}
