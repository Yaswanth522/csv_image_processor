# CSV Image Processor

## Overview

The system allows you to submit a CSV file containing image links for processing, where each image will be resized by half (e.g., an image of 1024x512 will become 512x256). Upon submission, the system instantly returns a request ID, which can be used to track the status of the request. This includes checking if any errors occurred during processing and obtaining a link to the updated CSV with the resized image links once the request is completed.

## How to use
Read API docs at: https://csv-image-processor.onrender.com/api-docs/
- **Note**: If not working, reload or request again as it is hosted as a free service it will get suspended if not used for a while.

## Technologies Used

- **express**: Web framework for building APIs and handling HTTP requests.
- **body-parser**: Middleware for parsing request bodies (JSON, URL-encoded data).
- **mongoose**: ODM for MongoDB to model and interact with database data.
- **morgan**: Logs HTTP requests to the console or log file.
- **cloudinary**: Cloud service for managing and optimizing images and videos.
- **swagger-jsdoc**: Generates Swagger API documentation from JSDoc comments.
- **swagger-ui-express**: Serves a web-based Swagger UI for API documentation.
- **sharp**: A high-performance image processing library for resizing, converting, and manipulating images.
- **axios**: A promise-based HTTP client for making requests to external APIs or servers.
- **multer**: Middleware for handling multipart/form-data, primarily used for uploading files.

# Installation Guide
Follow these steps to set up the project locally.

## Clone the Repository

1. Open your terminal and clone the repository using the following command:

   ```bash
   git clone https://github.com/your-username/project-name.git

2. Navigate into the project directory:
    ```bash
    cd project-name

3. Install the project dependencies using npm:
    ```bash
    npm install

4. Create a .env file and add all required environment variables
    ```makefile
    API_URL = value
    MONGODB_CONNECTION_STRING = value
    CLOUDINARY_CLOUD_NAME = value
    CLOUDINARY_API_KEY = value
    CLOUDINARY_API_SECRET = value

5. To start the server, run:
    ```bash
    npm start

## API Documentation
You can access the Swagger API docs UI by navigating to http://localhost:3000/api-docs in your browser once the server is running.


