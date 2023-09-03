import * as types from "./types";

import {
  AxiosInstance,
  GetJwt,
  WSS,
  ReconnectionThrottle,
} from "../helpers/constant";
import { ParseError } from "../helpers/ResponseHelper";

/*
  -----------------------------------------------------

  Login Action Starts

  -----------------------------------------------------
*/

let newSocket = null,
  loginSession = false,
  socketClosed = false;
let thisJwt;

export const fetchUserStatus = () => {
  return (dispatch) => {
    AxiosInstance.get("/admin/auth-status", {
      headers: { Authorization: localStorage.getItem("crypbot_jwt") },
    })
      .then((resp) => {
        resp = resp.data;
        // console.log(":fetchuserauthstatus :response", resp);
        if (resp.statusCode === 200) {
          loginSession = true;
          socketClosed = false;
          dispatch({
            type: types.LOGIN_SUCCESS,
            success: null,
            data: resp.userData,
          });
        } else {
          localStorage.setItem("cryp_bot", "");
          dispatch({ type: types.LOGOUT_SUCCESS });
        }
      })
      .catch((e) => {
        // console.log(":fetchUserStatus", e);
        localStorage.setItem("cryp_bot", "");
        dispatch({ type: types.LOGOUT_SUCCESS });
      });
  };
};

export const login = (data) => {
  return (dispatch) => {
    AxiosInstance.post("/admin/sign-in", data, {
      headers: { Authorization: localStorage.getItem("crypbot_jwt") },
    })
      .then((resp) => {
        resp = resp.data;
        // console.log(":login :response ", resp);
        if (resp.statusCode === 200) {
          localStorage.setItem("crypbot_jwt", resp.accessToken);
          socketClosed = false;
          loginSession = true;
          return dispatch({
            type: types.LOGIN_SUCCESS,
            data: resp.userData,
            success: "welcome",
          });
        } else {
          return dispatch({
            type: types.LOGIN_FAIL,
            error: ParseError(resp),
          });
        }
      })
      .catch((e) => {
        // console.log(":login :e", e);
        dispatch({
          type: types.LOGIN_FAIL,
          error: ParseError(e),
        });
        // console.log(e);
      })
      .finally(() => {
        dispatch({
          type: types.LOGIN_FINISH,
        });
      });
  };
};

export const logout = () => {
  return (dispatch) => {
    localStorage.removeItem("crypbot_jwt");
    dispatch({ type: types.LOGOUT_SUCCESS });
    AxiosInstance.post(
      "/admin/sign-out",
      {},
      {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      }
    )
      .then(() => {
        if (newSocket) {
          newSocket.disconnect();
          newSocket = undefined;
          socketClosed = true;
        }
      })
      .catch((e) => {
        // console.log(e);
      });
  };
};

/*
  -----------------------------------------------------

  Login Action Stops

  -----------------------------------------------------
*/

/*
  -----------------------------------------------------

  SOCKET Action STARTS

  -----------------------------------------------------
*/

const SocketClient = require("socket.io-client");

/**
 *
 * @param {Array<String>} rooms array of string
 */
export const ConnectSocket = function (rooms) {
  return (dispatch) => {
    try {
      // console.log(":socket-io :connect", thisJwt === GetJwt());
      let ReconnRef = null,
        pingInterval;

      if (newSocket !== null) {
        // console.log(":disconnect");
        newSocket.disconnect();
      }

      newSocket = SocketClient(WSS, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        query: {
          jwt: GetJwt(),
        },
      });

      newSocket.once("connect", () => {
        // console.log(":socketio :connected", newSocket.connected);
        if (rooms) {
          newSocket.emit("joinRooms", rooms);
        }
        dispatch({ type: types.SOCKET_CONNECTED, instance: newSocket });

        pingInterval = setInterval(() => {
          if (socketClosed === true) {
            clearInterval(pingInterval);
            return;
          }
          newSocket.emit("heart-beat", GetJwt());
        }, 60000);

        if (ReconnRef !== null) clearInterval(ReconnRef);

        // console.log(":socketio :completed");
      });
    } catch (e) {
      // console.log(e);
    }
  };
};

/*
  -----------------------------------------------------

  SOCKET Action Stops

  -----------------------------------------------------
*/

