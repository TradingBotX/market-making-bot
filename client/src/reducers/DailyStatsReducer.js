import { actions } from "react-table";
import * as types from "../actions/types";

const initialState = {
  getStatsTime: {
    success: null,
    error: null,
    loading: false,
    data: null,
    ts: null,
    v: 0,
  },
  getStatsData: {
    success: null,
    error: null,
    loading: false,
    data: null,
    ts: null,
    v: 0,
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.GET_DAILY_STATS_TIME_START: {
      return {
        ...state,
        getStatsTime: {
          ...state.getStatsTime,
          success: null,
          error: null,
          loading: true
        }
      };
    }
    case types.GET_DAILY_STATS_TIME_SUCCESS: {
      return {
        ...state,
        getStatsTime: {
          ...state.getStatsTime,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.getStatsTime.v + 1
        }
      };
    }
    case types.GET_DAILY_STATS_TIME_FAIL: {
      return {
        ...state,
        getStatsTime: {
          data: null,
          error: action.error,
          v: state.getStatsTime.v + 1
        }
      };
    }
    case types.GET_DAILY_STATS_TIME_FINISH: {
      return {
        ...state,
        getStatsTime: {
          ...state.getStatsTime,
          ts: Date.now()
        }
      };
    }
    case types.GET_DAILY_STATS_DATA_START: {
      return {
        ...state,
        getStatsData: {
          ...state.getStatsData,
          success: null,
          error: null,
          loading: true
        }
      };
    }
    case types.GET_DAILY_STATS_DATA_SUCCESS: {
      return {
        ...state,
        getStatsData: {
          ...state.getStatsData,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.getStatsData.v + 1
        }
      };
    }
    case types.GET_DAILY_STATS_DATA_FAIL: {
      return {
        ...state,
        getStatsData: {
          data: null,
          error: action.error,
          v: state.getStatsData.v + 1
        }
      };
    }
    case types.GET_DAILY_STATS_DATA_FINISH: {
      return {
        ...state,
        getStatsData: {
          ...state.getStatsData,
          ts: Date.now()
        }
      };
    }
    default:
      return state;
  }
}