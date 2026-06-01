const express = require('express');
const router = express.Router();
const zalopayController = require('../controllers/zalopay.controller');

router.post('/create', zalopayController.createPayment);
router.post('/callback', zalopayController.callback);

module.exports = router;
