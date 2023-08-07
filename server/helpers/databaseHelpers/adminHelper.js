const admin = require("../../models/admin");

module.exports = {
  getAdminsByAlertLevel: async (level) => {
    try {
      const adminData = await admin.find({
        alerts: { $gte: level },
      });
      return adminData;
    } catch (error) {
      logger.error(`adminHelper_getAdminsByAlertLevel_error : `, error);
      return [];
    }
  },

  updateAlertLevel: async (email, level) => {
    try {
      await admin.updateOne(
        {
          email: email,
        },
        {
          $set: {
            alerts: level,
          },
        }
      );
      return true;
    } catch (error) {
      logger.error(`adminHelper_updateAlertLevel_error : `, error);
      return "error";
    }
  },
};
