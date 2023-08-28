const CronJob = require("cron").CronJob;
const cronController = require("../controllers/cronController");
const spreadBotController = require("../controllers/spreadBotController");

// new CronJob(
//   "56 * * * *",
//   async () => {
//     cronController.checkBalances();
//   },
//   null,
//   true,
//   "Asia/Kolkata"
// );

new CronJob(
  "14 * * * * *",
  async () => {
    await spreadBotController.autoCancelOrders();
    await spreadBotController.generateOrders();
    await spreadBotController.placeOrders();
    await spreadBotController.updateCancellingOrders();
    await spreadBotController.updateOrdersMin();
    // await spreadBotController.placeFailedOrders();
    await spreadBotController.checkOrderNumbers();
  },
  null,
  true,
  "Asia/Kolkata"
);

new CronJob(
  "*/10 * * * *",
  async () => {
    cronController.updatedCompletedOrdersStatus();
    // spreadBotController.updateMaintainOrderStatus();
    await spreadBotController.updateOrders10Min();
  },
  null,
  true,
  "Asia/Kolkata"
);

// new CronJob(
//   "0 */3 * * *",
//   async () => {
//     await spreadBotController.maintainBalance();
//   },
//   null,
//   true,
//   "Asia/Kolkata"
// );

// new CronJob(
//   "16 2 * * * *",
//   async () => {
//     await spreadBotController.differenceMail();
//     // await spreadBotController.maintainBalance();
//   },
//   null,
//   true,
//   "Asia/Kolkata"
// );

new CronJob(
  "0 8 * * *",
  async () => {
    await cronController.updateBalance("daily");
  },
  null,
  true,
  "Asia/Kolkata"
);

new CronJob(
  "5 * * * *",
  async () => {
    await cronController.updateBalance("hourly");
  },
  null,
  true,
  "Asia/Kolkata"
);
