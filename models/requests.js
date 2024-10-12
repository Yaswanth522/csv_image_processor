const mongoose = require("mongoose");

const requestsModel = new mongoose.Schema(
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

const Request = mongoose.model("Requests", requestsModel);

module.exports = Request;
