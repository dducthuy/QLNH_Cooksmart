const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
// Có thể thêm middleware xác thực jwtAuth tại đây nếu cần

router.get('/tong-quan', dashboardController.getDashboardTongQuan);

module.exports = router;
