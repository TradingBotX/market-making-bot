const WebSocket = require("ws");

const defaultListener = (d) => {
  console.log("d", d);
};

class WsWrapper {
  constructor(
    name,
    wss,
    listeners = {
      onClose: defaultListener,
      onOpen: defaultListener,
      onError: defaultListener,
      onMessage: defaultListener,
    },
    ...rest
  ) {
    this.socketName = name;
    this.wss = wss;
    this.listeners = listeners;
    this.vars = rest;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.wss);
    this.initiateListeners();
  }

  reconnect() {
    this.socket.removeAllListeners();
    this.socket.close();
    this.socket = undefined;
    this.connect();
  }

  initiateListeners() {
    this.socket.onopen = this.listeners.onOpen.bind(this);
    this.socket.onmessage = this.listeners.onMessage.bind(this);
    this.socket.onerror = this.listeners.onError.bind(this);
    this.socket.onclose = this.listeners.onClose.bind(this);
  }

  terminate() {
    this.socket.removeAllListeners();
    this.socket.close();
  }
}

module.exports = WsWrapper;
