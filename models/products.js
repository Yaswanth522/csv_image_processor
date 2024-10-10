const mongoose = require("mongoose");

const productsModel = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
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
      images: [{ type: String }],
      resizedImages: [{ type: String }],
    },
  ],
  csv_file_url: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model("Products", productsModel);

module.exports = Product;
