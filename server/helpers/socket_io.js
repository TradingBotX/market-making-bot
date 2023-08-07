const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const jwt = require("jsonwebtoken");

const { RedisClient } = require("../services/redis");

io.listen(process.env.WS_PORT || 3002);

global.socket_io = io;

let SOCKET_COUNT = 0;

/**
 *
 *  SOCKET MIDDDLEWARE STARTS
 *
 */

io.use((socket, next) => {
  try {
    if (socket.handshake.query.transfer == "test") {
      next();
    } else {
      if (!socket.handshake.query && !socket.handshake.query.jwt) {
        return socket.disconnect();
      }

      const token = socket.handshake.query.jwt;

      const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      if (decodedUser.exp * 1000 < Date.now()) return socket.disconnect();

      logger.debug(":ws jwt ok");

      socket.user = decodedUser;

      next();
    }
  } catch (e) {
    logger.error("socket_connection_error", e);
    return socket.disconnect();
  }
});

io.use((socket, next) => {
  SOCKET_COUNT++;
  emitSocketSync();
  next();
});

/**connected to mongodb
 *
 *  SOCKET MIDDDLEWARE STOPS
 *
 * @note no listerners in socket handler permitted without proper exit calls
 */

/**
 *
 * SOCKET CONNECTION HANDLER STARTS
 *
 */
io.on("connection", (socket) => {
  let last_ping = Date.now();
  let intervalRef;

  emitSocketSync();
  // logger.debug(":ws ", socket.user.email);

  socket.on("ping-transfer", (cb) => {
    last_ping = Date.now();
    socket.emit("pong");
    cb(true);
  });

  socket.on("heart-beat", (token) => {
    try {
      const currDecoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (currDecoded.email !== socket.user.email) return socket.disconnect();
      if (currDecoded.exp * 1000 < Date.now()) return socket.disconnect();
      last_ping = Date.now();
      socket.emit("pong");
    } catch (e) {
      logger.error(e);
      if (socket) socket.disconnect();
    }
  });

  socket.once("disconnect", () => {
    socket = undefined;
    clearInterval(intervalRef);
    SOCKET_COUNT--;
    emitSocketSync();
  });

  socket.on("joinRooms", (rooms) => {
    rooms.forEach((room) => {
      console.log("joining room", room);
      socket.join(room);
      emitStarterData(room, socket);
    });
    emitSocketSync();
  });

  socket.on("leaveAll", () => {
    socket.leaveAll();
  });

  socket.on("get_wallet_balance", () => {
    emitStarterData("wallet", socket);
  });

  intervalRef = setInterval(() => {
    if (Date.now() - last_ping > 10000) {
      socket.disconnect();
    }
  }, 5000);
});

/**
 *
 * SOCKET CONNECTION HANDLER STOPS
 *
 */

/**
 *
 * BROADCASTS STARTS
 *
 */

function emitSocketSync() {
  io.emit("socket_count", SOCKET_COUNT);
}

// setInterval(() => console.log(SOCKET_COUNT), 5000);

/**
 *
 * BROADCASTS STOPS
 *
 */

/**
 *
 * HELPER FUNCS
 *
 */

async function emitStarterData(room, socket) {
  try {
    switch (room) {
      case "op_connect": {
        return InternalBus.emit(GlobalEvents.mongodb_connected);
      }

      case "monitor": {
        return socket.emit("memory_usage", process.memoryUsage());
      }

      case "wallet": {
        socket.emit(
          "balances",
          JSON.parse(await RedisClient.get("wallet_balances"))
        );
        const wallet_balance = JSON.parse(
          await RedisClient.get("wallet_balances")
        );
        const exchanges = Object.keys(wallet_balance);
        let data = [];
        for (let exchange of exchanges) {
          data = [
            ...data,
            ...wallet_balance[exchange].data.map((e) => {
              return { ...e, exchange };
            }),
          ];
        }

        data = data.reduce((acc, e) => {
          const index = acc.includesPartial({
            currency: e.currency,
            botName: e.botName,
          });
          if (index !== null) {
            acc[index].balance += e.balance;
          } else {
            acc.push({
              ...e,
            });
          }
          return acc;
        }, []);

        socket.emit("live_snapshot", data);
        return;
      }

      default:
        return;
    }
  } catch (e) {
    logger.error(e);
  }
}
