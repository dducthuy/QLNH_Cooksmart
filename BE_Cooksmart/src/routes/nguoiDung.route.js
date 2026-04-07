const express = require("express");
const router = express.Router();
const nguoiDungController = require("../controllers/nguoiDung.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

// Tất cả routes đều yêu cầu đăng nhập và quyền Admin
router.use(baoVe, phanQuyen("Admin"));

// GET  /api/nguoi-dung              → Lấy danh sách (filter: ?vai_tro=&trang_thai=&q=)
router.get("/", nguoiDungController.layTatCaNguoiDung);

// GET  /api/nguoi-dung/:id          → Lấy chi tiết một người dùng
router.get("/:id", nguoiDungController.layNguoiDungTheoId);

// POST /api/nguoi-dung              → Tạo người dùng mới
router.post("/", nguoiDungController.taoNguoiDung);

// PATCH /api/nguoi-dung/:id         → Cập nhật thông tin
router.patch("/:id", nguoiDungController.capNhatNguoiDung);

// PATCH /api/nguoi-dung/:id/doi-mat-khau  → Đặt lại mật khẩu
router.patch("/:id/doi-mat-khau", nguoiDungController.doiMatKhau);

// PATCH /api/nguoi-dung/:id/trang-thai    → Bật / Tắt tài khoản
router.patch("/:id/trang-thai", nguoiDungController.doiTrangThai);

// DELETE /api/nguoi-dung/:id        → Xóa vĩnh viễn
router.delete("/:id", nguoiDungController.xoaNguoiDung);

module.exports = router;
