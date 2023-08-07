const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { body } = require("express-validator");

const { validateRequest } = require("../middlewares/validateRequest");
const adminController = require("../controllers/adminController");

const requireAdmin = require("../middlewares/requireAdmin");
const requireSuperAdmin = require("../middlewares/requireSuperAdmin");

router.get("/auth-status", requireAdmin, adminController.authStatus);

/* GET users listing. */
router.post(
  "/sign-up",
  validateRequest([
    body("email").isEmail().withMessage("Email must be valid"),
    body("name")
      .trim()
      .isLength({ min: 2, max: 20 })
      // .isAlphanumeric()
      .withMessage("name must be a with length between 2 & 20")
      .isAlphanumeric()
      .withMessage("name must be an alpha-numeric string"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ]),
  adminController.signUp
);

router.post(
  "/sign-in",
  validateRequest([
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ]),
  adminController.signIn
);

router.post("/sign-out", requireAdmin, adminController.signOut);

router.post(
  "/add-exchange-pair",
  requireAdmin,
  validateRequest([
    body("exchange").notEmpty().isAlphanumeric(),
    body("pair").notEmpty(),
    body("decimalsAmount")
      .isNumeric()
      .custom((value) => {
        if (value) {
          if (String(value).indexOf(".") > 0) return false;
          if (parseInt(value) >= 0) {
            return true;
          } else {
            return false;
          }
        }
        return false;
      })
      .withMessage(
        "decimals have to be positive integer greater than or equal to 0"
      ),
    body("decimalsPrice")
      .isNumeric()
      .custom((value) => {
        if (value) {
          if (String(value).indexOf(".") > 0) return false;
          if (parseInt(value) >= 0) {
            return true;
          } else {
            return false;
          }
        }
        return false;
      })
      .withMessage(
        "decimals have to be positive integer greater than or equal to 0"
      ),
    body("minAmount")
      .isNumeric()
      .custom((value) => {
        if (value) {
          if (String(value).indexOf(".") > 0) return false;
          if (parseInt(value) >= 0) {
            return true;
          } else {
            return false;
          }
        }
        return false;
      })
      .withMessage(
        "min. amount have to be positive integer greater than equal 0"
      ),
  ]),
  adminController.addExchangePair
);

router.post(
  "/update-exchange-pair",
  requireAdmin,
  validateRequest([
    body("exchange").notEmpty().isAlphanumeric(),
    body("pair").notEmpty(),
    body("decimalsAmount")
      .isNumeric()
      .custom((value) => {
        if (value) {
          if (String(value).indexOf(".") > 0) return false;
          if (parseInt(value) >= 0) {
            return true;
          } else {
            return false;
          }
        }
        return false;
      })
      .withMessage(
        "decimals have to be positive integer greater than or equal to 0"
      ),
    body("decimalsPrice")
      .isNumeric()
      .custom((value) => {
        if (value) {
          if (String(value).indexOf(".") > 0) return false;
          if (parseInt(value) >= 0) {
            return true;
          } else {
            return false;
          }
        }
        return false;
      })
      .withMessage(
        "decimals have to be positive integer greater than or equal to 0"
      ),
    body("minAmount")
      .isNumeric()
      .custom((value) => {
        if (value) {
          if (String(value).indexOf(".") > 0) return false;
          if (parseInt(value) >= 0) {
            return true;
          } else {
            return false;
          }
        }
        return false;
      })
      .withMessage(
        "min. amount have to be positive integer greater than equal 0"
      ),
  ]),
  adminController.UpdateExchangePairDecimals
);

router.post(
  "/add-exchange",
  requireAdmin,
  validateRequest([
    body("exchange").notEmpty().isAlphanumeric(),
    body("tradeFee")
      .isNumeric()
      .custom((val) => {
        if (parseFloat(val) < 0) return false;
        return true;
      })
      .withMessage("trade fee has to be greater than / equal to 0"),
  ]),
  adminController.addExchange
);

router.post(
  "/activate-exchange",
  requireAdmin,
  validateRequest([body("exchange").notEmpty().isAlphanumeric()]),
  adminController.ActivateExchange
);

router.post(
  "/deactivate-exchange",
  requireAdmin,
  validateRequest([body("exchange").notEmpty().isAlphanumeric()]),
  adminController.DeactivateExchange
);

router.post(
  "/update-exchange-trade-fee",
  requireAdmin,
  validateRequest([
    body("exchange").notEmpty().isAlphanumeric(),
    body("tradeFee").isNumeric(),
  ]),
  adminController.UpdateExchangeTradeFee
);

router.get("/exchange-details", requireAdmin, adminController.GetExchange);

router.get(
  "/arbitrage-operation",
  requireAdmin,
  adminController.GetArbitrageOperation
);

router.post(
  "/acceptAdmin",
  requireSuperAdmin,
  validateRequest([body("email").notEmpty()]),
  adminController.AcceptAdmin
);
router.post(
  "/rejectAdmin",
  requireSuperAdmin,
  validateRequest([body("email").notEmpty()]),
  adminController.RejectAdmin
);
router.get("/getAdmin", requireSuperAdmin, adminController.getAdmin);

router.post(
  "/updatemailpref",
  requireAdmin,
  validateRequest([body("level").notEmpty().isNumeric()]),
  adminController.updateMailPref
);

router.get("/exchangepairdetails", adminController.getExchangePairDetails);

router.get(
  "/exchangeCurrencies",
  requireAdmin,
  adminController.getExchangeCurrencies
);
router.post("/ec-add-exchange", requireAdmin, adminController.ecAddExchange);
router.post(
  "/ec-add-exchange-currency",
  requireAdmin,
  adminController.ecAddExchangeCurrency
);
router.post(
  "/ec-update-exchange-currency",
  requireAdmin,
  adminController.ecUpdateExchangeCurrency
);
// router.post('/ec-remove-exchange-currency', adminController.ecRemoveExchangeCurrency);

router.get(
  "/hourly-snapshot/get-timestamps",
  requireAdmin,
  adminController.getTimestamps
);

router.post(
  "/hourly-snapshot/get-data-by-timestamp",
  requireAdmin,
  adminController.getDataByTimestamp
);

router.post("/addkey", adminController.addKey);

router.get("/getkeys", adminController.getKeys);

router.post("/deletekey", adminController.deleteKey);

module.exports = router;
