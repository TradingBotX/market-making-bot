import * as types from "../actions/types";

const initialState = {
  socket: null,
  status: "not initiated",
  rooms: [],
  v: 0,
};

const SocketChange = (state = initialState, action) => {
  switch (action.type) {
    case types.SOCKET_CONNECTED: {
      return {
        ...state,
        socket: action.instance,
        status: "connected",
        v: state.v + 1,
      };
    }
    case types.SOCKET_DISCONNECTED: {
      return { ...state, status: "disconnected" };
    }
    default: {
      return state;
    }
  }
};

export default SocketChange;