/*
  -----------------------------------------------------

  Management Action Starts

  -----------------------------------------------------
*/

export const GetExchanges = () => {
  return (dispatch) => {
    try {
      dispatch({ type: types.EXCHANGE_GET_START });
      AxiosInstance.get("/admin/exchange-details", {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          // console.log(":get-exchanges :success", resp.data);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.EXCHANGE_GET_SUCCESS,
              success: resp.message,
              data: resp.data,
            });
          } else {
            // console.log(":get-exchanges :error", resp);
            dispatch({
              type: types.EXCHANGE_GET_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":get-exchanges :error", e, err);
          dispatch({ type: types.EXCHANGE_GET_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_GET_FINISH });
        });
    } catch (e) {
      // console.log(e);
      let err = ParseError(e);
      // console.log(":get-exchanges :error", e, err);
      dispatch({ type: types.EXCHANGE_GET_FAIL, error: err });
    }
  };
};

export const AddExchange = (data) => {
  return (dispatch) => {
    try {
      const { exchange, tradeFee } = data;
      dispatch({ type: types.EXCHANGE_ADD_START });
      AxiosInstance.post(
        "/admin/add-exchange",
        { exchange, tradeFee },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":AddExchange :success", resp.data);
          if (resp.statusCode === 201) {
            dispatch({
              type: types.EXCHANGE_ADD_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":AddExchange :error", resp);
            dispatch({
              type: types.EXCHANGE_ADD_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":AddExchange :error", err);
          dispatch({ type: types.EXCHANGE_ADD_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_ADD_FINISH });
        });
    } catch (e) {
      // console.log(e);
      dispatch({ type: types.EXCHANGE_ADD_FAIL, error: ParseError(e) });
    }
  };
};

export const UpdateExchangePair = (data) => {
  return (dispatch) => {
    try {
      const {
        exchange,
        decimalsAmount = null,
        decimalsPrice = null,
        minAmount = null,
        pair,
      } = data;
      dispatch({ type: types.EXCHANGE_UPDATE_PAIR_START });
      AxiosInstance.post(
        "/admin/update-exchange-pair",
        { exchange, pair, decimalsAmount, decimalsPrice, minAmount },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":AddExchangePair :success", resp.data);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.EXCHANGE_UPDATE_PAIR_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":AddExchangePair :error", resp.data);
            dispatch({
              type: types.EXCHANGE_UPDATE_PAIR_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":AddExchangePair :error", e, err);
          dispatch({ type: types.EXCHANGE_UPDATE_PAIR_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_UPDATE_PAIR_FINISH });
        });
    } catch (e) {
      // console.log(e);
      dispatch({ type: types.EXCHANGE_UPDATE_PAIR_FAIL, error: ParseError(e) });
    }
  };
};

export const AddExchangePair = (data) => {
  return (dispatch) => {
    try {
      const { exchange, decimalsAmount, decimalsPrice, minAmount, pair } = data;
      dispatch({ type: types.EXCHANGE_ADD_PAIR_START });
      AxiosInstance.post(
        "/admin/add-exchange-pair",
        { exchange, pair, decimalsAmount, decimalsPrice, minAmount },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":AddExchangePair :success", resp.data);
          if (resp.statusCode === 201) {
            dispatch({
              type: types.EXCHANGE_ADD_PAIR_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":AddExchangePair :error", resp.data);
            dispatch({
              type: types.EXCHANGE_ADD_PAIR_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":AddExchangePair :error", e, err);
          dispatch({ type: types.EXCHANGE_ADD_PAIR_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_ADD_PAIR_FINISH });
        });
    } catch (e) {
      // console.log(e);
      dispatch({ type: types.EXCHANGE_ADD_PAIR_FAIL, error: ParseError(e) });
    }
  };
};

export const ActivateExchange = (data) => {
  return (dispatch) => {
    try {
      const { exchange } = data;
      dispatch({ type: types.EXCHANGE_ACTIVATE_START });
      AxiosInstance.post(
        "/admin/activate-exchange",
        { exchange },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":ActivateExchange :success", resp.data);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.EXCHANGE_ACTIVATE_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":ActivateExchange :error", resp);
            dispatch({
              type: types.EXCHANGE_ACTIVATE_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":ActivateExchange :success", e, err);
          dispatch({ type: types.EXCHANGE_ACTIVATE_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_ACTIVATE_FINISH });
        });
    } catch (e) {
      // console.log(e);
      dispatch({ type: types.EXCHANGE_ACTIVATE_FAIL, error: ParseError(e) });
    }
  };
};

