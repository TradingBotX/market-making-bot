const { ExchangePairInfo, UsdtPairs } = require("../helpers/constant");
const {
  RedisClient,
  getSecondaryPair,
  parseCompleteOrderBook,
} = require("../services/redis");
const uuid = require("uuid").v4;
const responseHelper = require("../helpers/RESPONSE");
const orderPlacement = require("../helpers/orderPlacement");
const spreadBotDetails = require("../models/spreadBotDetails");
const spreadBotOrders = require("../models/spreadBotOrders");
const spreadBotMaintainOrders = require("../models/spreadBotMaintainOrders");
// const commonHelper = require("../helpers/commonHelper");
// const excel = require("exceljs");
// const tempfile = require("tempfile");
const spreadBotGeneratedOrders = require("../models/spreadBotGeneratedOrders");
const currencies = ["XDC", "SRX", "PLI", "USPLUS", "FXD"];

module.exports = {
  addOrder: async (req, res) => {
    try {
      const { exchange, pair, maxOrders, amountBuy, amountSell, percentGap } =
        req.body;
      const price = await orderPlacement.LastTradedPrice(exchange, pair);
      const converter = JSON.parse(await RedisClient.get("converterPrice"));
      const usdtPrice = parseFloat(
        parseFloat(price * converter[getSecondaryPair(pair)].bid[0]).toFixed(6)
      );
      const orders = await spreadBotDetails.find({
        pair: { $regex: `${pair.split("-")[0]}` },
        status: "active",
        ordersGenerated: true,
      });
      const accountData = await orderPlacement.GetAccount(exchange);
      const walletBalance = await orderPlacement.WalletBalance(
        exchange,
        accountData
      );
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
        ordersGenerated: orders.length > 0 ? true : false,
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

  generateOrders: async () => {
    try {
      if (!flags["generateOrders-SBC"]) {
        flags["generateOrders-SBC"] = true;
        logger.debug("generating spread bot orders");
        let i,
          j,
          pair,
          converter,
          bidPrice,
          askPrice,
          baseUsdtPrice,
          order,
          usdtPrice,
          newOrder,
          uniqueId,
          checkOrder;
        for (i = 0; i < currencies.length; i++) {
          pair = `${currencies[i]}-USDT`;
          converter = JSON.parse(await RedisClient.get("converterPrice"));
          bidPrice = converter[pair].ask[0];
          askPrice = converter[pair].bid[0];
          baseUsdtPrice = parseFloat(
            parseFloat((bidPrice + askPrice) / 2).toFixed(6)
          );
          order = await spreadBotDetails.findOne({
            pair: { $regex: `${currencies[i]}` },
            status: "active",
            ordersGenerated: false,
          });
          if (order) {
            for (j = 1; j <= 10; j++) {
              usdtPrice = parseFloat(
                parseFloat(baseUsdtPrice * (1 + order.percentGap * j)).toFixed(
                  6
                )
              );
              uniqueId = uuid();
              newOrder = new spreadBotGeneratedOrders({
                uniqueId,
                usdtPrice,
                currency: currencies[i],
                type: "sell",
                status: "active",
                revOrderId: "",
                oppOrderId: "",
                cancelling: false,
                mappedOrders: [],
              });
              newOrder.save();
              usdtPrice = parseFloat(
                parseFloat(baseUsdtPrice * (1 - order.percentGap * j)).toFixed(
                  6
                )
              );
              uniqueId = uuid();
              newOrder = new spreadBotGeneratedOrders({
                uniqueId,
                usdtPrice,
                currency: currencies[i],
                type: "buy",
                status: "active",
                revOrderId: "",
                oppOrderId: "",
                cancelling: false,
                mappedOrders: [],
              });
              newOrder.save();
            }
            await spreadBotDetails.updateMany(
              {
                pair: { $regex: `${pair.split("-")[0]}` },
                status: "active",
                ordersGenerated: false,
              },
              { ordersGenerated: true }
            );
          }
          checkOrder = await spreadBotDetails.findOne({
            pair: { $regex: `${currencies[i]}` },
            status: "active",
          });
          if (!checkOrder) {
            await spreadBotGeneratedOrders.updateMany(
              { currency: currencies[i], status: "active" },
              { status: "cancelled" },
              { multi: true }
            );
          }
        }
        flags["generateOrders-SBC"] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_generateOrders_error`, error);
      flags["generateOrders-SBC"] = false;
    }
  },

  placeOrders: async () => {
    try {
      if (!flags["placeOrders-SBC"]) {
        flags["placeOrders-SBC"] = true;
        const orders = await spreadBotDetails.find({ status: "active" });
        let i,
          j,
          exchange,
          pair,
          generatedOrders,
          order,
          currency,
          converter,
          price,
          usdtPrice,
          amount,
          generatedOrder,
          type,
          total,
          usdtTotal,
          orderData,
          orderId,
          mappingId,
          refId,
          mappedOrders,
          accountData,
          refOrders,
          uniqueId,
          newOrder,
          placedAmountBuy,
          placedAmountSell,
          totalAmountBuy,
          totalAmountSell,
          checkOrder,
          maxAmount,
          minAmount;
        for (i = 0; i < orders.length; i++) {
          order = orders[i];
          mappingId = order.uniqueId;
          mappedOrders = order.mappedOrders;
          exchange = order.exchange;
          pair = order.pair;
          currency = pair.split("-")[0];
          generatedOrders = await spreadBotGeneratedOrders
            .find({ currency, status: "active" })
            .sort({ createdAt: -1 });
          accountData = await orderPlacement.GetAccount(exchange);
          placedAmountBuy = order.placedAmountBuy;
          placedAmountSell = order.placedAmountSell;
          totalAmountBuy = order.placedTotalBuy;
          totalAmountSell = order.placedTotalSell;
          for (j = 0; j < generatedOrders.length; j++) {
            generatedOrder = generatedOrders[j];
            refOrders = generatedOrder.mappedOrders;
            refId = generatedOrder.uniqueId;
            checkOrder = await spreadBotOrders.findOne({
              exchange,
              pair,
              refId,
            });
            if (!checkOrder) {
              usdtPrice = generatedOrder.usdtPrice;
              converter = JSON.parse(await RedisClient.get("converterPrice"));
              usdtPrice = parseFloat(
                parseFloat(
                  usdtPrice * (1 - (Math.random() * (1 - 0) + 0) / 1000)
                ).toFixed(6)
              );
              price = parseFloat(
                parseFloat(
                  usdtPrice / converter[getSecondaryPair(pair)].bid[0]
                ).toFixed(ExchangePairInfo[exchange][pair].decimalsPrice)
              );
              type = generatedOrder.type;
              if (order.type == "buy") {
                maxAmount = parseFloat(order.amountBuy) * 1.05;
                minAmount = parseFloat(order.amountBuy) * 0.95;
                // amount = parseFloat(
                //   parseFloat(
                //     Math.random() * (maxAmount - minAmount) + minAmount
                //   ).toFixed(ExchangePairInfo[exchange][pair].decimalsAmount)
                // );
              } else {
                maxAmount = parseFloat(order.amountSell) * 1.05;
                minAmount = parseFloat(order.amountSell) * 0.95;
                // amount = parseFloat(
                //   parseFloat(
                //     Math.random() * (maxAmount - minAmount) + minAmount
                //   ).toFixed(ExchangePairInfo[exchange][pair].decimalsAmount)
                // );
              }
              usdtTotal = parseFloat(
                parseFloat(
                  Math.random() * (maxAmount - minAmount) + minAmount
                ).toFixed(4)
              );
              amount = parseFloat(
                parseFloat(usdtTotal / usdtPrice).toFixed(
                  ExchangePairInfo[exchange][pair].decimalsAmount
                )
              );
              total = parseFloat(parseFloat(amount * price).toFixed(4));
              // usdtTotal = parseFloat(parseFloat(amount * usdtPrice).toFixed(4));
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
              orderId = await orderPlacement.PlaceOrder(exchange, orderData);
              if (orderId != "error" && orderId != "" && orderId != null) {
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
                  refId,
                });
                await newOrder.save();
                if (type == "buy") {
                  placedAmountBuy = placedAmountBuy + amount;
                  totalAmountBuy = totalAmountBuy + usdtTotal;
                } else {
                  placedAmountSell = placedAmountSell + amount;
                  totalAmountSell = totalAmountSell + usdtTotal;
                }
                mappedOrders.push(uniqueId);
                refOrders.push(uniqueId);
                generatedOrder.mappedOrders = refOrders;
                generatedOrder.markModified("mappedOrders");
                generatedOrder.save();
              }
            }
          }
          order.mappedOrders = mappedOrders;
          order.placedAmountBuy = placedAmountBuy;
          order.placedTotalBuy = totalAmountBuy;
          order.placedAmountSell = placedAmountSell;
          order.placedTotalSell = totalAmountSell;
          order.markModified("placedAmountBuy");
          order.markModified("placedTotalBuy");
          order.markModified("placedAmountSell");
          order.markModified("placedTotalSell");
          order.markModified("mappedOrders");
          order.save();
        }
        flags["placeOrders-SBC"] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_placeOrders_error`, error);
      flags["placeOrders-SBC"] = false;
    }
  },

  generateOppOrder: async (refId) => {
    try {
      if (!flags[`generateOppOrder-SBC`]) {
        flags[`generateOppOrder-SBC`] = true;

        const order = await spreadBotGeneratedOrders.findOne({
          uniqueId: refId,
        });
        let type,
          usdtPrice,
          oppType,
          oppUsdtPrice,
          uniqueId,
          currency,
          checkOrder,
          i,
          activeOrder;
        type = order.type;
        usdtPrice = order.usdtPrice;
        currency = order.currency;
        activeOrder = await spreadBotDetails.findOne({
          pair: { $regex: `${currency}` },
          status: "active",
        });
        if (activeOrder) {
          if (type == "buy") {
            oppUsdtPrice = parseFloat(
              parseFloat(usdtPrice * (1 - 10 * activeOrder.percentGap)).toFixed(
                6
              )
            );
            oppType = "buy";
            i = 1;
            checkOrder = await spreadBotGeneratedOrders.findOne({
              type: oppType,
              usdtPrice: oppUsdtPrice,
              status: "active",
            });
            while (checkOrder != null) {
              oppUsdtPrice = parseFloat(
                parseFloat(
                  usdtPrice * (1 - (10 + i) * activeOrder.percentGap)
                ).toFixed(6)
              );
              checkOrder = await spreadBotGeneratedOrders.findOne({
                type: oppType,
                usdtPrice: oppUsdtPrice,
                status: "active",
              });
              i++;
            }
          } else {
            oppUsdtPrice = parseFloat(
              parseFloat(usdtPrice * (1 + 10 * activeOrder.percentGap)).toFixed(
                6
              )
            );
            oppType = "sell";
            i = 1;
            checkOrder = await spreadBotGeneratedOrders.findOne({
              type: oppType,
              usdtPrice: oppUsdtPrice,
              status: "active",
            });
            while (checkOrder != null) {
              oppUsdtPrice = parseFloat(
                parseFloat(
                  usdtPrice * (1 + (10 + i) * activeOrder.percentGap)
                ).toFixed(6)
              );
              checkOrder = await spreadBotGeneratedOrders.findOne({
                type: oppType,
                usdtPrice: oppUsdtPrice,
                status: "active",
              });
              i++;
            }
          }
          uniqueId = uuid();
          const newOrder = new spreadBotGeneratedOrders({
            uniqueId,
            usdtPrice: oppUsdtPrice,
            currency,
            type: oppType,
            status: "active",
            revOrderId: "",
            oppOrderId: "",
            cancelling: false,
            mappedOrders: [],
          });
          await newOrder.save();
          await spreadBotGeneratedOrders.findOneAndUpdate(
            {
              uniqueId: refId,
            },
            {
              oppOrderId: uniqueId,
            }
          );
        }
        flags[`generateOppOrder-SBC`] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_generateOppOrder_error`, error);
      flags[`generateOppOrder-SBC`] = false;
    }
  },

  generateRevOrder: async (refId) => {
    try {
      if (!flags[`generateRevOrder-SBC`]) {
        flags[`generateRevOrder-SBC`] = true;

        const order = await spreadBotGeneratedOrders.findOne({
          uniqueId: refId,
        });
        let type,
          usdtPrice,
          revType,
          revUsdtPrice,
          uniqueId,
          currency,
          checkOrder,
          i;
        type = order.type;
        usdtPrice = order.usdtPrice;
        currency = order.currency;
        if (type == "buy") {
          revUsdtPrice = parseFloat(parseFloat(usdtPrice * 1.01).toFixed(6));
          revType = "sell";
          i = 1;
          checkOrder = await spreadBotGeneratedOrders.findOne({
            type: revType,
            usdtPrice: revUsdtPrice,
            status: "active",
          });
          while (checkOrder != null) {
            revUsdtPrice = parseFloat(
              parseFloat(usdtPrice * (1.01 + i / 100)).toFixed(6)
            );
            checkOrder = await spreadBotGeneratedOrders.findOne({
              type: revType,
              usdtPrice: revUsdtPrice,
              status: "active",
            });
            i++;
          }
        } else {
          revUsdtPrice = parseFloat(parseFloat(usdtPrice * 0.99).toFixed(6));
          revType = "buy";
          i = 1;
          checkOrder = await spreadBotGeneratedOrders.findOne({
            type: revType,
            usdtPrice: revUsdtPrice,
            status: "active",
          });
          while (checkOrder != null) {
            revUsdtPrice = parseFloat(
              parseFloat(usdtPrice * (0.99 - i / 100)).toFixed(6)
            );
            checkOrder = await spreadBotGeneratedOrders.findOne({
              type: revType,
              usdtPrice: revUsdtPrice,
              status: "active",
            });
            i++;
          }
        }
        uniqueId = uuid();
        const newOrder = new spreadBotGeneratedOrders({
          uniqueId,
          usdtPrice: revUsdtPrice,
          currency,
          type: revType,
          status: "active",
          revOrderId: "",
          oppOrderId: "",
          cancelling: false,
          mappedOrders: [],
        });
        await newOrder.save();
        await spreadBotGeneratedOrders.findOneAndUpdate(
          {
            uniqueId: refId,
          },
          {
            revOrderId: uniqueId,
          }
        );

        flags[`generateRevOrder-SBC`] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_generateOppOrder_error`, error);
      flags[`generateRevOrder-SBC`] = false;
    }
  },

  updateOrders: async (orders, min) => {
    try {
      if (!flags[`updateOrders-SBC-${min}`]) {
        flags[`updateOrders-SBC-${min}`] = true;
        // const orders = await spreadBotOrders
        //   .find({ status: "active" })
        //   .sort({ usdtPrice: -1 });
        let i,
          order,
          exchange,
          pair,
          type,
          accountData,
          price,
          usdtPrice,
          status,
          originalQty,
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
          refId;
        for (i = 0; i < orders.length; i++) {
          order = orders[i];
          exchange = order.exchange;
          pair = order.pair;
          orderId = order.orderId;
          type = order.type;
          price = order.price;
          usdtPrice = order.usdtPrice;
          prevFilledQty = order.filledQty;
          originalQty = order.originalQty;
          refId = order.refId;
          accountData = await orderPlacement.GetAccount(exchange);
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
          statusData = await orderPlacement.GetOrderStatus(exchange, orderData);
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
          //   order.status = status;
          //   order.filledQty = filledQty;
          //   order.fees = fees;
          //   order.feeCurrency = feeCurrency;
          //   order.feesUSDT = feesUSDT;
          //   order.updatedTotal = updatedTotal;
          //   order.updatedUsdtTotal = updatedUsdtTotal;
          //   order.markModified("status");
          //   order.markModified("filledQty");
          //   order.markModified("fees");
          //   order.markModified("feesUSDT");
          //   order.markModified("feeCurrency");
          //   order.markModified("updatedTotal");
          //   order.markModified("updatedUsdtTotal");
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
            orderDetails = await spreadBotDetails.findOne({
              uniqueId: mappingId,
            });
            if (type == "buy") {
              orderDetails.filledAmountBuy =
                orderDetails.filledAmountBuy + updatedFilledQty;
              orderDetails.updatedTotalBuy =
                orderDetails.updatedTotalBuy + usdtPrice * updatedFilledQty;
              orderDetails.markModified("filledAmountBuy");
              orderDetails.markModified("updatedTotalBuy");
            } else {
              orderDetails.filledAmountSell =
                orderDetails.filledAmountSell + updatedFilledQty;
              orderDetails.updatedTotalSell =
                orderDetails.updatedTotalSell + usdtPrice * updatedFilledQty;
              orderDetails.markModified("filledAmountSell");
              orderDetails.markModified("updatedTotalSell");
            }
            orderDetails.save();
            if (status == "completed") {
              await module.exports.generateRevOrder(refId);

              await module.exports.generateOppOrder(refId);

              await spreadBotOrders.updateMany(
                { refId },
                { cancelling: true },
                { multi: true }
              );

              await spreadBotGeneratedOrders.findOneAndUpdate(
                { uniqueId: refId },
                { status: "cancelled" }
              );
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
            .find({ mappingId, type: "sell", status: "active" })
            .sort({ usdtPrice: 1 })
            .limit(3);
          await module.exports.updateOrders(orders, 1);
          orders = await spreadBotOrders
            .find({ mappingId, type: "buy", status: "active" })
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
          accountData = await orderPlacement.GetAccount(exchange);
          cancelData = {
            orderId,
            exchange,
            pair,
            type: type,
            price: price,
            usdtPrice: usdtPrice,
            ...accountData,
          };
          await orderPlacement.CancelOrder(exchange, cancelData);
        }
        flags["autoCancel-SBC"] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_autoCancelOrders_error`, error);
      flags["autoCancel-SBC"] = false;
    }
  },

  differenceMail: async () => {
    try {
      if (!flags["differenceMail-SBC"]) {
        flags["differenceMail-SBC"] = true;
        const orders = await spreadBotDetails.find({
          status: "active",
          pair: { $ne: "XDC-USDC" },
        });
        let i,
          order,
          exchange,
          pair,
          currency1,
          currency2,
          walletBalance,
          accountData,
          curr1Maintain,
          curr2Maintain,
          curr1Bal,
          curr2Bal,
          curr1BalData,
          curr2BalData,
          curr1Diff,
          curr2Diff,
          type,
          price,
          usdtPrice,
          amount,
          book,
          orderBook,
          converter,
          mailMessage = "";
        for (i = 0; i < orders.length; i++) {
          order = orders[i];
          exchange = order.exchange;
          pair = order.pair;
          curr1Maintain = order.balanceToBeMaintanedC1;
          curr2Maintain = order.balanceToBeMaintanedC2;
          currency1 = pair.split("-")[0];
          currency2 = pair.split("-")[1];
          accountData = await orderPlacement.GetAccount(exchange);
          walletBalance = await orderPlacement.WalletBalance(
            exchange,
            accountData
          );
          curr1BalData = walletBalance.filter(
            (e) => e.currency == currency1
          )[0];
          curr2BalData = walletBalance.filter(
            (e) => e.currency == currency2
          )[0];
          curr1Bal = parseFloat(curr1BalData.total);
          curr2Bal = parseFloat(curr2BalData.total);
          curr1Diff = parseFloat(curr1Bal - curr1Maintain);
          curr2Diff = parseFloat(curr2Bal - curr2Maintain);
          if (curr1Diff > 0) {
            type = "sell";
          } else if (curr1Diff < 0) {
            type = "buy";
          } else {
            type = "N.A.";
          }
          if (type != "N.A.") {
            amount = parseFloat(
              parseFloat(Math.abs(curr1Diff)).toFixed(
                ExchangePairInfo[exchange][pair].decimalsAmount
              )
            );
            book = JSON.parse(await RedisClient.get(`${exchange}__${pair}`));
            orderBook = parseCompleteOrderBook(exchange, {
              bid: book.bids,
              ask: book.asks,
            });
            if (type == "buy") {
              price = parseFloat(
                parseFloat(orderBook.ask[4][0]).toFixed(
                  ExchangePairInfo[exchange][pair].decimalsPrice
                )
              );
            } else {
              price = parseFloat(
                parseFloat(orderBook.bid[4][0]).toFixed(
                  ExchangePairInfo[exchange][pair].decimalsPrice
                )
              );
            }
            converter = JSON.parse(await RedisClient.get("converterPrice"));
            usdtPrice = parseFloat(
              parseFloat(
                price * converter[getSecondaryPair(pair)].bid[0]
              ).toFixed(6)
            );
            mailMessage = `${mailMessage} Action : ${type}<br> Exchange : ${exchange}<br> 
            Pair : ${pair}<br> Currency : ${currency1}<br> Balance to be Maintained : ${curr1Maintain}<br>
             Current Balance : ${curr1Bal}<br> Difference Amount : ${amount}<br> Price : ${price}<br>
             USDT Price : ${usdtPrice}<br><br><br>`;
          }

          if (!UsdtPairs.includes(pair)) {
            if (curr2Diff > 0) {
              type = "sell";
            } else if (curr2Diff < 0) {
              type = "buy";
            } else {
              type = "N.A.";
            }
            if (type != "N.A.") {
              amount = parseFloat(
                parseFloat(Math.abs(curr2Diff)).toFixed(
                  ExchangePairInfo[exchange][pair].decimalsAmount
                )
              );
              book = JSON.parse(await RedisClient.get(`${exchange}__${pair}`));
              orderBook = parseCompleteOrderBook(exchange, {
                bid: book.bids,
                ask: book.asks,
              });
              if (type == "buy") {
                price = parseFloat(
                  parseFloat(orderBook.ask[4][0]).toFixed(
                    ExchangePairInfo[exchange][pair].decimalsPrice
                  )
                );
              } else {
                price = parseFloat(
                  parseFloat(orderBook.bid[4][0]).toFixed(
                    ExchangePairInfo[exchange][pair].decimalsPrice
                  )
                );
              }
              converter = JSON.parse(await RedisClient.get("converterPrice"));
              usdtPrice = parseFloat(
                parseFloat(
                  price * converter[getSecondaryPair(pair)].bid[0]
                ).toFixed(6)
              );
              pair = `${currency2}-USDT`;
              mailMessage = `${mailMessage} Action : ${type}<br> Exchange : ${exchange}<br> 
            Pair : ${pair}<br> Currency : ${currency2}<br> Balance to be Maintained : ${curr2Maintain}<br>
             Current Balance : ${curr2Bal}<br> Difference Amount : ${amount}<br> Price : ${price}<br>
             USDT Price : ${usdtPrice}<br><br><br>`;
            }
          }
        }
        // if (mailMessage != "") {
        //   const emails = await commonHelper.getEmailsForMail(1);
        //   await mail.send(emails, "1 Hr Difference", mailMessage);
        // }
        flags["differenceMail-SBC"] = false;
      }
    } catch (error) {
      logger.error(`spreadBotController_differenceMail_error`, error);
      flags["differenceMail-SBC"] = false;
    }
  },

  checkOrderNumbers: async () => {
    try {
      if (!flags["checkOrderNumbers-SBC"]) {
        flags["checkOrderNumbers-SBC"] = true;

        let i, j, orders, cancelOrders, currency, difference, refId;
        for (i = 0; i < currencies.length; i++) {
          currency = currencies[i];
          orders = await spreadBotGeneratedOrders.find({
            currency,
            status: "active",
            type: "sell",
          });
          if (orders.length > 10) {
            difference = orders.length - 10;
            cancelOrders = await spreadBotGeneratedOrders
              .find({
                currency,
                status: "active",
                type: "sell",
              })
              .sort({ usdtPrice: -1 })
              .limit(difference);
            for (j = 0; j < cancelOrders.length; j++) {
              refId = cancelOrders[j].uniqueId;
              await spreadBotOrders.updateMany(
                { refId },
                { cancelling: true },
                { multi: true }
              );

              await spreadBotGeneratedOrders.findOneAndUpdate(
                { uniqueId: refId },
                { status: "cancelled" }
              );
            }
          }

          orders = await spreadBotGeneratedOrders.find({
            currency,
            status: "active",
            type: "buy",
          });
          if (orders.length > 10) {
            difference = orders.length - 10;
            cancelOrders = await spreadBotGeneratedOrders
              .find({
                currency,
                status: "active",
                type: "buy",
              })
              .sort({ usdtPrice: 1 })
              .limit(difference);
            for (j = 0; j < cancelOrders.length; j++) {
              refId = cancelOrders[j].uniqueId;
              await spreadBotOrders.updateMany(
                { refId },
                { cancelling: true },
                { multi: true }
              );

              await spreadBotGeneratedOrders.findOneAndUpdate(
                { uniqueId: refId },
                { status: "cancelled" }
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
};
