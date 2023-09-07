const axios = require("axios");
// const commonHelper = require("../helpers/commonHelper");
const ExchangeCurrencies = require("../models/exchangeCurrencies");
const orderPlacement = require("../helpers/orderPlacement");
const dailyWalletBalances = require("../models/dailyWalletBalances");
const dailyStats = require("../models/dailyStats");
const excel = require("exceljs");
const tempfile = require("tempfile");
const RedisClient = require("../services/redis").RedisClient;
const arbitrageOperations = require("../models/arbitrageOperations");
const uuid = require("uuid").v4;
const completedOrders = require("../models/completedOrders");
const { ExchangePairInfo } = require("../helpers/constant");
const {
  getSecondaryPair,
  parseCompleteOrderBook,
} = require("../services/redis");
// const { getTotalFees } = require("../helpers/commonHelper");
let startDate = new Date(Date.UTC(2021, 7, 2, 2, 30, 0, 0));

module.exports = {
  checkBalances: async () => {
    try {
      let mailMsg = "",
        i,
        k,
        walletData,
        exchange,
        account;
      const exchangesData = await ExchangeCurrencies.find({});
      for (i = 0; i < exchangesData.length; i++) {
        exchange = exchangesData[i].exchange;
        walletData = [];
        account = await orderPlacement.GetAccount(exchange);
        walletData = await orderPlacement.WalletBalance(exchange, account);
        for (k = 0; k < walletData.length; k++) {
          if (
            parseFloat(walletData[k].balance) <
            parseFloat(walletData[k].minBalance)
          ) {
            mailMsg =
              mailMsg +
              `Available balance low for ${walletData[k].currency} in ${exchange}, 
              minimum balance : ${walletData[k].minBalance} 
              current balance : ${walletData[k].balance}<br>`;
          }
        }
      }
      // if (mailMsg != "") {
      //   const emails = await commonHelper.getEmailsForMail(1);
      //   await mail.send(emails, `Balance low in following exchanges`, mailMsg);
      // }
    } catch (error) {
      logger.error(`cronController_checkBalances_error : `, error);
      return "error";
    }
  },

  updateBalance: async (frequency) => {
    try {
      let i,
        j,
        k,
        l,
        walletData,
        exchange,
        account,
        oldData,
        yesterdayData,
        stats = {},
        totalBalances = [],
        statsArray = [],
        total = 0,
        inTrade = 0,
        balance = 0,
        statsData,
        time,
        yesterday;
      if (frequency == "daily") {
        time = new Date();
        time.setUTCHours(2, 30, 0, 0);
        yesterday = new Date(time);
        yesterday.setDate(yesterday.getDate() - 1);
      } else if (frequency == "hourly") {
        time = new Date();
        time.setUTCHours(time.getUTCHours(), 35, 0, 0);
        yesterday = new Date(time);
        yesterday.setHours(yesterday.getHours() - 1);
      }

      const converter = JSON.parse(await RedisClient.get("converterPrice"));

      const exchangesData = await ExchangeCurrencies.find({});
      for (i = 0; i < exchangesData.length; i++) {
        exchange = exchangesData[i].exchange;
        (walletData = []), (oldData = ""), (statsArray = []);
        account = await orderPlacement.GetAccount(exchange);
        if (account) {
          walletData = await orderPlacement.WalletBalance(exchange, account);
          oldData = await dailyWalletBalances.findOne({
            exchange: exchange,
            account: "",
            time: time,
          });

          yesterdayData = await dailyWalletBalances.findOne({
            exchange: exchange,
            account: "",
            time: yesterday,
          });

          if (oldData == "" || oldData == null) {
            (
              await new dailyWalletBalances({
                account: "",
                exchange,
                currency: walletData,
                time,
              })
            ).save();
          } else {
            await dailyWalletBalances.updateOne(
              {
                exchange: exchange,
                account: "",
                time: time,
              },
              {
                $set: {
                  currency: walletData,
                },
              }
            );
          }

          for (k = 0; k < walletData.length; k++) {
            if (
              totalBalances[walletData[k].currency] &&
              "balance" in totalBalances[walletData[k].currency] &&
              totalBalances[walletData[k].currency]["balance"] != null
            ) {
              balance = totalBalances[walletData[k].currency]["balance"];
            } else {
              balance = 0;
            }
            if (
              totalBalances[walletData[k].currency] &&
              "inTrade" in totalBalances[walletData[k].currency] &&
              totalBalances[walletData[k].currency]["inTrade"] != null
            ) {
              inTrade = totalBalances[walletData[k].currency]["inTrade"];
            } else {
              inTrade = 0;
            }
            if (
              totalBalances[walletData[k].currency] &&
              "total" in totalBalances[walletData[k].currency] &&
              totalBalances[walletData[k].currency]["total"] != null
            ) {
              total = totalBalances[walletData[k].currency]["total"];
            } else {
              total = 0;
            }

            if (!totalBalances[walletData[k].currency]) {
              totalBalances[walletData[k].currency] = {};
            }

            totalBalances[walletData[k].currency].currency =
              walletData[k].currency;
            totalBalances[walletData[k].currency].balance =
              walletData[k].balance + balance;
            totalBalances[walletData[k].currency].inTrade =
              walletData[k].inTrade + inTrade;
            totalBalances[walletData[k].currency].total =
              walletData[k].total + total;

            if (yesterdayData && yesterdayData != "") {
              for (l = 0; l < yesterdayData.currency.length; l++) {
                stats = {};
                if (
                  yesterdayData.currency[l].currency == walletData[k].currency
                ) {
                  stats.currency = walletData[k].currency;
                  stats.yesterdayBalance = yesterdayData.currency[l].total;
                  stats.todayBalance = walletData[k].total;
                  stats.balanceChange = parseFloat(
                    parseFloat(
                      stats.todayBalance - stats.yesterdayBalance
                    ).toFixed(4)
                  );
                  if (`${stats.currency}-USDT` in converter)
                    stats.diffUSDT =
                      stats.balanceChange *
                      converter[`${stats.currency}-USDT`].bid[0];
                  else {
                    stats.diffUSDT = stats.balanceChange * 0;
                    logger.error(`bid not found`, stats.currency);
                  }
                  if (stats.balanceChange >= 0) {
                    stats.type = "profit";
                  } else {
                    stats.type = "loss";
                  }
                }
                if (Object.keys(stats).length > 0) {
                  statsArray.push(stats);
                }
              }
            }
          }

          statsData = await dailyStats.findOne({
            exchange,
            account: "",
            time,
          });

          if (statsData == "" || statsData == null) {
            (
              await new dailyStats({
                exchange,
                account: "",
                stats: statsArray,
                time,
              })
            ).save();
          } else {
            await dailyStats.updateOne(
              {
                exchange,
                account: "",
                time,
              },
              {
                $set: {
                  stats: statsArray,
                },
              }
            );
          }
        }
      }

      const totalBalancesArray = Object.values(totalBalances);
      oldData = await dailyWalletBalances.findOne({
        exchange: "total",
        account: "total",
        time: time,
      });
      if (oldData == "" || oldData == null) {
        (
          await new dailyWalletBalances({
            exchange: "total",
            account: "total",
            currency: totalBalancesArray,
            time,
          })
        ).save();
      } else {
        await dailyWalletBalances.updateOne(
          {
            exchange: "total",
            account: "total",
            time: time,
          },
          {
            $set: {
              currency: totalBalancesArray,
            },
          }
        );
      }

      yesterdayData = await dailyWalletBalances.findOne({
        exchange: "total",
        account: "total",
        time: yesterday,
      });

      statsArray = [];
      for (j = 0; j < totalBalancesArray.length; j++) {
        if (yesterdayData && yesterdayData != "")
          for (i = 0; i < yesterdayData.currency.length; i++) {
            stats = {};
            if (
              yesterdayData.currency[i].currency ==
              totalBalancesArray[j].currency
            ) {
              stats.currency = totalBalancesArray[j].currency;
              stats.yesterdayBalance = yesterdayData.currency[i].total;
              stats.todayBalance = totalBalancesArray[j].total;
              stats.balanceChange = parseFloat(
                parseFloat(stats.todayBalance - stats.yesterdayBalance).toFixed(
                  4
                )
              );
              if (`${stats.currency}-USDT` in converter)
                stats.diffUSDT =
                  stats.balanceChange *
                  converter[`${stats.currency}-USDT`].bid[0];
              else {
                stats.diffUSDT = stats.balanceChange * 0;
                logger.error(`bid not found`, stats.currency);
              }
              if (stats.balanceChange >= 0) {
                stats.type = "profit";
              } else {
                stats.type = "loss";
              }
            }
            if (Object.keys(stats).length > 0) {
              statsArray.push(stats);
            }
          }
      }

      statsData = await dailyStats.findOne({
        exchange: "total",
        account: "total",
        time,
      });

      if (statsData == "" || statsData == null) {
        (
          await new dailyStats({
            exchange: "total",
            account: "total",
            stats: statsArray,
            time,
          })
        ).save();
      } else {
        await dailyStats.updateOne(
          {
            exchange: "total",
            account: "total",
            time,
          },
          {
            $set: {
              stats: statsArray,
            },
          }
        );
      }
    } catch (error) {
      logger.error(`cronController_updateBalance_error : `, error);
      return "error";
    }
  },

  // sendStatsMail: async () => {
  //   try {
  //     let i,
  //       j,
  //       k,
  //       l,
  //       stats,
  //       exchange,
  //       account,
  //       rowData,
  //       totalUSDTDifference = 0,
  //       startData,
  //       currentData,
  //       txData,
  //       adjustment = [],
  //       opening,
  //       closing,
  //       accountsArray = [],
  //       buySell,
  //       totalUSDTOpen = 0,
  //       totalUSDTCloseAct = 0,
  //       totalUSDTCloseCal = 0,
  //       totalUSDTBS = 0,
  //       totalUSDTDW = 0,
  //       pendingTotal = 0,
  //       pendingTotalArray = [];
  //     const converter = JSON.parse(await RedisClient.get("converterPrice"));
  //     let time = new Date();
  //     time.setUTCHours(2, 30, 0, 0);
  //     let yesterday = new Date(time);
  //     yesterday.setDate(yesterday.getDate() - 1);
  //     const statsData = await dailyStats.find({ time });
  //     const feesData = await commonHelper.getFees(yesterday, time);
  //     let workbook = new excel.Workbook();

  //     workbook.views = [
  //       {
  //         x: 0,
  //         y: 0,
  //         width: 10000,
  //         height: 20000,
  //         firstSheet: 0,
  //         activeTab: 1,
  //         visibility: "visible",
  //       },
  //     ];
  //     let worksheet = workbook.addWorksheet("Sheet 1");
  //     worksheet.columns = [
  //       {
  //         header: "Exchange",
  //         key: "exchange",
  //       },
  //       {
  //         header: "Account",
  //         key: "account",
  //       },
  //       {
  //         header: "Currency",
  //         key: "currency",
  //       },
  //       {
  //         header: "Yesterday",
  //         key: "yesterday",
  //       },
  //       {
  //         header: "Today",
  //         key: "today",
  //       },
  //       {
  //         header: "Difference",
  //         key: "difference",
  //       },
  //       {
  //         header: "Difference (USDT)",
  //         key: "differenceUSDT",
  //       },
  //       {
  //         header: "Fees",
  //         key: "fees",
  //       },
  //       {
  //         header: "Fees (USDT)",
  //         key: "feesUSDT",
  //       },
  //     ];
  //     worksheet.addRow();
  //     for (i = 0; i < statsData.length; i++) {
  //       exchange = statsData[i].exchange;
  //       account = statsData[i].account;
  //       stats = statsData[i].stats;
  //       for (j = 0; j < stats.length; j++) {
  //         rowData = {
  //           exchange,
  //           account,
  //           currency: stats[j].currency,
  //           yesterday: stats[j].yesterdayBalance,
  //           today: stats[j].todayBalance,
  //           difference: stats[j].balanceChange,
  //           differenceUSDT: stats[j].diffUSDT,
  //           fees: 0,
  //           feesUSDT: 0,
  //         };
  //         if (exchange == "total") {
  //           for (k = 0; k < feesData.length; k++) {
  //             if (feesData[k].currency == stats[j].currency) {
  //               rowData.fees = feesData[k].fees;
  //               rowData.feesUSDT = feesData[k].USDValue;
  //             }
  //           }
  //           totalUSDTDifference += rowData.differenceUSDT;
  //         }
  //         worksheet.addRow(rowData);
  //       }
  //       worksheet.addRow();
  //     }

  //     rowData = {
  //       exchange: "Total Difference(USDT)",
  //       account: "",
  //       currency: "USDT",
  //       yesterday: 0,
  //       today: 0,
  //       difference: 0,
  //       differenceUSDT: totalUSDTDifference,
  //       fees: 0,
  //       feesUSDT: 0,
  //     };
  //     worksheet.addRow(rowData);
  //     worksheet.addRow();
  //     worksheet.addRow();

  //     let worksheet1 = workbook.addWorksheet("Sheet 2");
  //     worksheet1.columns = [
  //       {
  //         header: "Exchange",
  //         key: "exchange",
  //       },
  //       {
  //         header: "Account",
  //         key: "account",
  //       },
  //       {
  //         header: "Currency",
  //         key: "currency",
  //       },
  //       {
  //         header: "Balance(1st May)",
  //         key: "opening",
  //       },
  //       {
  //         header: "Buy/Sell",
  //         key: "buy_sell",
  //       },
  //       {
  //         header: "Deposits/Withdrawal",
  //         key: "dep_with",
  //       },
  //       {
  //         header: "Closing Balance(Actual)",
  //         key: "closingAc",
  //       },
  //       {
  //         header: "Closing Balance(Calculated)",
  //         key: "closingCal",
  //       },
  //       {
  //         header: "Difference",
  //         key: "difference",
  //       },
  //       {
  //         header: "Rate",
  //         key: "rate",
  //       },
  //       {
  //         header: "Pending Buy/Sell",
  //         key: "pend_buy_sell",
  //       },
  //     ];
  //     worksheet1.addRow();

  //     const exchangeCurrencies = await ExchangeCurrencies.find({});
  //     for (i = 0; i < exchangeCurrencies.length; i++) {
  //       exchange = exchangeCurrencies[i].exchange;
  //       accountsArray = [];
  //       startData = await dailyWalletBalances.find({
  //         exchange: exchange,
  //         time: startDate,
  //       });
  //       if (startData.length > 0) {
  //         for (j = 0; j < startData.length; j++) {
  //           if (!accountsArray.includes(startData[j].account)) {
  //             accountsArray.push(startData[j].account);
  //           }
  //         }
  //       }
  //       currentData = await dailyWalletBalances.find({
  //         exchange: exchange,
  //         time: time,
  //       });
  //       if (currentData.length > 0) {
  //         for (j = 0; j < currentData.length; j++) {
  //           if (!accountsArray.includes(currentData[j].account)) {
  //             accountsArray.push(currentData[j].account);
  //           }
  //         }
  //       }
  //       for (j = 0; j < accountsArray.length; j++) {
  //         startData = await dailyWalletBalances.findOne({
  //           exchange: exchange,
  //           time: startDate,
  //           account: accountsArray[j],
  //         });
  //         txData = await walletSnapshotController.getAdjustmentsEA(
  //           startDate,
  //           time,
  //           exchange,
  //           accountsArray[j]
  //         );
  //         adjustment = [];
  //         for (k = 0; k < txData.length; k++) {
  //           if (!(txData[k].currency in adjustment)) {
  //             adjustment[txData[k].currency] = 0;
  //           }
  //           if (txData[k].type == "withdraw") {
  //             adjustment[txData[k].currency] =
  //               adjustment[txData[k].currency] - txData[k].amount;
  //           } else {
  //             adjustment[txData[k].currency] =
  //               adjustment[txData[k].currency] + txData[k].amount;
  //           }
  //         }
  //         currentData = await dailyWalletBalances.findOne({
  //           exchange: exchange,
  //           time: time,
  //           account: accountsArray[j],
  //         });
  //         for (k = 0; k < exchangeCurrencies[i].currency.length; k++) {
  //           // if (
  //           //   !currencies.includes(exchangeCurrencies[i].currency[k].symbol)
  //           // ) {
  //           //   currencies.push(exchangeCurrencies[i].currency[k].symbol);
  //           // }
  //           if (currencies.includes(exchangeCurrencies[i].currency[k].symbol)) {
  //             opening = 0;
  //             closing = 0;
  //             if (startData != "" && startData != null && startData.currency) {
  //               for (l = 0; l < startData.currency.length; l++) {
  //                 if (
  //                   exchangeCurrencies[i].currency[k].symbol ==
  //                   startData.currency[l].currency
  //                 ) {
  //                   opening = startData.currency[l].total;
  //                 }
  //               }
  //             }
  //             if (
  //               currentData != "" &&
  //               currentData != null &&
  //               currentData.currency
  //             ) {
  //               for (l = 0; l < currentData.currency.length; l++) {
  //                 if (
  //                   exchangeCurrencies[i].currency[k].symbol ==
  //                   currentData.currency[l].currency
  //                 ) {
  //                   closing = currentData.currency[l].total;
  //                 }
  //               }
  //             }
  //             buySell = await commonHelper.getCompletedOrdersSummary(
  //               exchange,
  //               accountsArray[j],
  //               exchangeCurrencies[i].currency[k].symbol,
  //               startDate,
  //               time
  //             );
  //             pendingTotal = await commonHelper.getOpenOrdersSummary(
  //               exchangeCurrencies[i].currency[k].symbol,
  //               exchange,
  //               accountsArray[j]
  //             );
  //             if (
  //               !(exchangeCurrencies[i].currency[k].symbol in pendingTotalArray)
  //             ) {
  //               pendingTotalArray[exchangeCurrencies[i].currency[k].symbol] = 0;
  //             }
  //             pendingTotalArray[exchangeCurrencies[i].currency[k].symbol] =
  //               pendingTotalArray[exchangeCurrencies[i].currency[k].symbol] +
  //               pendingTotal;
  //             rowData = {
  //               exchange: exchange,
  //               account: accountsArray[j],
  //               currency: exchangeCurrencies[i].currency[k].symbol,
  //               opening,
  //               buy_sell: buySell,
  //               dep_with:
  //                 adjustment[exchangeCurrencies[i].currency[k].symbol] || 0,
  //               closingAc: closing,
  //               closingCal:
  //                 opening +
  //                 (adjustment[exchangeCurrencies[i].currency[k].symbol] || 0) +
  //                 buySell,
  //               difference:
  //                 closing -
  //                 (opening +
  //                   (adjustment[exchangeCurrencies[i].currency[k].symbol] ||
  //                     0) +
  //                   buySell),
  //               rate: converter[
  //                 `${exchangeCurrencies[i].currency[k].symbol}-USDT`
  //               ].bid[0],
  //               pend_buy_sell: pendingTotal,
  //             };
  //             worksheet1.addRow(rowData);
  //           }
  //         }
  //         worksheet1.addRow();
  //       }
  //       worksheet1.addRow();
  //     }

  //     worksheet1.addRow();
  //     startData = await dailyWalletBalances.findOne({
  //       exchange: "total",
  //       time: startDate,
  //     });
  //     txData = await walletSnapshotController.getAdjustments(startDate, time);
  //     adjustment = [];
  //     for (k = 0; k < txData.length; k++) {
  //       if (!(txData[k].currency in adjustment)) {
  //         adjustment[txData[k].currency] = 0;
  //       }
  //       if (txData[k].type == "withdraw") {
  //         adjustment[txData[k].currency] =
  //           adjustment[txData[k].currency] - txData[k].amount;
  //       } else {
  //         adjustment[txData[k].currency] =
  //           adjustment[txData[k].currency] + txData[k].amount;
  //       }
  //     }
  //     currentData = await dailyWalletBalances.findOne({
  //       exchange: "total",
  //       time: time,
  //     });
  //     for (i = 0; i < currencies.length; i++) {
  //       opening = 0;
  //       closing = 0;
  //       for (l = 0; l < startData.currency.length; l++) {
  //         if (currencies[i] == startData.currency[l].currency) {
  //           opening = startData.currency[l].total;
  //         }
  //       }
  //       for (l = 0; l < currentData.currency.length; l++) {
  //         if (currencies[i] == currentData.currency[l].currency) {
  //           closing = currentData.currency[l].total;
  //         }
  //       }
  //       buySell = await commonHelper.getAllCompletedOrdersSummary(
  //         currencies[i],
  //         startDate,
  //         time
  //       );
  //       rowData = {
  //         exchange: "total",
  //         account: "total",
  //         currency: currencies[i],
  //         opening,
  //         buy_sell: buySell,
  //         dep_with: adjustment[currencies[i]] || 0,
  //         closingAc: closing,
  //         closingCal: opening + (adjustment[currencies[i]] || 0) + buySell,
  //         difference:
  //           closing - (opening + (adjustment[currencies[i]] || 0) + buySell),
  //         rate: converter[`${currencies[i]}-USDT`].bid[0],
  //         pend_buy_sell: pendingTotalArray[currencies[i]],
  //       };
  //       worksheet1.addRow(rowData);
  //       if (fiatCurrencies.includes(currencies[i])) {
  //         totalUSDTOpen =
  //           totalUSDTOpen + opening * converter[`${currencies[i]}-USDT`].bid[0];
  //         totalUSDTCloseAct =
  //           totalUSDTCloseAct +
  //           closing * converter[`${currencies[i]}-USDT`].bid[0];
  //         totalUSDTCloseCal =
  //           totalUSDTCloseCal +
  //           (opening + (adjustment[currencies[i]] || 0) + buySell) *
  //             converter[`${currencies[i]}-USDT`].bid[0];
  //         totalUSDTBS =
  //           totalUSDTBS + buySell * converter[`${currencies[i]}-USDT`].bid[0];
  //         totalUSDTDW =
  //           totalUSDTDW +
  //           (adjustment[currencies[i]] || 0) *
  //             converter[`${currencies[i]}-USDT`].bid[0];
  //       }
  //     }

  //     worksheet1.addRow();

  //     rowData = {
  //       exchange: "Total Fiat",
  //       account: "",
  //       currency: "USDT",
  //       opening: totalUSDTOpen,
  //       buy_sell: totalUSDTBS,
  //       dep_with: totalUSDTDW,
  //       closingAc: totalUSDTCloseAct,
  //       closingCal: totalUSDTCloseCal,
  //       difference: totalUSDTCloseAct - totalUSDTCloseCal,
  //       rate: 1,
  //     };
  //     worksheet1.addRow(rowData);

  //     const filename =
  //       time.getDate() +
  //       "/" +
  //       (time.getMonth() + 1) +
  //       "/" +
  //       time.getFullYear() +
  //       "_balance_report.xlsx";
  //     let tempfilePath = tempfile(".xlsx");
  //     workbook.xlsx.writeFile(tempfilePath).then(async function () {
  //       let attachments = [
  //         {
  //           filename: filename,
  //           path: tempfilePath,
  //         },
  //       ];
  //       const emails = await commonHelper.getEmailsForMail(1);
  //       // const emails = ["raj@xinfin.org"];
  //       await mail.send(
  //         emails,
  //         "Crypbot Daily Balance Summary Mail",
  //         "Hello, \n Please find the attached excel sheet for the daily balance summary calculated at : " +
  //           time,
  //         attachments
  //       );
  //     });
  //   } catch (error) {
  //     logger.error(`cronController_sendStatsMail_error : `, error);
  //     return "error";
  //   }
  // },

  updatedCompletedOrdersStatus: async () => {
    try {
      const activeOrders = await completedOrders.find({ status: "active" });
      let i, account, order, orderData;
      for (i = 0; i < activeOrders.length; i++) {
        order = activeOrders[i];
        account = await orderPlacement.GetAccount(order.exchange);
        orderData = {
          orderId: order.exchangeId,
          pair: order.pair,
          exchange: order.exchange,
          botType: order.botType,
          account: order.account,
          type: order.type,
          price: order.price,
          usdtPrice: order.usdtPrice,
          ...account,
        };
        await orderPlacement.GetOrderStatus(order.exchange, orderData);
      }
    } catch (error) {
      logger.error(`cronController_updatedCompletedOrdersStatus_error`, error);
      return "error";
    }
  },
};
