const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { baoVe } = require("../middlewares/baoVe");


router.post("/dang-nhap", authController.dangNhap);


router.post("/tao-tai-khoan", authController.taoTaiKhoan);


router.get("/toi", baoVe, (req, res) => {
    res.json({
        status: "success",
        data: req.nguoiDung,
    });
});

module.exports = router;
