const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Ensure we have the necessary environment variables set in our .env file
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Initialize Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'JoyVoyage_DEV', // specify the folder in Cloudinary where images will be stored
        allowedformat: ["png", "jpg", "jpeg"], // allowed file formats
    },
});

module.exports = {
    cloudinary, // export the cloudinary configuration for use in routes and controllers
    storage // export the storage configuration for use in routes
};