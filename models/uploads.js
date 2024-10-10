const mongoose = require("mongoose");

const uploadsModel = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Processing", "Completed", "Error"],
      required: true,
    },
    results: { type: String, default: null },
    products: [
      {
        serial_number: {
          type: Number,
          required: true,
        },
        product_name: {
          type: String,
          required: true,
        },
        images: { type: String },
        resizedImages: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const UploadCSV = mongoose.model("Uploads", uploadsModel);

module.exports = UploadCSV;
