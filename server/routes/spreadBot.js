var express = require("express");
const spreadBotController = require("../controllers/spreadBotController");
var router = express.Router();
const RequireAdmin = require("../middlewares/requireAdmin");

/* GET home page. */
router.post("/addorder", RequireAdmin, spreadBotController.addOrder);
router.post("/cancelorder", RequireAdmin, spreadBotController.cancelOrder);
router.get("/getorders", RequireAdmin, spreadBotController.getOrders);

module.exports = router;
