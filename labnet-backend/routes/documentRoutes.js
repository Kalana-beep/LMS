const express = require('express');
const {
  uploadDocument,
  getCourseDocuments,
  getDocumentById,         // new
  downloadDocument,
  viewDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');
const { uploadDocument: uploadMiddleware } = require('../config/multer');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.post('/upload', auth, roleCheck('teacher'), uploadMiddleware.single('file'), uploadDocument);
router.get('/course/:courseId', auth, getCourseDocuments);
router.get('/:id', auth, getDocumentById);                     // new: fetch single document
router.get('/download/:id', auth, downloadDocument);
router.get('/view/:id', auth, viewDocument);
router.put('/:id', auth, roleCheck('teacher', 'admin'), updateDocument);
router.delete('/:id', auth, roleCheck('teacher', 'admin'), deleteDocument);

module.exports = router;