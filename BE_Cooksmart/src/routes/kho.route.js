const express = require("express");
const khoController = require("../controllers/kho.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

const router = express.Router();

// Bắt buộc phải đăng nhập, chỉ Admin và NhanVien được thao tác kho
router.use(baoVe);
router.use(phanQuyen("Admin", "NhanVien"));

// Nhập hàng
router.post("/nhap-hang", khoController.nhapKho);

// Kiểm kê
router.post("/kiem-ke", khoController.kiemKeKho);

// Xem lịch sử nhập/xuất/kiểm kê
router.get("/lich-su", khoController.layNhatKyKho);

// Xem báo cáo hao hụt
router.get("/bao-cao-hao-hut", khoController.layBaoCaoHaoHut);

module.exports = router;
