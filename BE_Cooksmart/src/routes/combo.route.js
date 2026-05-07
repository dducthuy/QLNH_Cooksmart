const express = require("express");
const router = express.Router();
const comboController = require("../controllers/combo.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

// Public (khách hàng QR) — không cần đăng nhập
router.get("/public", comboController.layTatCaComboPublic);

// Nhân viên/Admin có token
router.get("/", baoVe, phanQuyen("Admin", "PhucVu", "ThuNgan", "Bep"), comboController.layTatCaCombo);
router.get("/:id", baoVe, phanQuyen("Admin", "PhucVu", "ThuNgan", "Bep"), comboController.layChiTietCombo);

// Admin only — quản lý combo
router.post("/", baoVe, phanQuyen("Admin"), comboController.taoCombo);
router.put("/:id", baoVe, phanQuyen("Admin"), comboController.capNhatCombo);
router.delete("/:id", baoVe, phanQuyen("Admin"), comboController.xoaCombo);

module.exports = router;
