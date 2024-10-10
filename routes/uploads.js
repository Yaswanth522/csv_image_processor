// npm imports
const express = require("express");
const multer = require("multer");

// DB models imports
const UploadCSV = require("../models/uploads");

// utility imports
const respondWith = require("../utilities/responseHandler");

// worker imports
const getUpdatedCSV = require("../workers/getUpdatedCSV");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// /api/v1/upload => Takes file as input -> gives json as response
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return respondWith(res, 400, false, { message: "No file uploaded." });
  }
  const requestId = req.file.filename;
  const initialStatus = new UploadCSV({
    requestId: requestId,
    status: "Processing",
    products: [],
  });
  await initialStatus.save();

  respondWith(res, 200, true, {
    message: "Request is being processed.",
    requestId: requestId, // Send back the request ID for status check
    track_status: `${process.env.DOMAIN}api/v1/status/${requestId}`,
  });
  // Process the CSV file
  await getUpdatedCSV(req.file.path, requestId);
});

// /api/v1/status => gives json response with status of request
router.get("/status/:requestId", async (req, res) => {
  const requestId = req.params.requestId;
  const uploadStatus = await UploadCSV.findOne({ requestId: requestId });
  if (!uploadStatus) {
    return res.status(404).send("Request ID not found.");
  }
  if (uploadStatus.status === "Completed") {
    return respondWith(res, 200, true, {
      status: "Completed",
      file_url: uploadStatus.results,
    });
  } else if (uploadStatus.status === "Processing") {
    return respondWith(res, 200, true, {
      status: "Processing",
      requestId: requestId,
    });
  } else {
    return respondWith(res, 200, true, {
      status: "Error occured",
      details: uploadStatus.results,
    });
  }
});

module.exports = router;
