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
  },
  { timestamps: true }
);

const UploadCSV = mongoose.model("Uploads", uploadsModel);

module.exports = UploadCSV;
