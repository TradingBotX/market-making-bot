import * as types from "../actions/types";

const initialData = {
  status: {
    success: null,
    error: null,
    data: null,
    loading: false,
    ts: null,
    v: 0,
  },
};

export default function (state = initialData, action) {
  switch (action.type) {
    case types.GET_ARBITRAGE_START: {
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

    case types.GET_ARBITRAGE_SUCCESS: {
      return {
        ...state,
        status: {
          ...state.status,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.status.v + 1,
        },
      };
    }

    case types.GET_ARBITRAGE_FAIL: {
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

    case types.GET_ARBITRAGE_FINISH: {
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

    default:
      return state;
  }
}
