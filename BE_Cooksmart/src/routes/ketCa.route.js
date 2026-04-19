const express = require("express");
const ketCaController = require("../controllers/ketCa.controller");
const { baoVe } = require("../middlewares/baoVe");

const router = express.Router();

// Chỉ những người dùng đã đăng nhập (Nhân viên, Admin) mới có thể thao tác ca làm việc
router.use(baoVe);

// Mở ca làm việc mới
router.post("/open", ketCaController.moCa);

// Lấy thông tin ca làm việc hiện tại đang chạy của nhân viên
router.get("/current", ketCaController.layThongTinCaHienTai);

// Chốt ca kết thúc phiên làm việc
router.post("/close/:id", ketCaController.chotCa);

// Ghi nhận chi tiêu trong ca
router.post("/expense", ketCaController.themChiTieuCa);

module.exports = router;
