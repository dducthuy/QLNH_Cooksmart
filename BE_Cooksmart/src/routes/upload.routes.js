const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinary.config');
const uploadController = require('../controllers/upload.controller');

// Route tải nhiều ảnh: POST /api/upload
router.post('/', uploadCloud.array('images', 10), uploadController.uploadImages);

// Route tải 1 ảnh: POST /api/upload/single
router.post('/single', uploadCloud.single('image'), uploadController.uploadImage);

module.exports = router;