export const DeactivateExchange = (data) => {
  return (dispatch) => {
    try {
      const { exchange } = data;
      dispatch({ type: types.EXCHANGE_DEACTIVATE_START });
      AxiosInstance.post(
        "/admin/deactivate-exchange",
        { exchange },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":DeactivateExchange :success", resp.data);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.EXCHANGE_DEACTIVATE_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":DeactivateExchange :error", resp);
            dispatch({
              type: types.EXCHANGE_DEACTIVATE_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":DeactivateExchange :success", e, err);
          dispatch({ type: types.EXCHANGE_DEACTIVATE_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_DEACTIVATE_FINISH });
        });
    } catch (e) {
      // console.log(e);
      dispatch({ type: types.EXCHANGE_DEACTIVATE_FAIL, error: ParseError(e) });
    }
  };
};

export const ExchangeUpdateFee = (data) => {
  return (dispatch) => {
    try {
      const { exchange, tradeFee } = data;
      dispatch({ type: types.EXCHANGE_UPDT_TF_START });
      AxiosInstance.post(
        "/admin/update-exchange-trade-fee",
        { exchange, tradeFee },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":ExchangeUpdateFee :success", resp.data);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.EXCHANGE_UPDT_TF_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":ExchangeUpdateFee :error", resp);
            dispatch({
              type: types.EXCHANGE_UPDT_TF_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":ExchangeUpdateFee :success", e, err);
          dispatch({ type: types.EXCHANGE_UPDT_TF_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_UPDT_TF_FINISH });
        });
    } catch (e) {
      // console.log(e);
      dispatch({ type: types.EXCHANGE_UPDT_TF_FAIL, error: ParseError(e) });
    }
  };
};

export const GetExchangeCurrency = () => {
  return (dispatch) => {
    try {
      dispatch({ type: types.EXCHANGE_CURRENCY_GET_START });
      AxiosInstance.get("/admin/exchangeCurrencies", {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          // console.log(":exchanage currency get :resp", resp.data);
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.EXCHANGE_CURRENCY_GET_SUCCESS,
              data: resp.data.exchangeData,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.EXCHANGE_CURRENCY_GET_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          // console.log(e);
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_CURRENCY_GET_FINISH });
        });
    } catch (e) {
      // console.log(":actions :Exchange Currency", e);
      dispatch({
        type: types.EXCHANGE_CURRENCY_GET_FAIL,
        error: ParseError(e),
      });
    }
  };
};

export const AddExchangeCurrency = ({
  name,
  symbol,
  exchange,
  exchangeSymbol,
  minimumBalance,
}) => {
  return (dispatch) => {
    try {
      dispatch({ type: types.ADD_EXCHANGE_CURRENCY_START });
      AxiosInstance.post(
        "/admin/ec-add-exchange-currency",
        {
          name,
          symbol,
          exchange,
          exchangeSymbol,
          minimumBalance,
        },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":ExchangeUpdateFee :success", resp.data);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.ADD_EXCHANGE_CURRENCY_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":ExchangeUpdateFee :error", resp);
            dispatch({
              type: types.ADD_EXCHANGE_CURRENCY_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":ExchangeUpdateFee :success", e, err);
          dispatch({ type: types.ADD_EXCHANGE_CURRENCY_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.ADD_EXCHANGE_CURRENCY_FINISH });
        });
    } catch (e) {
      // console.log(e);
      dispatch({
        type: types.ADD_EXCHANGE_CURRENCY_FAIL,
        error: ParseError(e),
      });
    }
  };
};

