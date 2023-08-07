import * as types from "../actions/types";

const initialData = {
  success: null,
  error: null,
  data: null,
  loading: false,
  ts: null,
  isLoggedIn: localStorage.getItem("crypbot_auth") || false,
  v: 0,
};

export default function (state = initialData, action) {
  switch (action.type) {
    case types.LOGIN_START: {
      return {
        ...state,
        loading: true,
        success: null,
        error: null,
        ts: Date.now(),
      };
    }
    case types.LOGIN_SUCCESS: {
      localStorage.setItem("crypbot_auth", true);
      return {
        ...state,
        success: action.success || null,
        data: action.data,
        error: null,
        isLoggedIn: true,
        v: state.v + 1,
      };
    }

    case types.LOGIN_FAIL: {
      return {
        ...state,
        success: null,
        error: action.error,
        v: state.v + 1,
      };
    }

    case types.LOGIN_FINISH: {
      return {
        ...state,
        loading: false,
        ts: Date.now(),
        error: null,
        success: null,
      };
    }

    case types.LOGOUT_SUCCESS: {
      localStorage.setItem("crypbot_auth", false);
      return {
        ...state,
        isLoggedIn: false,
        ts: Date.now(),
      };
    }

    default:
      return state;
  }
}
