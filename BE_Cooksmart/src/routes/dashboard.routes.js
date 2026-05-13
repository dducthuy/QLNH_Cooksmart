const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');


router.get('/tong-quan', dashboardController.getDashboardTongQuan);

module.exports = router;
