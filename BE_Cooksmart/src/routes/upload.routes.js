const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinary.config');
const uploadController = require('../controllers/upload.controller');


router.post('/', uploadCloud.array('images', 10), uploadController.uploadImages);


router.post('/single', uploadCloud.single('image'), uploadController.uploadImage);

module.exports = router;
