const logSymbols = require("log-symbols");

const WsWrapper = require("../socketClass/wsClass");

const bitURL = `wss://api-pub.bitfinex.com/ws/2`;
const Subscribed_Pairs = [
  "XDC-USDT",
  "USDC-USDT",
  "ETH-USDT",
  "XRP-USDT",
  "BTC-USDT",
];

let validPair = "";
for (let i = 0; i < Subscribed_Pairs.length; i++) {
  let currPair = Subscribed_Pairs[i];
  if (i !== Subscribed_Pairs.length - 1) {
    validPair += `${currPair},`;
  } else {
    validPair += `${currPair}`;
  }
}

validPair = validPair.split(",");
if (validPair.length > 0) {
  for (let pair of validPair) {
    let [firstCurrency, secondCurrency] = pair
      .split("-")
      .map((e) => e.toUpperCase());
    if (secondCurrency === "USDT") secondCurrency = "UST";
    if (firstCurrency === "EURT") firstCurrency = "EUT";
    else if (firstCurrency === "USDC") firstCurrency = "UDC";
    let tempPair = "";
    tempPair = `t${firstCurrency}${secondCurrency}`;
    let sData = {
      pair: tempPair,
      orgPair: pair,
    };
    setTimeout(() => {
      bitfinexSocket(sData);
    }, 10000);
  }
}

const bitfinexSocket = (sData) => {
  let onopen = function (data) {
    logger.info("[", logSymbols.success, "] bitfinex ws connected", sData.pair);
    let msg = JSON.stringify({
      event: "subscribe",
      channel: "ticker",
      symbol: sData.pair,
    });

    setTimeout(() => {
      this.socket.send(msg);
    }, 1000);
  };
  let onclose = function (evt) {
    // console.log("bitfinex ws close", evt);
    this.socket.removeAllListeners();
    this.reconnect();
  };
  let onerror = function (evt) {
    console.log("bitfinex ws error", evt);
  };
  let onmessage = async function (evt) {
    let wsData = JSON.parse(evt.data);

    if (wsData[1] && wsData[1] != "hb" && wsData[1] != "cs") {
      const query = {};

      let originalPair = "";
      if (["XDC-USD"].includes(sData.orgPair)) {
        originalPair = sData.orgPair.replace("-USD", "-USDT");
      } else {
        originalPair = sData.orgPair;
      }

      query[originalPair] = {
        bid: [wsData[1][0]],
        ask: [wsData[1][2]],
      };
      InternalBus.emit(GlobalEvents.converter_started, originalPair);
      InternalBus.emit(GlobalEvents.converter_price, query);
    }
  };

  let wSocket = new WsWrapper(
    "bitfinex_converter",
    bitURL,
    {
      onClose: onclose,
      onOpen: onopen,
      onError: onerror,
      onMessage: onmessage,
    },
    { asks: [], bids: [] }
  );
};
