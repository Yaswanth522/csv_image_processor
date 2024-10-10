// Import the 'respondWith' function from the responseHandler module
const respondWith = require("./responseHandler");

// Error handling middleware for Express
const errorHandler = (err, req, res, next) => {
  // Log a message to indicate that the error handler is triggered
  console.log("In Error Handler");

  // Check if the error is related to authorization
  if (err.name === "UnauthorizedError") {
    // Respond with a 401 Unauthorized status and custom error message
    return respondWith(res, 401, false, {
      message: "User is not authorized!",
      ...err, // Spread the error object to include additional error details if present
    });
  }

  // Check if the error is a validation error
  if (err.name === "ValidationError") {
    // Respond with a 401 Unauthorized status and the error details
    return respondWith(res, 401, false, { ...err });
  }

  // For all other types of errors, respond with a 400 Bad Request status
  return respondWith(res, 400, false, { ...err });
};

// Export the error handler so it can be used in other parts of the application
module.exports = errorHandler;
