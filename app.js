const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const uploadsRouter = require("./routes/uploads");
const errorHandler = require("./utilities/errorHandler");
const cloudinary = require("cloudinary").v2;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors')
const path = require('path')
require("dotenv/config");

const app = express();
const api = process.env.API_URL;
const port = process.env.PORT || "3000";
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'CSV Image Processor API Documentation',
      version: '1.0.0',
      description: 'APIs to upload csv file with image link, get status of process and link to CSV file with resized images',
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors())
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

app.listen(port, () => {
  console.log(`Server is running at ${BASE_URL}`);
});
