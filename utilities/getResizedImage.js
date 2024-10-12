const sharp = require("sharp");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

async function resizeImage(url) {
  try {
    // Fetch image from URL
    url = url.trim()
    if(url === "") {
      return "NA"
    }
    const response = await axios({
      url,
      responseType: "arraybuffer",
    });

    // Get image metadata (width, height)
    const image = sharp(response.data);
    const metadata = await image.metadata();

    // Resize the image to half of its original dimensions
    const newWidth = Math.floor(metadata.width / 2);
    const newHeight = Math.floor(metadata.height / 2);

    const resizedImageBuffer = await image
      .resize(newWidth, newHeight)
      .jpeg()
      .toBuffer();

    return new Promise((resolve, reject) => {
      // Upload resized image to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image", // Specify it's an image file
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(error);
          } else {
            console.log("Uploaded to Cloudinary:", result.secure_url);
            resolve(result.secure_url); // Resolve the Promise with the image URL
          }
        }
      );

      // Send the buffer to Cloudinary
      uploadStream.end(resizedImageBuffer);
    });
  } catch (error) {
    return { success: false, error: error };
  }
}

module.exports = resizeImage;
