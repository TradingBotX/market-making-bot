const axiosHelper = require("./axiosHelper.js");
const adminHelper = require("./databaseHelpers/adminHelper.js");
const { StartOfTime } = require("../helpers/constant");
const RedisClient = require("../services/redis").RedisClient;
const completedOrders = require("../models/completedOrders.js");

module.exports = {
  getEmailsForMail: async function (adminLevel) {
    try {
      const adminList = await adminHelper.getAdminsByAlertLevel(adminLevel);
      let i = 0,
        emails = [];
      for (i = 0; i < adminList.length; i++) {
        emails.push(adminList[i].email);
      }
      if (emails.length <= 0) {
        emails = ["raj@xinfin.org", "rudresh@xinfin.org"];
      }
      return emails;
    } catch (error) {
      logger.error(`commonHelper_getEmailsForMail_error : `, error);
      return [];
    }
  },

  getTotalFees: async function (
    currency = null,
    startTime = null,
    endTime = null
  ) {
    try {
      if (!currency) currency = "";
      if (!startTime) startTime = StartOfTime;
      if (!endTime) endTime = new Date();

      const totalFeesArray = await module.exports.getFees(
        currency,
        startTime,
        endTime
      );

      let totalFees = 0;
      for (let i = 0; i < totalFeesArray.length; i++) {
        totalFees =
          totalFees +
          parseFloat(parseFloat(totalFeesArray[i].USDValue).toFixed(4));
      }

      return parseFloat(totalFees).toFixed(4);
    } catch (e) {
      logger.error("commonHelper_getTotalFees_error", e);
      return 0;
    }
  },

  getFiatUSDPrice: async (currency) => {
    try {
      let config = {
        url: `https://api.exchangeratesapi.io/latest?base=${currency}&symbols=USD`,
        contentType: "application/json",
      };
      const fiatData = await axiosHelper.makeGETRequest(config);
      return fiatData.data.rates.USD;
    } catch (error) {
      logger.error(`commonHelper_getFiatUSDPrice_error`, error);
      return 0;
    }
  },

  getCompletedOrdersSummary: async (exchange, account, currency, from, to) => {
    try {
      const totalData = await completedOrders.aggregate([
        {
          $match: {
            $and: [
              { createdAt: { $lte: to } },
              { createdAt: { $gte: from } },
              {
                exchange: exchange,
                account: account,
              },
            ],
          },
        },
        {
          $group: {
            _id: `${currency}`,
            amount: { $sum: `$${currency}` },
          },
        },
      ]);
      return totalData.length > 0 ? totalData[0].amount : 0;
    } catch (error) {
      logger.error(`commonHelper_getCompletedOrders_error`, error);
      return 0;
    }
  },

  getAllCompletedOrdersSummary: async (currency, from, to) => {
    try {
      const totalData = await completedOrders.aggregate([
        {
          $match: {
            $and: [{ createdAt: { $lte: to } }, { createdAt: { $gte: from } }],
          },
        },
        {
          $group: {
            _id: `${currency}`,
            amount: { $sum: `$${currency}` },
          },
        },
      ]);
      return totalData.length > 0 ? totalData[0].amount : 0;
    } catch (error) {
      logger.error(`commonHelper_getCompletedOrdersSummary_error`, error);
      return 0;
    }
  },

  passwordGenerator: async (len) => {
    var length = len ? len : 10;
    var string = "abcdefghijklmnopqrstuvwxyz"; //to upper
    var numeric = "0123456789";
    var punctuation = "!@#$&*_.-";
    var password = "";
    var character = "";
    while (password.length < length) {
      entity1 = Math.ceil(string.length * Math.random() * Math.random());
      entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
      entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
      hold = string.charAt(entity1);
      hold = password.length % 2 == 0 ? hold.toUpperCase() : hold;
      character += hold;
      character += numeric.charAt(entity2);
      character += punctuation.charAt(entity3);
      password = character;
    }
    password = password
      .split("")
      .sort(function () {
        return 0.5 - Math.random();
      })
      .join("");
    return password.substr(0, len);
  },

  emailGenerator: async (len) => {
    var length = len ? len : 10;
    var string = "abcdefghijklmnopqrstuvwxyz"; //to upper
    var numeric = "0123456789";
    var email = "";
    var character = "";
    while (email.length < length) {
      entity1 = Math.ceil(string.length * Math.random() * Math.random());
      entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
      hold = string.charAt(entity1);
      hold = email.length % 2 == 0 ? hold.toUpperCase() : hold;
      character += hold;
      character += numeric.charAt(entity2);
      email = character;
    }
    email = email
      .split("")
      .sort(function () {
        return 0.5 - Math.random();
      })
      .join("");
    return email.substr(0, len) + "@mmbot.test";
  },

  ConvertToCronTime: convertToCronTime,

  /**
   * @param time time in seconds
   */
  Sleep: (time) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  },
};

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, optional)

/**
 *
 * @param {string|number} interval interval time in ms
 */
function convertToCronTime({ secondStep = 0, minuteStep = 0 }) {
  if (secondStep > 0) {
    return `*/${secondStep} * * * * *`;
  } else if (minuteStep > 0) {
    return `* */${minuteStep} * * * *`;
  } else {
    return `*/5 * * * * *`;
  }
}
