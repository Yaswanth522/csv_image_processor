const respondWith = (res, status, success, jsonResponse) => {
  console.log("In response handler", success, status, jsonResponse);
  return res.status(status).json({
    success: success,
    ...jsonResponse,
  });
};

module.exports = respondWith;
