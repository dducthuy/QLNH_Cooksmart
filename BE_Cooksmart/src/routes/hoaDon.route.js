const express = require("express");
const router = express.Router();
const hoaDonController = require("../controllers/hoaDon.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

// 1. API cho Nội bộ (Admin, Phục Vụ)
// Yêu cầu token, lưu id_nhan_vien vào hóa đơn
router.post("/noi-bo", baoVe, phanQuyen("Admin", "PhucVu"), hoaDonController.taoHoaDon);

// Lấy danh sách tất cả hóa đơn (Admin, Phục Vụ)
router.get("/noi-bo", baoVe, phanQuyen("Admin", "PhucVu"), hoaDonController.layTatCaHoaDon);

// Lấy chi tiết một hóa đơn cụ thể (Admin, Phục Vụ)
router.get("/noi-bo/:id", baoVe, phanQuyen("Admin", "PhucVu"), hoaDonController.layChiTietHoaDon);

// Cập nhật trạng thái hóa đơn (Admin, Phục Vụ)
router.patch("/noi-bo/:id/trang-thai", baoVe, phanQuyen("Admin", "PhucVu"), hoaDonController.capNhatTrangThaiHoaDon);

// 2. API cho Khách hàng (Quét mã QR)
// Yêu cầu id_ban hợp lệ, không cần token (trống id_nhan_vien)
router.post("/khach-hang", hoaDonController.taoHoaDonKhachHang);

module.exports = router;
