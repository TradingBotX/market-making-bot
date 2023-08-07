const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.headers.authorization || req.headers.token;

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    async function (err, decoded) {
      if (err) {
        logger.error(`requireAdmin_jwt_error`, err, token);
        return responseHelper.error(res, "please login again.");
      } else {
        if (decoded.level !== 1 && decoded.level !== 2) {
          return res
            .status(401)
            .json({ errors: [{ message: "unauthorized" }] });
        }
        req.user = decoded;
        next();
      }
    }
  );
};