export const ExchangeCurrencyAdd = ({ exchange }) => {
  return (dispatch) => {
    try {
      dispatch({ type: types.EXCHANGE_CURRENCY_ADD_START });
      AxiosInstance.post(
        "/admin/ec-add-exchange",
        { exchange },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":AddExchangeCurrency :success", resp.data);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.EXCHANGE_CURRENCY_ADD_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":AddExchangeCurrency :error", resp);
            dispatch({
              type: types.EXCHANGE_CURRENCY_ADD_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":AddExchangeCurrency :success", e, err);
          dispatch({ type: types.EXCHANGE_CURRENCY_ADD_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.EXCHANGE_CURRENCY_ADD_FINISH });
        });
    } catch (e) {
      // console.log(e);
      dispatch({
        type: types.EXCHANGE_CURRENCY_ADD_FAIL,
        error: ParseError(e),
      });
    }
  };
};

export const ExchangeCurrencyUpdate = ({
  exchange,
  symbol,
  name,
  currencyId,
  exchangeSymbol,
  minimumBalance,
}) => {
  return (dispatch) => {
    try {
      dispatch({ type: types.UPDATE_EXCHANGE_CURRENCY_START });
      AxiosInstance.post(
        "/admin/ec-update-exchange-currency",
        { exchange, symbol, name, currencyId, exchangeSymbol, minimumBalance },
        {
          headers: { Authorization: localStorage.getItem("crypbot_jwt") },
        }
      )
        .then((resp) => {
          resp = resp.data;
          // console.log(":UpdateExchangeCurrency :success", resp.data);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.UPDATE_EXCHANGE_CURRENCY_SUCCESS,
              success: resp.message,
            });
          } else {
            // console.log(":UpdateExchangeCurrency :error", resp);
            dispatch({
              type: types.UPDATE_EXCHANGE_CURRENCY_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          // console.log(":UpdateExchangeCurrency :error", e, err);
          dispatch({ type: types.UPDATE_EXCHANGE_CURRENCY_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.UPDATE_EXCHANGE_CURRENCY_FINISH });
        });
    } catch (e) {
      // console.log(":UpdateExchangeCurrency :error", e);
      dispatch({
        type: types.UPDATE_EXCHANGE_CURRENCY_FAIL,
        error: ParseError(e),
      });
    }
  };
};

/*
  -----------------------------------------------------

  Management Action Stops

  -----------------------------------------------------
*/

