import * as types from "../actions/types";

const initialData = {
  status: {
    success: null,
    error: null,
    data: null,
    loading: false,
    ts: null,
    v: 0,
    exchanges: [],
    exchangePairs: [],
    exchangePairDecimals: [],
  },
  addExchange: {
    success: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  addExchangePair: {
    success: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  updateExchangePair: {
    success: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  activateExchange: {
    success: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  deactivateExchange: {
    success: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  updateExchangeFee: {
    success: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  getCurrency: {
    success: null,
    error: null,
    loading: false,
    data: null,
    ts: null,
    v: 0,
  },
  addCurrency: {
    success: null,
    data: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  exchangeAdd: {
    success: null,
    data: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  updateExchangeCurrency: {
    success: null,
    data: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  volumeBotDetails: {
    success: null,
    data: null,
    error: null,
    loading: false,
    ts: null,
    v: 0,
  },
  noSpreadBotDetails: {
    success: null,
    error: null,
    loading: false,
    data: null,
    ts: null,
    v: 0,
  },
};

export default function (state = initialData, action) {
  switch (action.type) {
    case types.EXCHANGE_GET_START: {
      return {
        ...state,
        status: {
          ...state.status,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.EXCHANGE_GET_SUCCESS: {
      const exchanges = action.data.map(({ exchange }) => exchange);
      let exchangePairs = action.data.reduce((acc, exchange) => {
        acc[exchange.exchange] = exchange.pair;
        return acc;
      }, {});
      // const exchangePairDecimals = exchangePairs.map((e) => {
      //   const query = {};
      //   query[e.exchange] = {
      //     minAmount: e.minAmount,
      //     decimalsAmount: e.decimalsAmount,
      //     decimalsPrice: e.decimalsPrice,
      //   };
      //   return { ...query };
      // });
      // exchangePairs = exchangePairs.map((e) => e.name);
      let exchangePairDecimals = action.data.reduce((acc, exchange) => {
        acc[exchange.exchange] = exchange.pair.map(
          ({ name, decimalsAmount, decimalsPrice, minAmount }) => {
            const query = {};
            query[name] = {
              name,
              decimalsAmount,
              decimalsPrice,
              minAmount,
            };
            return query;
          }
        );
        return acc;
      }, {});

      return {
        ...state,
        status: {
          ...state.status,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.status.v + 1,
          exchangePairs,
          exchanges,
          exchangePairDecimals,
        },
      };
    }

    case types.EXCHANGE_GET_FAIL: {
      return {
        ...state,
        status: {
          ...state.status,
          data: null,
          error: action.error,
          v: state.status.v + 1,
        },
      };
    }

    case types.EXCHANGE_GET_FINISH: {
      return {
        ...state,
        status: {
          ...state.status,
          ts: Date.now(),
        },
      };
    }

    /**
     *
     *
     *
     *
     *
     *
     */

    case types.EXCHANGE_ADD_START: {
      return {
        ...state,
        addExchange: {
          ...state.addExchange,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.EXCHANGE_ADD_SUCCESS: {
      return {
        ...state,
        addExchange: {
          ...state.addExchange,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.addExchange.v + 1,
        },
      };
    }

    case types.EXCHANGE_ADD_FAIL: {
      return {
        ...state,
        addExchange: {
          ...state.addExchange,
          data: null,
          error: action.error,
          v: state.addExchange.v + 1,
        },
      };
    }

    case types.EXCHANGE_ADD_FINISH: {
      return {
        ...state,
        addExchange: {
          ...state.addExchange,
          ts: Date.now(),
        },
      };
    }

    /**
     *
     *
     *
     *
     */

    case types.EXCHANGE_ADD_PAIR_START: {
      return {
        ...state,
        addExchangePair: {
          ...state.addExchangePair,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.EXCHANGE_ADD_PAIR_SUCCESS: {
      return {
        ...state,
        addExchangePair: {
          ...state.addExchangePair,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.addExchangePair.v + 1,
        },
      };
    }

    case types.EXCHANGE_ADD_PAIR_FAIL: {
      return {
        ...state,
        addExchangePair: {
          ...state.addExchangePair,
          data: null,
          error: action.error,
          v: state.addExchangePair.v + 1,
        },
      };
    }

    case types.EXCHANGE_ADD_PAIR_FINISH: {
      return {
        ...state,
        addExchangePair: {
          ...state.addExchangePair,
          ts: Date.now(),
        },
      };
    }

    /**
     *
     *
     *
     *
     */

    case types.EXCHANGE_UPDATE_PAIR_START: {
      return {
        ...state,
        updateExchangePair: {
          ...state.updateExchangePair,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.EXCHANGE_UPDATE_PAIR_SUCCESS: {
      return {
        ...state,
        updateExchangePair: {
          ...state.updateExchangePair,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.updateExchangePair.v + 1,
        },
      };
    }

    case types.EXCHANGE_UPDATE_PAIR_FAIL: {
      return {
        ...state,
        updateExchangePair: {
          ...state.updateExchangePair,
          data: null,
          error: action.error,
          v: state.updateExchangePair.v + 1,
        },
      };
    }

    case types.EXCHANGE_UPDATE_PAIR_FINISH: {
      return {
        ...state,
        updateExchangePair: {
          ...state.updateExchangePair,
          ts: Date.now(),
        },
      };
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     */

    case types.EXCHANGE_UPDT_TF_START: {
      return {
        ...state,
        updateExchangeFee: {
          ...state.updateExchangeFee,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.EXCHANGE_UPDT_TF_SUCCESS: {
      return {
        ...state,
        updateExchangeFee: {
          ...state.updateExchangeFee,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.updateExchangeFee.v + 1,
        },
      };
    }

    case types.EXCHANGE_UPDT_TF_FAIL: {
      return {
        ...state,
        updateExchangeFee: {
          ...state.updateExchangeFee,
          data: null,
          error: action.error,
          v: state.updateExchangeFee.v + 1,
        },
      };
    }

    case types.EXCHANGE_UPDT_TF_FINISH: {
      return {
        ...state,
        updateExchangeFee: {
          ...state.updateExchangeFee,
          ts: Date.now(),
        },
      };
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     */

    case types.EXCHANGE_ACTIVATE_START: {
      return {
        ...state,
        activateExchange: {
          ...state.activateExchange,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.EXCHANGE_ACTIVATE_SUCCESS: {
      return {
        ...state,
        activateExchange: {
          ...state.activateExchange,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.activateExchange.v + 1,
        },
      };
    }

    case types.EXCHANGE_ACTIVATE_FAIL: {
      return {
        ...state,
        activateExchange: {
          ...state.activateExchange,
          data: null,
          error: action.error,
          v: state.activateExchange.v + 1,
        },
      };
    }

    case types.EXCHANGE_ACTIVATE_FINISH: {
      return {
        ...state,
        activateExchange: {
          ...state.activateExchange,
          ts: Date.now(),
        },
      };
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     */

    case types.EXCHANGE_DEACTIVATE_START: {
      return {
        ...state,
        activateExchange: {
          ...state.activateExchange,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.EXCHANGE_DEACTIVATE_SUCCESS: {
      return {
        ...state,
        deactivateExchange: {
          ...state.deactivateExchange,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.deactivateExchange.v + 1,
        },
      };
    }

    case types.EXCHANGE_DEACTIVATE_FAIL: {
      return {
        ...state,
        deactivateExchange: {
          ...state.deactivateExchange,
          data: null,
          error: action.error,
          v: state.deactivateExchange.v + 1,
        },
      };
    }

    case types.EXCHANGE_DEACTIVATE_FINISH: {
      return {
        ...state,
        deactivateExchange: {
          ...state.deactivateExchange,
          ts: Date.now(),
        },
      };
    }

    case types.EXCHANGE_CURRENCY_GET_START: {
      return {
        ...state,
        getCurrency: {
          ...state.getCurrency,
          loading: true,
          success: null,
          error: null,
        },
      };
    }
    case types.EXCHANGE_CURRENCY_GET_SUCCESS: {
      const exchangeToCurrency = action.data.reduce((acc, e) => {
        acc[e.exchange] = e.currency.map((e) => e.symbol);
        return acc;
      }, {});
      console.log("exchangeToCurrency", exchangeToCurrency);
      return {
        ...state,
        getCurrency: {
          ...state.getCurrency,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.getCurrency.v + 1,
          exchangeToCurrency,
        },
      };
    }
    case types.EXCHANGE_CURRENCY_GET_FAIL: {
      return {
        ...state,
        getCurrency: {
          ...state.getCurrency,
          data: null,
          error: action.error,
          v: state.getCurrency.v + 1,
        },
      };
    }
    case types.EXCHANGE_CURRENCY_GET_FINISH: {
      return {
        ...state,
        getCurrency: {
          ...state.getCurrency,
          ts: Date.now(),
        },
      };
    }

    case types.EXCHANGE_CURRENCY_ADD_START: {
      return {
        ...state,
        exchangeAdd: {
          ...state.exchangeAdd,
          loading: true,
          success: null,
          error: null,
        },
      };
    }
    case types.EXCHANGE_CURRENCY_ADD_SUCCESS: {
      return {
        ...state,
        exchangeAdd: {
          ...state.exchangeAdd,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.exchangeAdd.v + 1,
        },
      };
    }
    case types.EXCHANGE_CURRENCY_ADD_FAIL: {
      return {
        ...state,
        exchangeAdd: {
          ...state.exchangeAdd,
          data: null,
          error: action.error,
          v: state.exchangeAdd.v + 1,
        },
      };
    }
    case types.EXCHANGE_CURRENCY_ADD_FINISH: {
      return {
        ...state,
        exchangeAdd: {
          ...state.exchangeAdd,
          ts: Date.now(),
        },
      };
    }

    case types.ADD_EXCHANGE_CURRENCY_START: {
      return {
        ...state,
        addCurrency: {
          ...state.addCurrency,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.ADD_EXCHANGE_CURRENCY_SUCCESS: {
      return {
        ...state,
        addCurrency: {
          ...state.addCurrency,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.addCurrency.v + 1,
        },
      };
    }

    case types.ADD_EXCHANGE_CURRENCY_FAIL: {
      return {
        ...state,
        addCurrency: {
          ...state.addCurrency,
          data: null,
          error: action.error,
          v: state.addCurrency.v + 1,
        },
      };
    }

    case types.ADD_EXCHANGE_CURRENCY_FINISH: {
      return {
        ...state,
        addCurrency: {
          ...state.addCurrency,
          ts: Date.now(),
        },
      };
    }

    case types.UPDATE_EXCHANGE_CURRENCY_START: {
      return {
        ...state,
        updateExchangeCurrency: {
          ...state.updateExchangeCurrency,
          loading: true,
          success: null,
          error: null,
        },
      };
    }

    case types.UPDATE_EXCHANGE_CURRENCY_SUCCESS: {
      return {
        ...state,
        updateExchangeCurrency: {
          ...state.updateExchangeCurrency,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.updateExchangeCurrency.v + 1,
        },
      };
    }

    case types.UPDATE_EXCHANGE_CURRENCY_FAIL: {
      return {
        ...state,
        updateExchangeCurrency: {
          ...state.updateExchangeCurrency,
          data: null,
          error: action.error,
          v: state.updateExchangeCurrency.v + 1,
        },
      };
    }

    case types.ADD_EXCHANGE_CURRENCY_FINISH: {
      return {
        ...state,
        updateExchangeCurrency: {
          ...state.updateExchangeCurrency,
          ts: Date.now(),
        },
      };
    }

    /**
     *
     *
     *
     *
     *
     *
     *
     *
     */

    default:
      return state;
  }
}
