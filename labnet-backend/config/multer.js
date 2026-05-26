const multer = require('multer');
const { videoStorage, documentStorage, profileStorage } = require('./cloudinary');

const uploadVideo = multer({ storage: videoStorage, limits: { fileSize: 500 * 1024 * 1024 } });
const uploadDocument = multer({ storage: documentStorage, limits: { fileSize: 50 * 1024 * 1024 } });
const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { uploadVideo, uploadDocument, uploadProfile };