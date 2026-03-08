const express = require("express");
const router = express.Router();
const nguyenLieuController = require("../controllers/nguyenLieu.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

// ── ADMIN ONLY (tất cả) ──────────────────────────────────────
// GET /api/nguyen-lieu
router.get("/", baoVe, phanQuyen("Admin"), nguyenLieuController.layTatCaNguyenLieu);

// GET /api/nguyen-lieu/:id
router.get("/:id", baoVe, phanQuyen("Admin"), nguyenLieuController.layNguyenLieuTheoId);

// POST /api/nguyen-lieu
router.post("/", baoVe, phanQuyen("Admin"), nguyenLieuController.taoNguyenLieu);

// PATCH /api/nguyen-lieu/:id
router.patch("/:id", baoVe, phanQuyen("Admin"), nguyenLieuController.capNhatNguyenLieu);

// DELETE /api/nguyen-lieu/:id
router.delete("/:id", baoVe, phanQuyen("Admin"), nguyenLieuController.xoaNguyenLieu);

module.exports = router;