export const GetAdmin = () => {
  return (dispatch) => {
    try {
      dispatch({ type: types.GET_ADMIN_START });
      AxiosInstance.get("/admin/getAdmin", {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          // console.log(":GetAdmin", resp);
          if (resp.statusCode === 200) {
            dispatch({
              type: types.GET_ADMIN_SUCCESS,
              data: resp.data,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.GET_ADMIN_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          // console.log(":GetAdmin", e);
          dispatch({ type: types.GET_ADMIN_FAIL, error: ParseError(e) });
        })
        .finally(() => {
          dispatch({ type: types.GET_ADMIN_FINISH });
        });
    } catch (e) {
      // console.log(":GetAdmin", e);
      dispatch({ type: types.GET_ADMIN_FAIL, error: ParseError(e) });
    }
  };
};

export const AddAdmin = (data) => {
  return (dispatch) => {
    try {
      dispatch({
        type: types.ADD_ADMIN_START,
      });
      AxiosInstance.post("/admin/acceptAdmin", data, {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.ADD_ADMIN_SUCCESS,
              data: resp.data,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.ADD_ADMIN_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          // console.log(e);
          dispatch({
            type: types.ADD_ADMIN_FAIL,
            error: ParseError(e),
          });
        })
        .finally(() => {
          dispatch({
            type: types.ADD_ADMIN_FINISH,
          });
        });
    } catch (e) {
      // console.log("e", e);
      dispatch({
        type: types.ADD_ADMIN_FAIL,
        error: "something went wrong",
      });
    }
  };
};

export const RemoveAdmin = (data) => {
  return (dispatch) => {
    try {
      dispatch({
        type: types.REMOVE_ADMIN_START,
      });
      AxiosInstance.post("/admin/rejectAdmin", data, {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.REMOVE_ADMIN_SUCCESS,
              data: resp.data,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.REMOVE_ADMIN_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          // console.log(e);
          dispatch({
            type: types.REMOVE_ADMIN_FAIL,
            error: ParseError(e),
          });
        })
        .finally(() => {
          dispatch({
            type: types.REMOVE_ADMIN_FINISH,
          });
        });
    } catch (e) {
      // console.log("e", e);
      dispatch({
        type: types.REMOVE_ADMIN_FAIL,
        error: "something went wrong",
      });
    }
  };
};

/*
  -----------------------------------------------------

  Admin Start

  -----------------------------------------------------
*/

export const UpdateMailProfile = (data) => {
  return (dispatch) => {
    try {
      dispatch({
        type: types.UPDATE_ADMIN_PROFILE_START,
      });
      AxiosInstance.post("/admin/updatemailpref", data, {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.UPDATE_ADMIN_PROFILE_SUCCESS,
              data: resp.data,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.UPDATE_ADMIN_PROFILE_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          // console.log(e);
          dispatch({
            type: types.UPDATE_ADMIN_PROFILE_FAIL,
            error: ParseError(e),
          });
        })
        .finally(() => {
          dispatch({
            type: types.UPDATE_ADMIN_PROFILE_FINISH,
          });
        });
    } catch (e) {
      // console.error("e", e);
      dispatch({
        type: types.UPDATE_ADMIN_PROFILE_FAIL,
        error: "something went wrong",
      });
    }
  };
};

export const GetArbitrage = () => {
  return (dispatch) => {
    try {
      dispatch({ type: types.GET_ARBITRAGE_START });
      AxiosInstance.get("/admin/arbitrage-operation", {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode == 200) {
            // console.log(":GetArbitrage action", resp);
            dispatch({
              type: types.GET_ARBITRAGE_SUCCESS,
              success: resp.message,
              data: resp.data,
            });
          } else {
            dispatch({
              type: types.GET_ARBITRAGE_FAIL,
              error: ParseError(resp.error),
            });
          }
        })
        .catch((e) => {
          // console.log(":GetArbitrage", e);
          let err = ParseError(e);
          dispatch({ type: types.GET_ARBITRAGE_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.GET_ARBITRAGE_FINISH });
        });
    } catch (e) {
      // console.log(":GetArbitrage", e);
      let err = ParseError(e);
      dispatch({ type: types.GET_ARBITRAGE_FAIL, error: err });
    }
  };
};

/*
  -----------------------------------------------------

  Admin Stop

  -----------------------------------------------------
*/

/*
  -----------------------------------------------------

  Admin Profile Start

  -----------------------------------------------------
*/

/*
  -----------------------------------------------------

  Admin Profile Start

  -----------------------------------------------------
*/

/*
  -----------------------------------------------------

  Daily Stats Start

  -----------------------------------------------------
*/

export const getDailyStatsTime = () => {
  return (dispatch) => {
    try {
      dispatch({ type: types.GET_DAILY_STATS_TIME_START });
      AxiosInstance.get("/admin/hourly-snapshot/get-timestamps", {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.GET_DAILY_STATS_TIME_SUCCESS,
              data: resp.data,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.GET_DAILY_STATS_TIME_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          dispatch({
            type: types.GET_DAILY_STATS_TIME_FAIL,
            error: ParseError(e),
          });
        })
        .finally(() => {
          dispatch({ type: types.GET_DAILY_STATS_TIME_FINISH });
        });
    } catch (e) {
      dispatch({
        type: types.GET_DAILY_STATS_TIME_FAIL,
        error: ParseError(e),
      });
    }
  };
};

export const getDailyStatsData = (data) => {
  return (dispatch) => {
    try {
      dispatch({ type: types.GET_DAILY_STATS_DATA_START });
      AxiosInstance.post("/admin/hourly-snapshot/get-data-by-timestamp", data, {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.GET_DAILY_STATS_DATA_SUCCESS,
              data: resp.data,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.GET_DAILY_STATS_DATA_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          dispatch({
            type: types.GET_DAILY_STATS_DATA_FAIL,
            error: ParseError(e),
          });
        })
        .finally(() => {
          dispatch({ type: types.GET_DAILY_STATS_DATA_FINISH });
        });
    } catch (error) {
      dispatch({
        type: types.GET_DAILY_STATS_DATA_FAIL,
        error: ParseError(error),
      });
    }
  };
};

/*
  -----------------------------------------------------

  Daily Stats Stop

  -----------------------------------------------------
*/

export const getLiquidityDetails = () => {
  return (dispatch) => {
    try {
      dispatch({ type: types.GET_LIQUIDITY_BOT_START });
      AxiosInstance.get("/spreadbot/getorders", {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.GET_LIQUIDITY_BOT_SUCCESS,
              success: resp.message,
              data: resp.data,
            });
          } else {
            dispatch({
              type: types.GET_LIQUIDITY_BOT_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          dispatch({ type: types.GET_LIQUIDITY_BOT_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.GET_LIQUIDITY_BOT_FINISH });
        });
    } catch (e) {
      let err = ParseError(e);
      dispatch({ type: types.GET_LIQUIDITY_BOT_FAIL, error: err });
    }
  };
};

export const cancelLiquidityBotDetails = (data) => {
  return (dispatch) => {
    try {
      dispatch({ type: types.CANCEL_ORDER_LIQUIDITY_BOT_START });
      AxiosInstance.post("/spreadbot/cancelorder", data, {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.CANCEL_ORDER_LIQUIDITY_BOT_SUCCESS,
              data: resp.data,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.CANCEL_ORDER_LIQUIDITY_BOT_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          dispatch({
            type: types.CANCEL_ORDER_LIQUIDITY_BOT_FAIL,
            error: ParseError(e),
          });
        })
        .finally(() => {
          dispatch({ type: types.CANCEL_ORDER_LIQUIDITY_BOT_FINISH });
        });
    } catch (error) {
      dispatch({
        type: types.CANCEL_ORDER_LIQUIDITY_BOT_FAIL,
        error: ParseError(error),
      });
    }
  };
};

export const getKeys = () => {
  return (dispatch) => {
    try {
      dispatch({ type: types.GET_KEYS_BOT_START });
      AxiosInstance.get("/admin/getkeys", {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.GET_KEYS_BOT_SUCCESS,
              success: resp.message,
              data: resp.data,
            });
          } else {
            dispatch({
              type: types.GET_KEYS_BOT_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          dispatch({ type: types.GET_KEYS_BOT_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.GET_KEYS_BOT_FINISH });
        });
    } catch (e) {
      let err = ParseError(e);
      dispatch({ type: types.GET_KEYS_BOT_FAIL, error: err });
    }
  };
};

export const deleteKey = (data) => {
  return (dispatch) => {
    try {
      dispatch({ type: types.DELETE_KEYS_BOT_START });
      AxiosInstance.post("/admin/deletekey", data, {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.DELETE_KEYS_BOT_SUCCESS,
              data: resp.data,
              success: resp.message,
            });
          } else {
            dispatch({
              type: types.DELETE_KEYS_BOT_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          dispatch({
            type: types.DELETE_KEYS_BOT_FAIL,
            error: ParseError(e),
          });
        })
        .finally(() => {
          dispatch({ type: types.DELETE_KEYS_BOT_FINISH });
        });
    } catch (error) {
      dispatch({
        type: types.DELETE_KEYS_BOT_FAIL,
        error: ParseError(error),
      });
    }
  };
};

export const getLiquidityOrderDetails = (data) => {
  return (dispatch) => {
    try {
      dispatch({ type: types.GET_LIQUIDITY_DETAILS_START });
      AxiosInstance.post("/spreadbot/getorderdetails", data, {
        headers: { Authorization: localStorage.getItem("crypbot_jwt") },
      })
        .then((resp) => {
          resp = resp.data;
          if (resp.statusCode === 200) {
            dispatch({
              type: types.GET_LIQUIDITY_DETAILS_SUCCESS,
              success: resp.message,
              data: resp.data,
            });
          } else {
            dispatch({
              type: types.GET_LIQUIDITY_DETAILS_FAIL,
              error: ParseError(resp),
            });
          }
        })
        .catch((e) => {
          let err = ParseError(e);
          dispatch({ type: types.GET_LIQUIDITY_DETAILS_FAIL, error: err });
        })
        .finally(() => {
          dispatch({ type: types.GET_LIQUIDITY_DETAILS_FINISH });
        });
    } catch (e) {
      let err = ParseError(e);
      dispatch({ type: types.GET_LIQUIDITY_DETAILS_FAIL, error: err });
    }
  };
};
