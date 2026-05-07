const express = require("express");
const router = express.Router();
const hoaDonController = require("../controllers/hoaDon.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");


router.post("/noi-bo", baoVe, phanQuyen("Admin", "PhucVu"), hoaDonController.taoHoaDon);


router.get("/noi-bo", baoVe, phanQuyen("Admin", "PhucVu", "Bep"), hoaDonController.layTatCaHoaDon);


router.get("/noi-bo/:id", baoVe, phanQuyen("Admin", "PhucVu", "Bep"), hoaDonController.layChiTietHoaDon);


router.patch("/noi-bo/:id/trang-thai", baoVe, phanQuyen("Admin", "PhucVu"), hoaDonController.capNhatTrangThaiHoaDon);


router.patch("/noi-bo/chi-tiet/:id/trang-thai", baoVe, phanQuyen("Admin", "PhucVu", "Bep"), hoaDonController.capNhatTrangThaiMon);

router.post("/noi-bo/chuyen-ban", baoVe, phanQuyen("Admin", "PhucVu"), hoaDonController.chuyenBan);
router.post("/noi-bo/gop-ban", baoVe, phanQuyen("Admin", "PhucVu"), hoaDonController.gopBan);

// 2. API cho Khách hàng (Quét mã QR)
// Yêu cầu id_ban hợp lệ, không cần token (trống id_nhan_vien)
router.post("/khach-hang", hoaDonController.taoHoaDonKhachHang);
router.get("/khach-hang/ban/:id_ban", hoaDonController.layHoaDonKhachHang);

module.exports = router;
