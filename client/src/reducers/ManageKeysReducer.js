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
  delete: {
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
    case types.GET_KEYS_BOT_START: {
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
    case types.GET_KEYS_BOT_SUCCESS: {
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

    case types.GET_KEYS_BOT_FAIL: {
      return {
        ...state,
        status: {
          ...state.status,
          error: action.error,
          v: state.status.v + 1,
        },
      };
    }

    case types.GET_KEYS_BOT_FINISH: {
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

    case types.DELETE_KEYS_BOT_START: {
      return {
        ...state,
        delete: {
          ...state.delete,
          success: null,
          data: null,
          error: null,
          loading: true,
        },
      };
    }
    case types.DELETE_KEYS_BOT_SUCCESS: {
      return {
        ...state,
        delete: {
          ...state.delete,
          success: action.success,
          data: action.data,
          v: state.delete.v + 1,
        },
      };
    }

    case types.DELETE_KEYS_BOT_FAIL: {
      return {
        ...state,
        delete: {
          ...state.delete,
          error: action.error,
          v: state.delete.v + 1,
        },
      };
    }

    case types.DELETE_KEYS_BOT_FINISH: {
      return {
        ...state,
        delete: {
          ...state.delete,
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
