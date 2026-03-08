const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { baoVe } = require("../middlewares/baoVe");

// POST /api/auth/dang-nhap  → Không cần token (public)
router.post("/dang-nhap", authController.dangNhap);

// GET /api/auth/toi  → Cần token (kiểm tra thông tin bản thân)
router.get("/toi", baoVe, (req, res) => {
    res.json({
        status: "success",
        data: req.nguoiDung,
    });
});

module.exports = router;
