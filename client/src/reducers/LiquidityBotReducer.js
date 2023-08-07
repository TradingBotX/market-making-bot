import * as types from "../actions/types";

const initialState = {
  status: {
    data: null,
    success: null,
    v: 0,
    ts: Date.now(),
    error: null,
    loading: true,
  },
  cancel: {
    data: null,
    success: null,
    v: 0,
    ts: Date.now(),
    error: null,
    loading: true,
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.GET_LIQUIDITY_BOT_START: {
      return {
        ...state,
        status: {
          ...state.status,
          success: null,
          data: null,
          error: null,
          loading: true,
        },
      };
    }
    case types.GET_LIQUIDITY_BOT_SUCCESS: {
      return {
        ...state,
        status: {
          ...state.status,
          success: action.success,
          data: action.data,
          v: state.status.v + 1,
        },
      };
    }

    case types.GET_LIQUIDITY_BOT_FAIL: {
      return {
        ...state,
        status: {
          ...state.status,
          error: action.error,
          v: state.status.v + 1,
        },
      };
    }

    case types.GET_LIQUIDITY_BOT_FINISH: {
      return {
        ...state,
        status: {
          ...state.status,
          loading: false,
          success: null,
          error: null,
          ts: Date.now(),
        },
      };
    }

    case types.CANCEL_ORDER_LIQUIDITY_BOT_START: {
      return {
        ...state,
        cancel: {
          ...state.cancel,
          success: null,
          data: null,
          error: null,
          loading: true,
        },
      };
    }
    case types.CANCEL_ORDER_LIQUIDITY_BOT_SUCCESS: {
      return {
        ...state,
        cancel: {
          ...state.cancel,
          success: action.success,
          data: action.data,
          v: state.cancel.v + 1,
        },
      };
    }

    case types.CANCEL_ORDER_LIQUIDITY_BOT_FAIL: {
      return {
        ...state,
        cancel: {
          ...state.cancel,
          error: action.error,
          v: state.cancel.v + 1,
        },
      };
    }

    case types.CANCEL_ORDER_LIQUIDITY_BOT_FINISH: {
      return {
        ...state,
        cancel: {
          ...state.cancel,
          loading: false,
          success: null,
          error: null,
          ts: Date.now(),
        },
      };
    }

    default:
      return state;
  }
};
