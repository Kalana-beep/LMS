const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Video storage
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Sigma/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
  },
});

// Document storage
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Sigma/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt'],
  },
});

// Profile image storage
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Sigma/profiles',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

module.exports = { cloudinary, videoStorage, documentStorage, profileStorage };