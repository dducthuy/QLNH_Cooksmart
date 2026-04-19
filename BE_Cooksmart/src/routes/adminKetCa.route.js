const express = require("express");
const adminKetCaController = require("../controllers/adminKetCa.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

const router = express.Router();

// Tất cả route trong file này đều yêu cầu đăng nhập VÀ có quyền Admin
router.use(baoVe);
router.use(phanQuyen("Admin"));

// ─────────────────────────────────────────────────────────────────────────────
// QUAN TRỌNG: Route tĩnh (không có :id) PHẢI được đặt TRƯỚC route động (:id)
// để Express không nhầm "dashboard-summary" thành một :id
// ─────────────────────────────────────────────────────────────────────────────

// [4] Thống kê tổng quan dashboard
// GET /api/admin/shifts/dashboard-summary?tuNgay=2025-01-01&denNgay=2025-01-31
router.get("/dashboard-summary", adminKetCaController.layTongQuanDashboard);

// [1] Lấy lịch sử tất cả các ca
// GET /api/admin/shifts?status=closed&userId=xxx&tuNgay=2025-01-01&limit=20&offset=0
router.get("/", adminKetCaController.layLichSuCa);

// [2] Báo cáo chi tiết một ca
// GET /api/admin/shifts/:id/report
router.get("/:id/report", adminKetCaController.layBaoCaoChiTietCa);

// [3] Kiểm duyệt và ghi chú chênh lệch
// PUT /api/admin/shifts/:id/audit
// Body: { "ghi_chu_kiem_duyet": "Đã xử lý, trừ lương tháng 5" }
router.put("/:id/audit", adminKetCaController.kiemDuyetCa);

module.exports = router;
