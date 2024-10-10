// Define a function 'respondWith' to standardize API responses
const respondWith = (res, status, success, jsonResponse) => {
  // Log the response information to the console for debugging purposes
  console.log("In response handler", success, status, jsonResponse);

  // Send a response with the provided HTTP status code and JSON payload
  return res.status(status).json({
    success: success,  // Indicates whether the operation was successful
    ...jsonResponse,   // Spread the additional JSON response data passed to the function
  });
};

// Export the 'respondWith' function so it can be used in other modules
module.exports = respondWith;
