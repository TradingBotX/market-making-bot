import * as types from "../actions/types";

const initialState = {
  updateProfile: {
    success: null,
    error: null,
    loading: false,
    data: null,
    ts: null,
    v: 0,
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case types.UPDATE_ADMIN_PROFILE_START: {
      return {
        ...state,
        updateProfile: {
          ...state.updateProfile,
          loading: true,
          success: null,
          error: null
        }
      }
    }

    case types.UPDATE_ADMIN_PROFILE_SUCCESS: {
      return {
        ...state,
        updateProfile: {
          ...state.updateProfile,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.updateProfile.v + 1
        }
      }
    }

    case types.UPDATE_ADMIN_PROFILE_FAIL: {
      return {
        ...state,
        updateProfile: {
          ...state.updateProfile,
          data: null,
          error: action.error,
          v: state.updateProfile.v + 1
        }
      }
    }

    case types.UPDATE_ADMIN_PROFILE_FINISH: {
      return {
        ...state,
        updateProfile: {
          ...state.updateProfile,
          ts: Date.now(),
        }
      }
    }
    default:
      return state;
  }
}