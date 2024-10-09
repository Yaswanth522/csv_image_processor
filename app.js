const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const uploadsRouter = require("./routers/uploads");
const errorHandler = require("./utilities/errorHandler");
const cloudinary = require("cloudinary").v2;
require("dotenv/config")

const app = express();
const api = process.env.API_URL;
const port = "3000";

app.use(bodyParser.json());
app.use(morgan("tiny"));

app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});

app.use(`${api}/`, uploadsRouter);

const domainAddress = "localhost:" + port;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Mongodb connection trough mongoose
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    dbName: "image_size_reducer",
  })
  .then(() => {
    console.log("db connected!");
  })
  .catch((e) => {
    console.log("Error occurred: ", e);
  });

app.listen(port, () => {
  console.log(`Server is running at http://${domainAddress}`);
});
