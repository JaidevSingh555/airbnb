const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, //key word name on the left
    api_key: process.env.CLOUD_API_KEY, //key word name on the left
    api_secret: process.env.CLOUD_API_SECRET, //key word name on the left
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
        folder: 'wanderlust_DEV', // Folder in Cloudinary
        format: file.mimetype.split('/')[1], // Extract format from MIME type
        allowed_formats: ["png", "jpg", "jpeg"], // Allowed formats
    }),
});

module.exports = {cloudinary, storage};