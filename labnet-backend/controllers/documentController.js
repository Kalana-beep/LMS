const Document = require('../models/Document');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { cloudinary } = require('../config/cloudinary');
const axios = require('axios');

// Helper: check if user can access a course's documents
const canAccessCourse = async (userId, courseId, userRole, teacherEmail) => {
  if (userRole === 'admin') return true;
  if (userRole === 'teacher') {
    const course = await Course.findById(courseId);
    return course && course.teacherEmail === teacherEmail;
  }
  if (userRole === 'student') {
    const enrolled = await Enrollment.exists({ studentId: userId, courseId });
    return !!enrolled;
  }
  return false;
};

// Get a single document by ID (for edit page)
exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const course = await Course.findById(doc.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const allowed = await canAccessCourse(req.user.id, doc.courseId, req.user.role, course.teacherEmail);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all documents for a course
exports.getCourseDocuments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const allowed = await canAccessCourse(req.user.id, req.params.courseId, req.user.role, course.teacherEmail);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const docs = await Document.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const { courseId, title, type } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacherEmail !== req.user.email) return res.status(403).json({ message: 'Not your course' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const doc = await Document.create({
      courseId,
      title,
      type,
      filePath: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      uploadedBy: req.user.id
    });
    res.status(201).json({ document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download document (stream)
exports.downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const course = await Course.findById(doc.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const allowed = await canAccessCourse(req.user.id, doc.courseId, req.user.role, course.teacherEmail);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const url = cloudinary.url(doc.publicId, { resource_type: 'raw', secure: true, expires_at: Math.floor(Date.now() / 1000) + 3600 });
    const response = await axios({ method: 'get', url, responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View document inline
exports.viewDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const course = await Course.findById(doc.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const allowed = await canAccessCourse(req.user.id, doc.courseId, req.user.role, course.teacherEmail);
    if (!allowed) return res.status(403).json({ message: 'Access denied' });
    const url = cloudinary.url(doc.publicId, { resource_type: 'raw', secure: true, expires_at: Math.floor(Date.now() / 1000) + 3600 });
    const response = await axios({ method: 'get', url, responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update document metadata
exports.updateDocument = async (req, res) => {
  try {
    const { title, type } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const course = await Course.findById(doc.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const isOwner = course.teacherEmail === req.user.email;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });
    if (title) doc.title = title;
    if (type) doc.type = type;
    await doc.save();
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const course = await Course.findById(doc.courseId);
    if (course.teacherEmail !== req.user.email && req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    await cloudinary.uploader.destroy(doc.publicId, { resource_type: 'raw' });
    await doc.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};