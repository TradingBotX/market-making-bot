const axiosHelper = require("../axiosHelper");
const crypto = require("crypto");
const getNonce = require("nonce")();
let onGoingCall = false;
let nonceTimeOut;

module.exports = {
  orderBook: async (pair) => {
    try {
      pair = convertPairForExchange(pair);
      const orderBookURL = `https://api.bitfinex.com/v1/book/${pair}`;
      const config = {
        url: orderBookURL,
        contentType: "application/json",
      };
      const orderBookData = await axiosHelper.makeGETRequest(config);
      return orderBookData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitfinex_orderBook_error : `, error.response.data);
      } else {
        logger.error(`bitfinex_orderBook_error : `, error);
      }
      return { asks: [], bids: [] };
    }
  },

  placeOrder: async function (reqData) {
    try {
      const nonce = reqData.nonce;
      logger.info(
        "bitfinex_place_nonce",
        reqData.price,
        reqData.amount,
        reqData.pair,
        reqData.type,
        nonce
      );
      const pair = convertPairForExchange(reqData.pair);
      const price = reqData.price;
      const amount = reqData.amount;
      const side = reqData.type;
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const exchange = "bitfinex";
      const request = "/v1/order/new";
      const type = "exchange limit";
      const bitfinexBody = {
        request,
        nonce: nonce.toString(),
        symbol: pair,
        amount,
        price,
        exchange,
        side,
        type,
      };
      const payload = new Buffer(JSON.stringify(bitfinexBody)).toString(
        "base64"
      );
      const signature = crypto
        .createHmac("sha384", apiSecret)
        .update(payload)
        .digest("hex");
      const headers = {
        contentType: "application/json",
        "X-BFX-APIKEY": apiKey,
        "X-BFX-PAYLOAD": payload,
        "X-BFX-SIGNATURE": signature,
      };
      const config = {
        url: "https://api.bitfinex.com/v1/order/new",
        headers: headers,
        data: JSON.stringify(bitfinexBody),
      };
      const orderResponse = await axiosHelper.makePOSTHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitfinex_placeOrder_error : `, error.response.data);
      } else {
        logger.error(`bitfinex_placeOrder_error : `, error);
      }
      return "error";
    }
  },

  cancelOrder: async function (reqData) {
    try {
      const nonce = reqData.nonce;
      logger.info("bitfinex_cancel_nonce", nonce, reqData.orderId);
      const orderId = reqData.orderId;
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const request = "/v1/order/cancel";
      const bitfinexBody = {
        request: request,
        nonce: nonce.toString(),
        order_id: parseInt(orderId),
      };
      const payload = new Buffer(JSON.stringify(bitfinexBody)).toString(
        "base64"
      );
      const signature = crypto
        .createHmac("sha384", apiSecret)
        .update(payload)
        .digest("hex");
      const headers = {
        contentType: "application/json",
        "X-BFX-APIKEY": apiKey,
        "X-BFX-PAYLOAD": payload,
        "X-BFX-SIGNATURE": signature,
      };
      const config = {
        url: "https://api.bitfinex.com/v1/order/cancel",
        headers: headers,
        data: JSON.stringify(bitfinexBody),
      };
      const orderResponse = await axiosHelper.makePOSTHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitfinex_cancelOrder_error : `, error.response.data);
      } else {
        logger.error(`bitfinex_cancelOrder_error : `, error);
      }
      return "error";
    }
  },

  orderStatus: async function (reqData) {
    try {
      const nonce = reqData.nonce;
      const orderId = parseInt(reqData.orderId);
      logger.info("bitfinex_status_nonce", nonce, reqData.orderId);
      const request = "/v1/order/status";
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const bitfinexBody = {
        request,
        nonce: nonce.toString(),
        order_id: orderId,
      };
      const payload = new Buffer(JSON.stringify(bitfinexBody)).toString(
        "base64"
      );
      const signature = crypto
        .createHmac("sha384", apiSecret)
        .update(payload)
        .digest("hex");
      const headers = {
        contentType: "application/json",
        "X-BFX-APIKEY": apiKey,
        "X-BFX-PAYLOAD": payload,
        "X-BFX-SIGNATURE": signature,
      };
      const config = {
        url: "https://api.bitfinex.com/v1/order/status",
        headers: headers,
        data: JSON.stringify(bitfinexBody),
      };
      const orderResponse = await axiosHelper.makePOSTHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitfinex_orderStatus_error : `, error.response.data);
      } else {
        logger.error(`bitfinex_orderStatus_error : `, error);
      }
      return "error";
    }
  },

  walletBalance: async function (reqData) {
    try {
      const nonce = reqData.nonce;
      logger.info("bitfinex_balance_nonce", nonce);
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const request = "/v1/balances";
      const bitfinexBody = {
        request,
        nonce: nonce.toString(),
      };
      const payload = new Buffer(JSON.stringify(bitfinexBody)).toString(
        "base64"
      );
      const signature = crypto
        .createHmac("sha384", apiSecret)
        .update(payload)
        .digest("hex");
      const headers = {
        contentType: "application/json",
        "X-BFX-APIKEY": apiKey,
        "X-BFX-PAYLOAD": payload,
        "X-BFX-SIGNATURE": signature,
      };
      const config = {
        url: "https://api.bitfinex.com/v1/balances",
        headers: headers,
        data: JSON.stringify(bitfinexBody),
      };
      const walletResponse = await axiosHelper.makePOSTHeaderRequest(config);
      return walletResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitfinex_walletBalance_error : `, error.response.data);
      } else {
        logger.error(`bitfinex_walletBalance_error : `, error);
      }
      return "error";
    }
  },

  openOrder: async function (reqData) {
    try {
      const nonce = reqData.nonce;
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const request = "/v1/orders";
      const bitfinexBody = {
        request: request,
        nonce: nonce.toString(),
      };
      const payload = new Buffer(JSON.stringify(bitfinexBody)).toString(
        "base64"
      );
      const signature = crypto
        .createHmac("sha384", apiSecret)
        .update(payload)
        .digest("hex");
      const headers = {
        contentType: "application/json",
        "X-BFX-APIKEY": apiKey,
        "X-BFX-PAYLOAD": payload,
        "X-BFX-SIGNATURE": signature,
      };
      const config = {
        url: "https://api.bitfinex.com/v1/orders",
        headers: headers,
        data: JSON.stringify(bitfinexBody),
      };
      const walletResponse = await axiosHelper.makePOSTHeaderRequest(config);
      return walletResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitfinex_openOrder_error : `, error.response.data);
      } else {
        logger.error(`bitfinex_openOrder_error : `, error);
      }
      return "error";
    }
  },

  GetNonce: async () => {
    try {
      if (onGoingCall == false) {
        onGoingCall = true;
        return getNonce();
      } else {
        for (let i = 0; i < 5; i++) {
          nonceTimeOut = await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );
          if (onGoingCall == false) {
            onGoingCall = true;
            return getNonce();
          }
        }
        if (!nonceTimeOut) {
          await module.exports.releaseNonce();
        }
        onGoingCall = true;
        return getNonce();
      }
    } catch (error) {
      logger.error(`bitfinex_GetNonce_error : `, error);
      onGoingCall = true;
      return getNonce();
    }
  },

  releaseNonce: async () => {
    try {
      onGoingCall = false;
      clearTimeout(nonceTimeOut);
    } catch (error) {
      logger.error(`bitfinex_relaseNonce_error : `, error);
      return getNonce();
    }
  },

  orderTrades: async (reqData) => {
    try {
      const nonce = reqData.nonce.toString();
      const orderId = parseInt(reqData.orderId);
      logger.info(
        "bitfinex_trades_nonce",
        nonce,
        reqData.orderId,
        convertPairForExchange(reqData.pair)
      );
      const request = `v2/auth/r/order/t${convertPairForExchange(
        reqData.pair
      )}:${orderId}/trades`;
      const apiKey = reqData.apiKey;
      const apiSecret = reqData.apiSecret;
      const bitfinexBody = {};
      const payload = `/api/${request}${nonce}${JSON.stringify(bitfinexBody)}`;
      const signature = crypto
        .createHmac("sha384", apiSecret)
        .update(payload)
        .digest("hex");
      const headers = {
        "Content-Type": "application/json",
        "bfx-nonce": nonce,
        "bfx-apikey": apiKey,
        "bfx-signature": signature,
      };
      const config = {
        url: `https://api.bitfinex.com/${request}`,
        headers: headers,
        data: JSON.stringify(bitfinexBody),
      };
      const orderResponse = await axiosHelper.makePOSTHeaderRequest(config);
      return orderResponse.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitfinex_orderTrades_error : `, error.response.data);
      } else {
        logger.error(`bitfinex_orderTrades_error : `, error);
      }
      return "error";
    }
  },

  ticker24Hr: async (pair) => {
    try {
      const tickerURL = `https://api.bitfinex.com/v1/pubticker/${convertPairForExchange(
        pair
      )}`;
      const config = {
        url: tickerURL,
        contentType: "application/json",
      };
      const tickerData = await axiosHelper.makeGETRequest(config);
      return tickerData.data;
    } catch (error) {
      if (await isset(error.response)) {
        logger.error(`bitfinex_ticker24Hr_error : `, error.response.data);
      } else {
        logger.error(`bitfinex_ticker24Hr_error : `, error);
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
  let [firstCurrency, secondCurrency] = pair
    .split("-")
    .map((e) => e.toUpperCase());
  if (secondCurrency === "USDT") secondCurrency = "UST";
  if (["BCH", "LUNA"].some((e) => pair.includes(e)))
    return `${firstCurrency}:${secondCurrency}`;
  else return `${firstCurrency}${secondCurrency}`;
}
