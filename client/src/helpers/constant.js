import React from "react";
import axios from "axios";
import { createLogger, format, transports } from "winston";

export const ApiRoot = process.env.REACT_APP_URL;

export const WSS = process.env.REACT_APP_WSS;

export const ReconnectionThrottle = 5000;

export const SocketListener = ["open", "close", "error", "message"];

const logFormat = format.printf(({ level, message, error, ...rest }) => {
  if (typeof message === "object") message = JSON.stringify(message);
  let allRest = "";
  rest = rest[Symbol.for("splat")] || [];
  if (rest.length > 0) {
    allRest = rest
      .map((e) => {
        if (typeof e === "object") {
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
      return `${level}: ${message} Error:${error.stack} ${allRest}`;
    else {
      return `${level}: ${message} Error: ${JSON.stringify(error)} ${allRest}`;
    }
  }
  if (level === "error") {
    return `${level}: ${message} ${allRest}`;
  }
  return `${level}: ${message} ${allRest}`;
});

const devLogger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(logFormat),
    }),
  ],
});

export const logger =
  process.env.REACT_APP_ENV === "dev"
    ? devLogger
    : { info: () => {}, error: () => {}, debug: () => {} };

const getJWT = () => {
  const jwt = localStorage.getItem("crypbot_jwt");
  return jwt;
};

export const GetJwt = getJWT;

export const AxiosInstance = axios.create({
  baseURL: ApiRoot,
  headers: {
    Authorization: getJWT(),
    "Content-Type": "application/json",
  },
});

export const PostConfig = {
  headers: { Authorization: getJWT() },
};

export const GetParamValue = (key) => {
  const pathName = document.URL;
  console.log(pathName);

  let allParam = pathName.split("?");
  if (allParam.length > 1) {
    allParam = allParam[1].split("&");
    for (let i = 0; i < allParam.length; i++) {
      const [currKey, currVal] = allParam[i].split("=");
      if (currKey === key) return currVal;
    }
  }
  return null;
};

export const BytesToMB = (bytes) => {
  return bytes / (1024 * 1024);
};

/**
 * will return date in local format
 * @param {Stirng|Number} dateStr
 */
export const GetDateLocalFormat = (dateStr) => {
  let date = new Date(dateStr);
  return `${date.getDate()} /${
    date.getMonth() + 1
  }/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`;
};

/**
 * will return anchor tag with truncated value
 * @param {string} txHash transaction hash
 */
export const GetTxLink = (txHash) => {
  return (
    <a target="_blank" href={`https://explorer.xinfin.network/tx/${txHash}`}>
      {txHash.slice(0, 10)}
    </a>
  );
};

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    Showing {from} to {to} of {size} Results
  </span>
);

export const PaginationOption = {
  paginationSize: 4,
  pageStartIndex: 0,
  // alwaysShowAllBtns: true, // Always show next and previous button
  // withFirstAndLast: false, // Hide the going to First and Last page button
  // hideSizePerPage: true, // Hide the sizePerPage dropdown always
  // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
  firstPageText: "First",
  prePageText: "Back",
  nextPageText: "Next",
  lastPageText: "Last",
  nextPageTitle: "First page",
  prePageTitle: "Pre page",
  firstPageTitle: "Next page",
  lastPageTitle: "Last page",
  showTotal: true,
  paginationTotalRenderer: customTotal,
  disablePageTitle: true,
  sizePerPageList: [
    {
      text: "5",
      value: 5,
    },
    {
      text: "10",
      value: 10,
    },
    {
      text: "All",
      value: 20,
    },
  ], // A numeric array is also available. the purpose of above example is custom the text
};

export const RoundDgt = (number, n) => {
  return (
    Math.round(parseFloat(number) * Math.pow(10, parseInt(n))) /
    Math.pow(10, parseInt(n))
  );
};

export const GetMax = (n) => {
  let x = Number.MIN_VALUE;
  for (let i = 0; i < n.length; i++) {
    if (x < n[i]) {
      x = n[i];
    }
  }
  return x;
};

export const GetMin = (n) => {
  let x = Number.MAX_VALUE;
  for (let i = 0; i < n.length; i++) {
    if (x > n[i]) {
      x = n[i];
    }
  }
  return x;
};

export const FormatTime = (x) => {
  let date = new Date(x);
  return `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
};

export const FormatDateTime = (x) => {
  let date = new Date(x);
  return `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

export const PairDecimalsAmount = {
  "XDC-USDT": 0,
  "XDC-XRP": 0,
  "BTC-USDT": 5,
  "USDT-USDT": 0,
  "BRG-USDT": 0,
  "BRG-BTC": 0,
  "XDC-ETH": 0,
  "XDC-BTC": 0,
  "SRX-USDT": 0,
  "XDC-EUR": 0,
  "XDC-USDC": 0,
  "PLI-USDT": 0,
  "LUNA-USDT": 0,
  "XRP-USDT": 1,
  "LBT-USDT": 0,
};

export const CurrencyDecimalsAmount = {
  XDC: 0,
  BTC: 5,
  USDT: 0,
  BRG: 0,
  XRP: 2,
  ETH: 4,
  USD: 0,
  SRX: 4,
  EUR: 4,
  USDC: 0,
  PLI: 4,
  LUNA: 4,
  LBT: 4,
};

export const PairDecimalsPrice = {
  "BRG-USDT": 6,
  "BRG-BTC": 8,
  "XDC-USDT": 8,
  "XDC-XRP": 8,
  "BTC-USDT": 2,
  "USDT-USDT": 4,
  "XDC-ETH": 8,
  "XDC-BTC": 8,
  "XDC-USD": 8,
  "XDC-SGD": 8,
  "XDC-IDR": 8,
  "SRX-USDT": 6,
  "XDC-EUR": 8,
  "XDC-USDC": 8,
  "PLI-USDT": 6,
  "PLI-USDG": 6,
  "PLI-XDC": 6,
  "SRX-XDC": 6,
  "LUNA-USDT": 8,
  "XRP-USDT": 6,
  "LBT-USDT": 6,
};

export const Accounts = [
  <option key={0} value={""}>
    Select
  </option>,
  <option key={1} value={"AB"}>
    Hakkan (AB)
  </option>,
  <option key={2} value={"VB"}>
    Sina (VB)
  </option>,
  <option key={2} value={"VB1"}>
    (VB1)
  </option>,
  <option key={2} value={"VB2"}>
    (VB2)
  </option>,
];

export const GenericAccounts = [
  <option key={0} value={""}>
    Select
  </option>,
  <option key={1} value={"AB"}>
    AB
  </option>,
  <option key={2} value={"VB"}>
    VB
  </option>,
];

export const AdjustmentType = [
  <option key={0} value={""}>
    Select
  </option>,
  <option key={1} value={"deposit"}>
    Deposit
  </option>,
  <option key={2} value={"withdraw"}>
    Withdraw
  </option>,
];

/**
 * removeExpo will remove exponentials from the number
 * @param {Number | String} x the number which needs to converted into string
 */
export const RemoveExpo = (x) => {
  var data = String(x).split(/[eE]/);
  if (data.length == 1) return data[0];

  var z = "",
    sign = x < 0 ? "-" : "",
    str = data[0].replace(".", ""),
    mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
};

/**
 *
 * @param {String | Number} n number
 */
export function AddDelimiter(n) {
  let [whole, decimals] = n.split(".");
  if (!decimals) decimals = "";
  else decimals = "." + decimals;
  return `${whole}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + decimals;
}
export const Capitalize = (text) => {
  return text[0].toUpperCase() + text.slice(1) || "";
};

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
