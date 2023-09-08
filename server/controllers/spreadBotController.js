const responseHelper = require("../helpers/RESPONSE");
const { ExchangePairInfo } = require("../helpers/constant");
const {
  LastTradedPrice,
  GetAccount,
  WalletBalance,
  PlaceOrder,
  GetOrderStatus,
  CancelOrder,
} = require("../helpers/orderPlacement");
const spreadBotDetails = require("../models/spreadBotDetails");
const spreadBotOrders = require("../models/spreadBotOrders");
const { getSecondaryPair, RedisClient } = require("../services/redis");
const uuid = require("uuid").v4;

module.exports = {
  addOrder: async (req, res) => {
    try {
      const { exchange, pair, maxOrders, amountBuy, amountSell, percentGap } =
        req.body;
      const price = await LastTradedPrice(exchange, pair);
      const converter = JSON.parse(await RedisClient.get("converterPrice"));
      const usdtPrice = parseFloat(
        parseFloat(price * converter[getSecondaryPair(pair)].bid[0]).toFixed(6)
      );
      const accountData = await GetAccount(exchange);
      const walletBalance = await WalletBalance(exchange, accountData);
      const data1 = walletBalance.filter(
        (e) => e.currency == pair.split("-")[0]
      )[0];
      const data2 = walletBalance.filter(
        (e) => e.currency == pair.split("-")[1]
      )[0];
      const uniqueId = uuid();
      const newOrder = new spreadBotDetails({
        uniqueId,
        exchange,
        pair,
        price,
        usdtPrice,
        amountBuy,
        amountSell,
        status: "active",
        mappedOrders: [],
        maxOrders,
        started: false,
        percentGap: parseFloat(parseFloat(percentGap / 1000).toFixed(4)),
        balanceToBeMaintanedC1: parseFloat(data1.total),
        balanceToBeMaintanedC2: parseFloat(data2.total),
        lastSettledAtC1: usdtPrice,
        lastSettledAtC2: parseFloat(
          parseFloat(converter[getSecondaryPair(pair)].bid[0]).toFixed(6)
        ),
      });
      await newOrder.save();
      return responseHelper.successWithMessage(res, "New Order Addedd.");
    } catch (error) {
      logger.error(`spreadBotController_addOrder_error`, error);
      return responseHelper.serverError(res, error);
    }
  },

  runBot: async () => {
    try {
      if (!flags["run-SBC"]) {
        flags["run-SBC"] = true;

        const orders = await spreadBotDetails.find({
          status: "active",
          started: false,
        });
        let i,
          j,
          basePrice,
          order,
          exchange,
          pair,
          amount,
          type,
          price,
          usdtPrice,
          orderId,
          total,
          usdtTotal,
          placedAmountBuy,
          placedAmountSell,
          placedTotalBuy,
          placedTotalSell,
          mappingId,
          converter,
          maxTotal,
          minTotal,
          accountData,
          uniqueId,
          newOrder,
          mappedOrders = [];
        for (i = 0; i < orders.length; i++) {
          order = orders[i];
          basePrice = order.price;
          exchange = order.exchange;
          pair = order.pair;
          mappingId = order.uniqueId;
          placedAmountBuy = order.placedAmountBuy;
          placedAmountSell = order.placedAmountSell;
          placedTotalBuy = order.placedTotalBuy;
          placedTotalSell = order.placedTotalSell;
          accountData = await GetAccount(exchange);
          for (j = 1; j <= order.maxOrders; j++) {
            //sell order
            price = parseFloat(
              parseFloat(basePrice * (1 + order.percentGap * j)).toFixed(
                ExchangePairInfo[exchange][pair].decimalsPrice
              )
            );
            type = "sell";
            converter = JSON.parse(await RedisClient.get("converterPrice"));
            usdtPrice = parseFloat(
              parseFloat(
                price * converter[getSecondaryPair(pair)].bid[0]
              ).toFixed(6)
            );
            maxTotal = parseFloat(order.amountSell) * 1.05;
            minTotal = parseFloat(order.amountSell) * 0.95;
            usdtTotal = parseFloat(
              parseFloat(
                Math.random() * (maxTotal - minTotal) + minTotal
              ).toFixed(4)
            );
            amount = parseFloat(
              parseFloat(usdtTotal / usdtPrice).toFixed(
                ExchangePairInfo[exchange][pair].decimalsAmount
              )
            );
            total = parseFloat(parseFloat(amount * price).toFixed(4));
            orderData = {
              type,
              amount,
              price,
              usdtPrice,
              exchange,
              pair,
              total,
              usdtTotal,
              ...accountData,
            };
            orderId = await PlaceOrder(exchange, orderData);
            if (orderId != "error") {
              uniqueId = uuid();
              newOrder = new spreadBotOrders({
                uniqueId,
                originalQty: amount,
                type,
                price,
                usdtPrice,
                exchange,
                pair,
                total,
                usdtTotal,
                status: "active",
                mappingId,
                orderId,
              });
              await newOrder.save();
              placedAmountSell = placedAmountSell + amount;
              placedTotalSell = placedTotalSell + usdtTotal;
              mappedOrders.push(uniqueId);
            }

            //buy order
            price = parseFloat(
              parseFloat(basePrice * (1 - order.percentGap * j)).toFixed(
                ExchangePairInfo[exchange][pair].decimalsPrice
              )
            );
            type = "buy";
            converter = JSON.parse(await RedisClient.get("converterPrice"));
            usdtPrice = parseFloat(
              parseFloat(
                price * converter[getSecondaryPair(pair)].bid[0]
              ).toFixed(6)
            );
            maxTotal = parseFloat(order.amountBuy) * 1.05;
            minTotal = parseFloat(order.amountBuy) * 0.95;
            usdtTotal = parseFloat(
              parseFloat(
                Math.random() * (maxTotal - minTotal) + minTotal
              ).toFixed(4)
            );
            amount = parseFloat(
              parseFloat(usdtTotal / usdtPrice).toFixed(
                ExchangePairInfo[exchange][pair].decimalsAmount
              )
            );
            total = parseFloat(parseFloat(amount * price).toFixed(4));
            orderData = {
              type,
              amount,
              price,
              usdtPrice,
              exchange,
              pair,
              total,
              usdtTotal,
              ...accountData,
            };
            orderId = await PlaceOrder(exchange, orderData);
            if (orderId != "error") {
              uniqueId = uuid();
              newOrder = new spreadBotOrders({
                uniqueId,
                originalQty: amount,
                type,
                price,
                usdtPrice,
                exchange,
                pair,
                total,
                usdtTotal,
                status: "active",
                mappingId,
                orderId,
              });
              await newOrder.save();
              placedAmountBuy = placedAmountBuy + amount;
              placedTotalBuy = placedTotalBuy + usdtTotal;
              mappedOrders.push(uniqueId);
            }
          }
          await spreadBotDetails.findOneAndUpdate(
            { uniqueId: mappingId },
            {
              started: true,
              mappedOrders,
              placedAmountBuy,
              placedTotalBuy,
              placedAmountSell,
              placedTotalSell,
            }
          );
        }

        flags["run-SBC"] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_runBot_error`, error);
      flags["run-SBC"] = false;
    }
  },

  updateOrders: async (orders, min) => {
    try {
      if (!flags[`updateOrders-SBC-${min}`]) {
        flags[`updateOrders-SBC-${min}`] = true;
        let i,
          order,
          exchange,
          pair,
          type,
          accountData,
          price,
          usdtPrice,
          status,
          filledQty,
          orderId,
          orderData,
          statusData,
          prevFilledQty,
          fees,
          feeCurrency,
          feesUSDT,
          updatedTotal,
          updatedUsdtTotal,
          orderDetails,
          mappingId,
          updatedFilledQty,
          orderUniqueId;
        for (i = 0; i < orders.length; i++) {
          order = orders[i];
          exchange = order.exchange;
          pair = order.pair;
          orderId = order.orderId;
          type = order.type;
          price = order.price;
          usdtPrice = order.usdtPrice;
          prevFilledQty = order.filledQty;
          orderUniqueId = order.uniqueId;
          accountData = await GetAccount(exchange);
          orderData = {
            orderId,
            exchange,
            pair,
            botType: "spread",
            account: "AB",
            type: type,
            price: price,
            usdtPrice: usdtPrice,
            ...accountData,
          };
          statusData = await GetOrderStatus(exchange, orderData);
          status = statusData.status;
          filledQty = parseFloat(statusData.filledQty);
          fees = statusData.fees;
          feeCurrency = statusData.feeCurrency;
          feesUSDT = statusData.feesUSDT;
          updatedTotal = parseFloat(
            parseFloat(statusData.updatedTotal).toFixed(6)
          );
          updatedUsdtTotal = parseFloat(
            parseFloat(filledQty * usdtPrice).toFixed(6)
          );
          await spreadBotOrders.findOneAndUpdate(
            {
              uniqueId: order.uniqueId,
            },
            {
              status: status,
              filledQty: filledQty,
              fees: fees,
              feeCurrency: feeCurrency,
              feesUSDT: feesUSDT,
              updatedTotal: updatedTotal,
              updatedUsdtTotal: updatedUsdtTotal,
            }
          );
          if (filledQty > prevFilledQty) {
            updatedFilledQty = filledQty - prevFilledQty;
            mappingId = order.mappingId;
            if (type == "buy") {
              await spreadBotDetails.findOneAndUpdate(
                { uniqueId: mappingId },
                {
                  filledAmountBuy: updatedFilledQty,
                  updatedTotalBuy: usdtPrice * updatedFilledQty,
                }
              );
            } else {
              await spreadBotDetails.findOneAndUpdate(
                { uniqueId: mappingId },
                {
                  filledAmountSell: updatedFilledQty,
                  updatedTotalSell: usdtPrice * updatedFilledQty,
                }
              );
            }
            if (status == "completed") {
              await module.exports.placeRevOrder(orderUniqueId);

              await module.exports.placeOppOrder(orderUniqueId);
            }
          }
          //   order.save();
          if (exchange == "bitrue")
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        flags[`updateOrders-SBC-${min}`] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_updateOrders_error`, error);
      flags[`updateOrders-SBC-${min}`] = false;
    }
  },

  placeRevOrder: async (orderUniqueId) => {
    try {
      if (!flags[`placeRevOrder-SBC-${orderUniqueId}`]) {
        flags[`placeRevOrder-SBC-${orderUniqueId}`] = true;

        let i,
          order,
          price,
          type,
          exchange,
          pair,
          revPrice,
          revAmount,
          revTotal,
          revUsdtTotal,
          revUsdtPrice,
          minTotal,
          maxTotal,
          mappingId,
          orderDetails,
          mappedOrders,
          uniqueId,
          checkOrder,
          converter,
          orderData,
          orderId,
          accountData,
          cancelOrderData,
          placedAmount,
          totalAmount;
        order = await spreadBotOrders.findOne({ uniqueId: orderUniqueId });
        if (order) {
          mappingId = order.mappingId;
          orderDetails = await spreadBotDetails.findOne({
            uniqueId: mappingId,
            status: "active",
          });
          if (orderDetails) {
            exchange = order.exchange;
            pair = order.pair;
            mappedOrders = orderDetails.mappedOrders;
            price = order.price;
            type = order.type;
            if (type == "buy") {
              revPrice = parseFloat(
                parseFloat(price * 1.01).toFixed(
                  ExchangePairInfo[exchange][pair].decimalsPrice
                )
              );
              revType = "sell";
              i = 1;
              maxTotal = parseFloat(orderDetails.amountSell) * 1.05;
              minTotal = parseFloat(orderDetails.amountSell) * 0.95;
              checkOrder = await spreadBotOrders.findOne({
                mappingId,
                type: revType,
                price: revPrice,
                status: "active",
              });
              while (checkOrder != null) {
                revPrice = parseFloat(
                  parseFloat(price * (1.01 + i / 100)).toFixed(6)
                );
                checkOrder = await spreadBotOrders.findOne({
                  mappingId,
                  type: revType,
                  price: revPrice,
                  status: "active",
                });
                i++;
              }
            } else {
              revPrice = parseFloat(
                parseFloat(price * 0.99).toFixed(
                  ExchangePairInfo[exchange][pair].decimalsPrice
                )
              );
              revType = "buy";
              i = 1;
              maxTotal = parseFloat(orderDetails.amountBuy) * 1.05;
              minTotal = parseFloat(orderDetails.amountBuy) * 0.95;
              checkOrder = await spreadBotOrders.findOne({
                mappingId,
                type: revType,
                price: revPrice,
                status: "active",
              });
              while (checkOrder != null) {
                revPrice = parseFloat(
                  parseFloat(price * (0.99 - i / 100)).toFixed(6)
                );
                checkOrder = await spreadBotOrders.findOne({
                  mappingId,
                  type: revType,
                  price: revPrice,
                  status: "active",
                });
                i++;
              }
            }
            placedAmount =
              revType == "buy"
                ? orderDetails.placedAmountBuy
                : orderDetails.placedAmountSell;
            totalAmount =
              revType == "buy"
                ? orderDetails.placedTotalBuy
                : orderDetails.placedTotalSell;
            converter = JSON.parse(await RedisClient.get("converterPrice"));
            revUsdtPrice = parseFloat(
              parseFloat(
                revPrice * converter[getSecondaryPair(pair)].bid[0]
              ).toFixed(6)
            );
            revUsdtTotal = parseFloat(
              parseFloat(
                Math.random() * (maxTotal - minTotal) + minTotal
              ).toFixed(4)
            );
            revAmount = parseFloat(
              parseFloat(revUsdtTotal / revUsdtPrice).toFixed(
                ExchangePairInfo[exchange][pair].decimalsAmount
              )
            );
            revTotal = parseFloat(parseFloat(revAmount * revPrice).toFixed(4));
            accountData = await GetAccount(exchange);
            orderData = {
              exchange,
              pair,
              type: revType,
              amount: revAmount,
              price: revPrice,
              total: revTotal,
              ...accountData,
            };
            orderId = await PlaceOrder(exchange, orderData);
            if (orderId != "error" && orderId != "" && orderId != null) {
              uniqueId = uuid();

              const newOrder = new spreadBotOrders({
                uniqueId,
                originalQty: revAmount,
                type: revType,
                price: revPrice,
                usdtPrice: revUsdtPrice,
                exchange,
                pair,
                total: revTotal,
                usdtTotal: revUsdtTotal,
                status: "active",
                mappingId,
                orderId,
              });
              await newOrder.save();
              await spreadBotOrders.findOneAndUpdate(
                {
                  uniqueId: orderUniqueId,
                },
                {
                  revOrderId: uniqueId,
                }
              );
              mappedOrders.push(uniqueId);
              if (revType == "buy") {
                cancelOrderData = await spreadBotOrders
                  .find({ status: "active", mappingId, type: "buy" })
                  .sort({ price: 1 })
                  .limit(1);
              } else {
                cancelOrderData = await spreadBotOrders
                  .find({ status: "active", mappingId, type: "sell" })
                  .sort({ price: -1 })
                  .limit(1);
              }
              await spreadBotOrders.findOneAndUpdate(
                { uniqueId: cancelOrderData[0].uniqueId },
                { cancelling: true }
              );
              placedAmount = placedAmount + revAmount;
              totalAmount = totalAmount + revUsdtTotal;
              if (revType == "buy") {
                await spreadBotDetails.findOneAndUpdate(
                  { uniqueId: mappingId },
                  {
                    placedAmountBuy: placedAmount,
                    placedTotalBuy: totalAmount,
                    mappedOrders,
                  }
                );
              } else {
                await spreadBotDetails.findOneAndUpdate(
                  { uniqueId: mappingId },
                  {
                    placedAmountSell: placedAmount,
                    placedTotalSell: totalAmount,
                    mappedOrders,
                  }
                );
              }
            }
          }
        }

        flags[`placeRevOrder-SBC-${orderUniqueId}`] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_placeRevOrder_error`, error);
      flags[`placeRevOrder-SBC-${orderUniqueId}`] = false;
    }
  },

  placeOppOrder: async (orderUniqueId) => {
    try {
      if (!flags[`placeOppOrder-SBC-${orderUniqueId}`]) {
        flags[`placeOppOrder-SBC-${orderUniqueId}`] = true;

        let i,
          order,
          price,
          type,
          exchange,
          pair,
          oppPrice,
          oppAmount,
          oppTotal,
          oppUsdtTotal,
          oppUsdtPrice,
          minTotal,
          maxTotal,
          mappingId,
          orderDetails,
          mappedOrders,
          uniqueId,
          checkOrder,
          converter,
          orderData,
          orderId,
          accountData,
          placedAmount,
          totalAmount;
        order = await spreadBotOrders.findOne({ uniqueId: orderUniqueId });
        if (order) {
          mappingId = order.mappingId;
          orderDetails = await spreadBotDetails.findOne({
            uniqueId: mappingId,
            status: "active",
          });
          if (orderDetails) {
            exchange = order.exchange;
            pair = order.pair;
            mappedOrders = orderDetails.mappedOrders;
            price = order.price;
            type = order.type;
            if (type == "buy") {
              oppPrice = parseFloat(
                parseFloat(
                  price * (1 - orderDetails.maxOrders * orderDetails.percentGap)
                ).toFixed(ExchangePairInfo[exchange][pair].decimalsPrice)
              );
              oppType = "buy";
              i = 1;
              maxTotal = parseFloat(orderDetails.amountBuy) * 1.05;
              minTotal = parseFloat(orderDetails.amountBuy) * 0.95;
              checkOrder = await spreadBotOrders.findOne({
                mappingId,
                type: oppType,
                price: oppPrice,
                status: "active",
              });
              while (checkOrder != null) {
                oppPrice = parseFloat(
                  parseFloat(
                    price *
                      (1 -
                        (orderDetails.maxOrders + i) * orderDetails.percentGap)
                  ).toFixed(6)
                );
                checkOrder = await spreadBotOrders.findOne({
                  mappingId,
                  type: oppType,
                  price: oppPrice,
                  status: "active",
                });
                i++;
              }
            } else {
              oppPrice = parseFloat(
                parseFloat(
                  price * (1 + orderDetails.maxOrders * orderDetails.percentGap)
                ).toFixed(ExchangePairInfo[exchange][pair].decimalsPrice)
              );
              oppType = "sell";
              i = 1;
              maxTotal = parseFloat(orderDetails.amountSell) * 1.05;
              minTotal = parseFloat(orderDetails.amountSell) * 0.95;
              checkOrder = await spreadBotOrders.findOne({
                mappingId,
                type: oppType,
                price: oppPrice,
                status: "active",
              });
              while (checkOrder != null) {
                oppPrice = parseFloat(
                  parseFloat(
                    price *
                      (1 +
                        (orderDetails.maxOrders + i) * orderDetails.percentGap)
                  ).toFixed(6)
                );
                checkOrder = await spreadBotOrders.findOne({
                  mappingId,
                  type: oppType,
                  price: oppPrice,
                  status: "active",
                });
                i++;
              }
            }
            placedAmount =
              oppType == "buy"
                ? orderDetails.placedAmountBuy
                : orderDetails.placedAmountSell;
            totalAmount =
              oppType == "buy"
                ? orderDetails.placedTotalBuy
                : orderDetails.placedTotalSell;
            converter = JSON.parse(await RedisClient.get("converterPrice"));
            oppUsdtPrice = parseFloat(
              parseFloat(
                oppPrice * converter[getSecondaryPair(pair)].bid[0]
              ).toFixed(6)
            );
            oppUsdtTotal = parseFloat(
              parseFloat(
                Math.random() * (maxTotal - minTotal) + minTotal
              ).toFixed(4)
            );
            oppAmount = parseFloat(
              parseFloat(oppUsdtTotal / oppUsdtPrice).toFixed(
                ExchangePairInfo[exchange][pair].decimalsAmount
              )
            );
            oppTotal = parseFloat(parseFloat(oppAmount * oppPrice).toFixed(4));
            accountData = await GetAccount(exchange);
            orderData = {
              exchange,
              pair,
              type: oppType,
              amount: oppAmount,
              price: oppPrice,
              total: oppTotal,
              ...accountData,
            };
            orderId = await PlaceOrder(exchange, orderData);
            if (orderId != "error" && orderId != "" && orderId != null) {
              uniqueId = uuid();

              const newOrder = new spreadBotOrders({
                uniqueId,
                originalQty: oppAmount,
                type: oppType,
                price: oppPrice,
                usdtPrice: oppUsdtPrice,
                exchange,
                pair,
                total: oppTotal,
                usdtTotal: oppUsdtTotal,
                status: "active",
                mappingId,
                orderId,
              });
              await newOrder.save();
              await spreadBotOrders.findOneAndUpdate(
                {
                  uniqueId: orderUniqueId,
                },
                {
                  oppOrderId: uniqueId,
                }
              );
              mappedOrders.push(uniqueId);
              placedAmount = placedAmount + oppAmount;
              totalAmount = totalAmount + oppUsdtTotal;
              if (oppType == "buy") {
                await spreadBotDetails.findOneAndUpdate(
                  { uniqueId: mappingId },
                  {
                    placedAmountBuy: placedAmount,
                    placedTotalBuy: totalAmount,
                    mappedOrders,
                  }
                );
              } else {
                await spreadBotDetails.findOneAndUpdate(
                  { uniqueId: mappingId },
                  {
                    placedAmountSell: placedAmount,
                    placedTotalSell: totalAmount,
                    mappedOrders,
                  }
                );
              }
            }
          }
        }

        flags[`placeOppOrder-SBC-${orderUniqueId}`] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_placeOppOrder_error`, error);
      flags[`placeOppOrder-SBC-${orderUniqueId}`] = false;
    }
  },

  updateOrdersMin: async () => {
    try {
      if (!flags[`updateOrdersMin-SBC`]) {
        flags[`updateOrdersMin-SBC`] = true;
        const openOrders = await spreadBotDetails
          .find({ status: { $in: ["active", "stopped"] } })
          .sort({ createdAt: 1 });
        let i, orders, mappingId;
        for (i = 0; i < openOrders.length; i++) {
          mappingId = openOrders[i].uniqueId;
          orders = await spreadBotOrders
            .find({
              mappingId,
              type: "sell",
              status: "active",
              cancelling: false,
            })
            .sort({ usdtPrice: 1 })
            .limit(3);
          await module.exports.updateOrders(orders, 1);
          orders = await spreadBotOrders
            .find({
              mappingId,
              type: "buy",
              status: "active",
              cancelling: false,
            })
            .sort({ usdtPrice: -1 })
            .limit(3);
          await module.exports.updateOrders(orders, 1);
          orders = await spreadBotOrders.find({ mappingId, status: "active" });
          if (orders.length == 0 && openOrders[i].status == "stopped") {
            await spreadBotDetails.findOneAndUpdate(
              { uniqueId: mappingId },
              { status: "cancelled" }
            );
          }
        }
        flags[`updateOrdersMin-SBC`] = false;
      }
    } catch (error) {
      logger.error(`spreadController_updateOrdersMin_error`, error);
      flags[`updateOrdersMin-SBC`] = false;
    }
  },

  updateOrders10Min: async () => {
    try {
      if (!flags[`updateOrders10Min-SBC`]) {
        flags[`updateOrders10Min-SBC`] = true;
        const openOrders = await spreadBotDetails
          .find({ status: { $in: ["active", "stopped"] } })
          .sort({ createdAt: 1 });
        let i, orders, mappingId;
        for (i = 0; i < openOrders.length; i++) {
          mappingId = openOrders[i].uniqueId;
          orders = await spreadBotOrders
            .find({ mappingId, type: "sell", status: "active" })
            .sort({ usdtPrice: 1 })
            .skip(3);
          await module.exports.updateOrders(orders, 10);
          orders = await spreadBotOrders
            .find({ mappingId, type: "buy", status: "active" })
            .sort({ usdtPrice: -1 })
            .skip(3);
          await module.exports.updateOrders(orders, 10);
        }
        flags[`updateOrders10Min-SBC`] = false;
      }
    } catch (error) {
      logger.error(`spreadController_updateOrders10Min_error`, error);
      flags[`updateOrders10Min-SBC`] = false;
    }
  },

  updateOrders20Min: async () => {
    try {
      if (!flags[`updateOrders15Min-SBC`]) {
        flags[`updateOrders15Min-SBC`] = true;
        const openOrders = await spreadBotDetails
          .find({ status: { $in: ["active", "stopped"] } })
          .sort({ createdAt: 1 });
        let i, orders, mappingId;
        for (i = 0; i < openOrders.length; i++) {
          mappingId = openOrders[i].uniqueId;
          orders = await spreadBotOrders
            .find({ mappingId, status: "active" })
            .sort({ usdtPrice: -1 });
          await module.exports.updateOrders(orders, 20);
        }
        flags[`updateOrders15Min-SBC`] = false;
      }
    } catch (error) {
      logger.error(`spreadController_updateOrders15Min_error`, error);
      flags[`updateOrders15Min-SBC`] = false;
    }
  },

  updateCancellingOrders: async () => {
    try {
      if (!flags[`updateCancellingOrders-SBC`]) {
        const openOrders = await spreadBotDetails
          .find({ status: { $in: ["active", "stopped"] } })
          .sort({ createdAt: 1 });
        let i, orders, mappingId;
        for (i = 0; i < openOrders.length; i++) {
          mappingId = openOrders[i].uniqueId;
          orders = await spreadBotOrders
            .find({ mappingId, status: "active", cancelling: true })
            .sort({ createdAt: -1 });
          await module.exports.updateOrders(orders, 0);
        }
      }
    } catch (error) {
      logger.error(`spreadBotController_updateCancellingOrders_error`, error);
      flags[`updateCancellingOrders-SBC`] = false;
    }
  },

  autoCancelOrders: async () => {
    try {
      if (!flags["autoCancel-SBC"]) {
        flags["autoCancel-SBC"] = true;
        const orders = await spreadBotOrders
          .find({
            status: "active",
            cancelling: true,
          })
          .sort({ updatedAt: -1 });
        let i,
          order,
          type,
          orderId,
          price,
          usdtPrice,
          exchange,
          pair,
          cancelData,
          accountData;
        for (i = 0; i < orders.length; i++) {
          order = orders[i];
          exchange = order.exchange;
          pair = order.pair;
          orderId = order.orderId;
          price = order.price;
          usdtPrice = order.usdtPrice;
          type = order.type;
          accountData = await GetAccount(exchange);
          cancelData = {
            orderId,
            exchange,
            pair,
            type: type,
            price: price,
            usdtPrice: usdtPrice,
            ...accountData,
          };
          await CancelOrder(exchange, cancelData);
        }
        flags["autoCancel-SBC"] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_autoCancelOrders_error`, error);
      flags["autoCancel-SBC"] = false;
    }
  },

  checkOrderNumbers: async () => {
    try {
      if (!flags["checkOrderNumbers-SBC"]) {
        flags["checkOrderNumbers-SBC"] = true;
        const orders = await spreadBotDetails.find({ status: "active" });
        let i,
          j,
          order,
          maxOrders,
          currentOrders,
          difference,
          openOrders,
          mappingId,
          cancelOrdersData;
        for (i = 0; i < orders.length; i++) {
          order = orders[i];
          maxOrders = order.maxOrders;
          mappingId = order.uniqueId;
          openOrders = await spreadBotOrders.find({
            status: "active",
            cancelling: false,
            mappingId,
            type: "buy",
          });
          currentOrders = openOrders.length;
          if (maxOrders < currentOrders) {
            difference = currentOrders - maxOrders;
            cancelOrdersData = await spreadBotOrders
              .find({ status: "active", mappingId, type: "buy" })
              .sort({ price: 1 })
              .limit(difference);
            for (j = 0; j < cancelOrdersData.length; j++) {
              await spreadBotOrders.findOneAndUpdate(
                { uniqueId: cancelOrdersData[j].uniqueId },
                { cancelling: true }
              );
            }
          }

          openOrders = await spreadBotOrders.find({
            status: "active",
            cancelling: false,
            mappingId,
            type: "sell",
          });
          currentOrders = openOrders.length;
          if (maxOrders < currentOrders) {
            difference = currentOrders - maxOrders;
            cancelOrdersData = await spreadBotOrders
              .find({ status: "active", mappingId, type: "sell" })
              .sort({ price: -1 })
              .limit(difference);
            for (j = 0; j < cancelOrdersData.length; j++) {
              await spreadBotOrders.findOneAndUpdate(
                { uniqueId: cancelOrdersData[j].uniqueId },
                { cancelling: true }
              );
            }
          }
        }
        flags["checkOrderNumbers-SBC"] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_checkOrderNumbers_error`, error);
      flags["checkOrderNumbers-SBC"] = false;
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const order = await spreadBotDetails.findOne({ uniqueId: orderId });
      if (order) {
        if (order.status == "active") {
          await spreadBotOrders.updateMany(
            { mappingId: orderId },
            { cancelling: true },
            { multi: true }
          );
          order.status = "stopped";
          order.markModified("status");
          order.save();
          return responseHelper.successWithMessage(res, "Order Cancelled");
        } else {
          return responseHelper.errorWithMessage(res, "Order is't active");
        }
      } else {
        return responseHelper.errorWithMessage(res, "Invalid order id.");
      }
    } catch (error) {
      logger.error(`spreadBotController_cancelOrder_error`, error);
      return responseHelper.serverError(res, error);
    }
  },

  getOrders: async (req, res) => {
    try {
      const openOrders = await spreadBotDetails
        .find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      let orders = [],
        i,
        order,
        data;
      for (i = 0; i < openOrders.length; i++) {
        order = openOrders[i];
        data = await spreadBotOrders.aggregate([
          {
            $match: {
              status: "active",
              type: "buy",
              mappingId: order.uniqueId,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$originalQty" },
              USDT: { $sum: "$usdtTotal" },
            },
          },
        ]);
        order.currentBuyTotal = data[0] ? data[0].total : 0;
        order.currentBuyUSDT = data[0] ? data[0].USDT : 0;
        data = await spreadBotOrders.aggregate([
          {
            $match: {
              status: "active",
              type: "sell",
              mappingId: order.uniqueId,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$originalQty" },
              USDT: { $sum: "$usdtTotal" },
            },
          },
        ]);
        order.currentSellTotal = data[0] ? data[0].total : 0;
        order.currentSellUSDT = data[0] ? data[0].USDT : 0;
        orders.push(order);
      }
      if (orders.length < 50) {
        const remainingOrders = await spreadBotDetails
          .find({ status: { $ne: "active" } })
          .sort({ createdAt: -1 })
          .limit(50 - `${orders.length}`)
          .lean();
        for (i = 0; i < remainingOrders.length; i++) {
          order = remainingOrders[i];
          order.currentBuyTotal = 0;
          order.currentBuyUSDT = 0;
          order.currentSellTotal = 0;
          order.currentSellUSDT = 0;
          orders.push(order);
        }
      }
      return responseHelper.successWithData(
        res,
        "Got data successfully",
        orders
      );
    } catch (error) {
      logger.error(`spreadBotController_getOrders_error`, error);
      return responseHelper.serverError(res, error);
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const uniqueId = req.body.uniqueId;
      const order = await spreadBotDetails.findOne({ uniqueId }).lean();
      if (order) {
        let orders = [],
          i,
          tempOrder,
          orderDetails = order,
          data;
        const openOrders = await spreadBotOrders
          .find({ status: "active", mappingId: uniqueId })
          .sort({ usdtPrice: -1 });
        for (i = 0; i < openOrders.length; i++) {
          tempOrder = openOrders[i];
          orders.push(tempOrder);
        }
        const completedOrders = await spreadBotOrders
          .find({
            status: { $ne: "active" },
            filledQty: { $gt: 0 },
            mappingId: uniqueId,
          })
          .sort({ createdAt: -1 })
          .lean();
        for (i = 0; i < completedOrders.length; i++) {
          tempOrder = completedOrders[i];
          orders.push(tempOrder);
        }
        data = await spreadBotOrders.aggregate([
          {
            $match: {
              status: "active",
              type: "buy",
              mappingId: uniqueId,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$originalQty" },
              USDT: { $sum: "$usdtTotal" },
            },
          },
        ]);
        orderDetails.currentBuyTotal = data[0] ? data[0].total : 0;
        orderDetails.currentBuyUSDT = data[0] ? data[0].USDT : 0;
        data = await spreadBotOrders.aggregate([
          {
            $match: {
              status: "active",
              type: "sell",
              mappingId: uniqueId,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$originalQty" },
              USDT: { $sum: "$usdtTotal" },
            },
          },
        ]);
        orderDetails.currentSellTotal = data[0] ? data[0].total : 0;
        orderDetails.currentSellUSDT = data[0] ? data[0].USDT : 0;
        return responseHelper.successWithData(res, "Got data sucessfully", {
          orderDetails,
          orders,
        });
      } else {
        return responseHelper.error(res, "Invalid Order");
      }
    } catch (error) {
      logger.error(`spreadBotController_getOrderDetails_error`, error);
      return responseHelper.serverError(res, error);
    }
  },

  placeFailedOrders: async () => {
    try {
      if (!flags["placeFailed-SBC"]) {
        flags["placeFailed-SBC"] = true;
        const orders = await spreadBotOrders.find({
          status: "completed",
          $or: [{ revOrderId: "" }, { oppOrderId: "" }],
        });
        let i, order, revOrderId, oppOrderId, mappingId, orderDetails;
        for (i = 0; i < orders.length; i++) {
          order = orders[i];
          mappingId = order.mappingId;
          orderDetails = await spreadBotDetails.findOne({
            status: "active",
            uniqueId: mappingId,
          });
          if (orderDetails) {
            revOrderId = order.revOrderId;
            oppOrderId = order.oppOrderId;
            if (revOrderId == "") {
              await module.exports.placeRevOrder(order.uniqueId);
            }
            if (oppOrderId == "") {
              await module.exports.placeOppOrder(order.uniqueId);
            }
          }
        }
        flags["placeFailed-SBC"] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_placeFailedOrders_error`, error);
      flags["placeFailed-SBC"] = false;
    }
  },
};
