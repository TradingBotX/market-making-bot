const responseHelper = require("../helpers/RESPONSE");
const { RedisClient } = require("../services/redis");

module.exports = {
  getUSDRates: async (req, res) => {
    const converterPrice = JSON.parse(await RedisClient.get("converterPrice"));
    return responseHelper.successWithData(res, "Done", { converterPrice });
  },
};
