import * as types from "../actions/types";

const initialState = {
  status: {
    success: null,
    error: null,
    loading: false,
    data: null,
    ts: null,
    v: 0,
  },
  addAdmin: {
    success: null,
    error: null,
    loading: false,
    data: null,
    ts: null,
    v: 0,
  },
  removeAdmin: {
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
    case types.GET_ADMIN_START: {
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
    case types.GET_ADMIN_SUCCESS: {
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
    case types.GET_ADMIN_FAIL: {
      return {
        ...state,
        status: {
          ...state.status,
          data: null,
          success: null,
          error: action.error,
          v: state.status.v + 1,
        },
      };
    }
    case types.GET_ADMIN_FINISH: {
      return {
        ...state,
        status: {
          ...state.status,
          ts: Date.now(),
        },
      };
    }
    case types.ADD_ADMIN_START: {
      return {
        ...state,
        addAdmin: {
          ...state.addAdmin,
          loading: true,
          success: null,
          error: null,
        },
      };
    }
    case types.ADD_ADMIN_SUCCESS: {
      return {
        ...state,
        addAdmin: {
          ...state.addAdmin,
          loading: false,
          success: action.success,
          data: action.data,
          v: state.addAdmin.v + 1,
        },
      };
    }
    case types.ADD_ADMIN_FAIL: {
      return {
        ...state,
        addAdmin: {
          ...state.addAdmin,
          data: null,
          success: null,
          error: action.error,
          v: state.addAdmin.v + 1,
        },
      };
    }
    case types.ADD_ADMIN_FINISH: {
      return {
        ...state,
        addAdmin: {
          ...state.addAdmin,
          ts: Date.now(),
        },
      };
    }
    case types.REMOVE_ADMIN_START: {
      return {
        ...state,
        removeAdmin: {
          ...state.removeAdmin,
          loading: true,
          success: null,
          data: null,
        },
      };
    }
    case types.REMOVE_ADMIN_SUCCESS: {
      return {
        ...state,
        removeAdmin: {
          ...state.removeAdmin,
          success: action.success,
          data: action.data,
          v: state.removeAdmin.v + 1,
        },
      };
    }
    case types.REMOVE_ADMIN_FAIL: {
      return {
        ...state,
        removeAdmin: {
          ...state.removeAdmin,
          data: null,
          success: null,
          error: action.error,
          v: state.removeAdmin.v + 1,
        },
      };
    }
    case types.REMOVE_ADMIN_FINISH: {
      return {
        ...state,
        removeAdmin: {
          ...state.removeAdmin,
          ts: Date.now(),
        },
      };
    }
    default:
      return state;
  }
}
