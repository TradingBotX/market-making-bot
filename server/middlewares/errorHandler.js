const { CustomError } = require("../helpers/errors");

exports.errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    logger.error(err);
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  logger.error("uncaught error", { error: err });

  res.status(500).send({
    errors: [{ message: "internal error" }],
  });
};
