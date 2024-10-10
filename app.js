//npm imports
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const path = require("path");
require("dotenv/config");

// router imports
const uploadsRouter = require("./routes/uploads");

//utility imports
const errorHandler = require("./utilities/errorHandler");

const app = express();
const api = process.env.API_URL;
const port = process.env.PORT || "3000";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Swagger config for API doc generation and pointing it to yaml with doc definitions.
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "CSV Image Processor API Documentation",
      version: "1.0.0",
      description:
        "The system allows you to submit a CSV file containing image links for processing, where each image will be resized by half (e.g., an image of 1024x512 will become 512x256). Upon submission, the system instantly returns a request ID, which can be used to track the status of the request. This includes checking if any errors occurred during processing and obtaining a link to the updated CSV with the resized image links once the request is completed.",
    },
    servers: [
      {
        url: `${BASE_URL}${api}`,
      },
    ],
  },
  apis: [path.join(__dirname, "./utilities/swaggerDocs.yaml")], // Path to the API docs (can be adjusted)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

//middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use((err, req, res, next) => {
  errorHandler(err, req, res, next);
});
app.use(`${api}/`, uploadsRouter);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

// configure server to listen requests on PORT
app.listen(port, () => {
  console.log(`Server is running at ${BASE_URL}`);
});
