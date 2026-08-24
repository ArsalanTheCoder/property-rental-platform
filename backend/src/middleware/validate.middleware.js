const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Middleware that inspects express-validator results on the request.
 * If validation fails, throws an ApiError(400) with formatted field errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return next(new ApiError(400, "Validation failed", formattedErrors));
  }
  next();
};

module.exports = validate;
