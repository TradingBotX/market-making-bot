var express = require("express");
const indexController = require("../controllers/indexController");
var router = express.Router();

/* GET home page. */

router.get("/getusdrates", indexController.getUSDRates);

module.exports = router;
