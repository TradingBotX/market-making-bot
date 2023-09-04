/**
 * @constant exchanges list of exchanges which the CrypBot is connected to
 */
const exchanges = [
  "bitrue",
  "bitfinex",
  "kucoin",
  "bittrex",
  "gateio",
  "huobi",
];

exports.Exchanges = exchanges;

exports.StartOfTime = new Date(0);

let ExchangePairInfo = {
  bitrue: {
    "XDC-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 5,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XDC-USDC": {
      decimalsAmount: 0,
      decimalsPrice: 5,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XDC-XRP": {
      decimalsAmount: 0,
      decimalsPrice: 5,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XDC-ETH": {
      decimalsAmount: 0,
      decimalsPrice: 8,
      minAmount: 500,
      maxAmount: 10000,
    },
    "SRX-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 6,
      minAmount: 1000,
      maxAmount: 10000,
    },
    "PLI-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 5,
      minAmount: 500,
      maxAmount: 10000,
    },
    "USPLUS-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 4,
      minAmount: 20,
      maxAmount: 1000,
    },
    "FXD-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 4,
      minAmount: 20,
      maxAmount: 1000,
    },
    "PRNT-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 6,
      minAmount: 20,
      maxAmount: 1000,
    },
    "GBEX-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 10,
      minAmount: 200000000,
      maxAmount: 20000000000,
    },
    "XTT-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 6,
      minAmount: 8000,
      maxAmount: 1000000,
    },
    "LBT-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 6,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XSP-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 6,
      minAmount: 2000,
      maxAmount: 200000,
    },
  },
  bitfinex: {
    "XDC-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 6,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XDC-USD": {
      decimalsAmount: 0,
      decimalsPrice: 6,
      minAmount: 500,
      maxAmount: 10000,
    },
  },
  kucoin: {
    "XDC-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 5,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XDC-ETH": {
      decimalsAmount: 0,
      decimalsPrice: 8,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XDC-BTC": {
      decimalsAmount: 0,
      decimalsPrice: 9,
      minAmount: 500,
      maxAmount: 10000,
    },
  },
  bittrex: {
    "XDC-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 5,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XDC-EUR": {
      decimalsAmount: 0,
      decimalsPrice: 5,
      minAmount: 500,
      maxAmount: 10000,
    },
    "USDT-EUR": {
      decimalsAmount: 3,
      decimalsPrice: 3,
      minAmount: 3,
      maxAmount: 1000,
    },
    "XDC-BTC": {
      decimalsAmount: 0,
      decimalsPrice: 8,
      minAmount: 500,
      maxAmount: 10000,
    },
  },
  gateio: {
    "XDC-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 5,
      minAmount: 500,
      maxAmount: 10000,
    },
    "XDC-ETH": {
      decimalsAmount: 0,
      decimalsPrice: 8,
      minAmount: 500,
      maxAmount: 10000,
    },
  },
  huobi: {
    "XDC-USDT": {
      decimalsAmount: 0,
      decimalsPrice: 6,
      minAmount: 500,
      maxAmount: 10000,
    },
  },
};

exports.setExchangePairInfo = (data) => {
  ExchangePairInfo = data;
};

exports.ExchangePairInfo = ExchangePairInfo;

const UsdtPairs = ["XDC-USDT", "XDC-USD", "XDC-USDC"];

exports.UsdtPairs = UsdtPairs;

const converterPairs = ["ETH-USDT", "XRP-USDT", "BTC-USDT", "XDC-USDT"];

exports.converterPairs = converterPairs;

exports.primaryCurrencies = ["XDC"];

const ExchangeCurrencyInfo = {
  bitrue: {
    XDC: {
      exchangeSymbol: "XDC",
      name: "XDC Network",
      currencyId: "",
    },
    USDT: { exchangeSymbol: "USDT", name: "USD Tether", currencyId: "" },
    USDC: { exchangeSymbol: "USDC", name: "USD Coin", currencyId: "" },
    XRP: { exchangeSymbol: "XRP", name: "Ripple", currencyId: "" },
    ETH: { exchangeSymbol: "ETH", name: "Ethereum", currencyId: "" },
    SRX: { exchangeSymbol: "SRX", name: "StorX Network", currencyId: "" },
    PLI: { exchangeSymbol: "PLI", name: "Plugin", currencyId: "" },
    USPLUS: {
      exchangeSymbol: "USPLUS",
      name: "Fluent Finance",
      currencyId: "",
    },
    FXD: { exchangeSymbol: "FXD", name: "Fathom Stable Coin", currencyId: "" },
    PRNT: {
      exchangeSymbol: "PRNT",
      name: "Prime Number Token",
      currencyId: "",
    },
    GBEX: {
      exchangeSymbol: "GBEX",
      name: "Globiance Exchange",
      currencyId: "",
    },
    XTT: { exchangeSymbol: "XTT", name: "XSwap Treasure", currencyId: "" },
    LBT: { exchangeSymbol: "LBT", name: "Lawblocks Token", currencyId: "" },
    XSP: { exchangeSymbol: "XSP", name: "XSwap Protocol", currencyId: "" },
  },
  bitfinex: {
    XDC: {
      exchangeSymbol: "xdc",
      name: "XDC Network",
      currencyId: "",
    },
    USDT: { exchangeSymbol: "usdt", name: "USD Tether", currencyId: "" },
    USD: { exchangeSymbol: "usd", name: "USD Dollars", currencyId: "" },
  },
  kucoin: {
    XDC: {
      exchangeSymbol: "XDC",
      name: "XDC Network",
      currencyId: "",
    },
    USDT: { exchangeSymbol: "USDT", name: "USD Tether", currencyId: "" },
    ETH: { exchangeSymbol: "ETH", name: "Ethereum", currencyId: "" },
    ETH: { exchangeSymbol: "BTC", name: "Bitcoin", currencyId: "" },
  },
  bittrex: {
    XDC: {
      exchangeSymbol: "XDC",
      name: "XDC Network",
      currencyId: "",
    },
    USDT: { exchangeSymbol: "USDT", name: "USD Tether", currencyId: "" },
    EUR: { exchangeSymbol: "EUR", name: "Euro", currencyId: "" },
  },
  gateio: {
    XDC: {
      exchangeSymbol: "XDC",
      name: "XDC Network",
      currencyId: "",
    },
    USDT: { exchangeSymbol: "USDT", name: "USD Tether", currencyId: "" },
    ETH: { exchangeSymbol: "ETH", name: "Ethereum", currencyId: "" },
  },
  huobi: {
    XDC: {
      exchangeSymbol: "xdc",
      name: "XDC Network",
      currencyId: "",
    },
    USDT: { exchangeSymbol: "usdt", name: "USD Tether", currencyId: "" },
  },
};

exports.ExchangeCurrencyInfo = ExchangeCurrencyInfo;
