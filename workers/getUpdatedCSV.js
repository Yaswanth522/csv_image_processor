const fs = require("fs");
const csv = require("csv-parser");
const fastcsv = require("fast-csv");
const cloudinary = require("cloudinary").v2;

// DB models imports
const Request = require("../models/requests");
const Product = require("../models/products");

//utility imports
const resizeImage = require("../utilities/getResizedImage");

// To process the csv file, resize images and generate a link to upated csv file
const getUpdatedCSV = async (filePath, requestId) => {
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
        await Request.findOneAndUpdate(
          { requestId: requestId },
          { status: "Error", results: error }
        );
        return;
      }

      const productRecord = processedResults.map((result) => {
        return {
          serial_number: result.serial_number,
          product_name: result.product_name,
          images: result.images.split(","),
          resizedImages: result.resizedImages.split(","),
        };
      });
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
            await Request.findOneAndUpdate(
              { requestId: requestId },
              { status: "Completed", results: uploadResponse.secure_url },
              { new: true }
            );

            const product = new Product({
              requestId: requestId,
              products: productRecord,
              csv_file_url: uploadResponse.secure_url,
            });
            await product.save();
          } catch (error) {
            console.error("Error:", error);
            await Request.findOneAndUpdate(
              { requestId: requestId },
              { status: "Error", results: "Error occured" }
            );
          }
        });
    })
    .on("error", async (error) => {
      await Request.findOneAndUpdate(
        { requestId: requestId },
        { status: "Error", results: "Error occured" }
      );
      console.error("Error reading the CSV file.", error);
    });
};

module.exports = getUpdatedCSV;
