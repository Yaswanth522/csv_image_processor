// npm imports
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const fastcsv = require("fast-csv");
const cloudinary = require("cloudinary").v2;

// DB models imports
const UploadCSV = require("../models/uploads");

// utility imports
const resizeImage = require("../utilities/getResizedImage");
const respondWith = require("../utilities/responseHandler");

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
  await getCSV(req.file.path, requestId);
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

// To process the csv file, resize images and generate a link to upated csv file
const getCSV = async (filePath, requestId) => {
  let results = [];
  // Read and parse the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
      // Process the images
      let processedResults = [];
      try {
        processedResults = await Promise.all(
          results.map(async (result) => {
            if (
              !result.serial_number ||
              !result.product_name ||
              !result.images
            ) {
              throw new Error(
                "Data not found, Please make sure csv file don't have partially empty records & Headers must be serial_number, product_name, images"
              );
            }
            const resizedImages = await Promise.all(
              result.images.split(",").map(async (image) => {
                const resizedImage = await resizeImage(image);
                if (
                  resizedImage &&
                  resizedImage.success !== undefined &&
                  !resizedImage.success
                ) {
                  throw new Error("Image not found for " + result.product_name);
                }
                return resizedImage;
              })
            );
            return { ...result, resizedImages: resizedImages.join(",") };
          })
        );
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        await UploadCSV.findOneAndUpdate(
          { requestId: requestId },
          { status: "Error", results: error }
        );
        return;
      }

      await UploadCSV.findOneAndUpdate(
        { requestId: requestId },
        { status: "Processing", products: processedResults }
      );
      // Write the processed results to a new CSV file
      const outputPath = `./files/${requestId}.csv`;
      const ws = fs.createWriteStream(outputPath);
      fastcsv
        .write(processedResults, { headers: true })
        .pipe(ws)
        .on("finish", async () => {
          try {
            // Upload the CSV file to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(
              outputPath,
              {
                resource_type: "raw",
                public_id: requestId,
                overwrite: true,
              }
            );
            // Clean up the local CSV file after upload
            fs.unlinkSync(outputPath);

            // Update processing status
            await UploadCSV.findOneAndUpdate(
              { requestId: requestId },
              { status: "Completed", results: uploadResponse.secure_url },
              { new: true }
            );
          } catch (error) {
            console.error("Cloudinary upload error:", error);
            await UploadCSV.findOneAndUpdate(
              { requestId: requestId },
              { status: "Error", results: "Error occured" }
            );
          }
        });
    })
    .on("error", async (error) => {
      await UploadCSV.findOneAndUpdate(
        { requestId: requestId },
        { status: "Error", results: "Error occured" }
      );
      console.error("Error reading the CSV file.", error);
    });
};

module.exports = router;
