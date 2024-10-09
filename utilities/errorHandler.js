const respondWith = require("./responseHandler");

const errorHandler = (err, req, res, next) => {
  console.log("In Error Handler");
  if (err.name === "UnauthorizedError") {
    return respondWith(res, 401, false, {
      message: "User is not authorized!",
      ...err,
    });
  }

  if (err.name === "ValidationError") {
    return respondWith(res, 401, false, { ...err });
  }

  return respondWith(res, 400, false, { ...err });
};

module.exports = errorHandler;
