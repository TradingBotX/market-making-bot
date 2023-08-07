const { validationResult } = require("express-validator");
const { RequestValidationError } = require("../helpers/errors");

exports.validateRequest = (checks) => {
  return async function (req, res, next) {
    for (let check of checks) {
      await check.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    } else {
      next();
    }
  };
};
