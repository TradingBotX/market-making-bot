class CustomError extends Error {
  /**
   * Will return an array of error [{ message:string;field?:string }]
   */
  sequeslizeError() {
    throw new Error("implement sequelize error");
  }
}

class ServerError extends CustomError {
  constructor() {
    this.statusCode = 500;
    this.message = "server error";
  }

  sequeslizeError() {
    return [{ message: this.message }];
  }
}

class RequestValidationError extends CustomError {
  constructor(_errors) {
    super("Invalid request parameters");
    this.statusCode = 400;
    this.errors = _errors;
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}

class UnauthorizationError extends CustomError {
  constructor() {
    super("unauthorized access");
    this.statusCode = 400;
    this.message = "unauthorized access";
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return [{ message: this.message }];
    });
  }
}

class RateLimitError extends CustomError {
  constructor() {
    super("ratelimit error");
    this.statusCode = 429;
    this.message = "too many requests";
  }

  serializeErrors() {
    return this.errors.map((err) => {
      return [{ message: this.message }];
    });
  }
}

class UserExistsError extends CustomError {
  constructor(email) {
    super("user already exists");
    this.statusCode = 400;
    this.message = `user already exists ${email}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ExchangeDoesNotExistError extends CustomError {
  constructor(exchange) {
    super("given exchange does not exist");
    this.statusCode = 400;
    this.message = `given exchange does not exist ${exchange}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ExchangeExistError extends CustomError {
  constructor(exchange) {
    super("given exchange already exist");
    this.statusCode = 400;
    this.message = `given exchange already exist ${exchange}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class PairExists extends CustomError {
  constructor(pairName) {
    super("pairName");
    this.statusCode = 400;
    this.message = `given pair already exists ${pairName}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class PairDoesNotExists extends CustomError {
  constructor(pairName) {
    super(pairName);
    this.statusCode = 400;
    this.message = `given pair does not exists ${pairName}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ArbitrageOperationExists extends CustomError {
  constructor() {
    super("multiple arbitrage operation");
    this.statusCode = 400;
    this.message = `arbitrage operation already exists, please update`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ArbitrageOperationNotExists extends CustomError {
  constructor() {
    super("arbitrage operation not initiated");
    this.statusCode = 400;
    this.message = `arbitrage operation not exists, please initiate`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ArbitrageAlreadyStopped extends CustomError {
  constructor() {
    super("arbitrage already stopped");
    this.statusCode = 400;
    this.message = `arbitrage already stopped`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ArbitrageAlreadyStarted extends CustomError {
  constructor() {
    super("arbitrage already started");
    this.statusCode = 400;
    this.message = `arbitrage already started`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ExchangePairDoesNotExistError extends CustomError {
  constructor(exchange, pair) {
    super("given exchange and does not exist");
    this.statusCode = 400;
    this.message = `Given exchange ${exchange} and pair ${pair} does not exist.`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class BotExistError extends CustomError {
  constructor(exchange, pair, bot) {
    super("given exchange and does not exist");
    this.statusCode = 400;
    this.message = `${bot} bot details already added for exchange ${exchange} and pair ${pair}.`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class CurrencyExists extends CustomError {
  constructor(currencyName) {
    super("currencyName");
    this.statusCode = 400;
    this.message = `given currency already exists ${currencyName}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class CurrencyDoesNotExists extends CustomError {
  constructor(currencyName) {
    super(currencyName);
    this.statusCode = 400;
    this.message = `given currency does not exists ${currencyName}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class CurrencyIdExists extends CustomError {
  constructor(currencyId) {
    super("currencyId");
    this.statusCode = 400;
    this.message = `given currency id already exists ${currencyId}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ExchangeSymbolExists extends CustomError {
  constructor(exchangeSymbol) {
    super("exchangeSymbol");
    this.statusCode = 400;
    this.message = `given exchange symbol already exists ${exchangeSymbol}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class ManualOrderNotPlace extends CustomError {
  constructor(manualOrder) {
    super("manualOrder");
    this.statusCode = 400;
    this.message = `Went into some problem while placing order ${manualOrder}`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class AdminGranted extends CustomError {
  constructor(email) {
    super("admin granted");
    this.statusCode = 400;
    this.message = `admin ${email} already granted`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class AdminRevoked extends CustomError {
  constructor(email) {
    super("admin revoked");
    this.statusCode = 400;
    this.message = `admin ${email} already revoked`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

class SnapNotFound extends CustomError {
  constructor() {
    super("snap not found");
    this.statusCode = 400;
    this.message = `snap not found`;
  }
  serializeErrors() {
    return [{ message: this.message }];
  }
}

/**
 * Export the classes as per their class name
 */

exports.UserExistsError = UserExistsError;
exports.RateLimitError = RateLimitError;
exports.UnauthorizationError = UnauthorizationError;
exports.CustomError = CustomError;
exports.ServerError = ServerError;
exports.RequestValidationError = RequestValidationError;
exports.ExchangeDoesNotExistError = ExchangeDoesNotExistError;
exports.PairExists = PairExists;
exports.ArbitrageOperationExists = ArbitrageOperationExists;
exports.ArbitrageOperationNotExists = ArbitrageOperationNotExists;
exports.ExchangeExistError = ExchangeExistError;
exports.ArbitrageAlreadyStopped = ArbitrageAlreadyStopped;
exports.ArbitrageAlreadyStarted = ArbitrageAlreadyStarted;
exports.ExchangePairDoesNotExistError = ExchangePairDoesNotExistError;
exports.BotExistError = BotExistError;
exports.PairDoesNotExists = PairDoesNotExists;
exports.CurrencyExists = CurrencyExists;
exports.CurrencyIdExists = CurrencyIdExists;
exports.CurrencyDoesNotExists = CurrencyDoesNotExists;
exports.ExchangeSymbolExists = ExchangeSymbolExists;
exports.ManualOrderNotPlace = ManualOrderNotPlace;
exports.AdminGranted = AdminGranted;
exports.AdminRevoked = AdminRevoked;
exports.SnapNotFound = SnapNotFound;
