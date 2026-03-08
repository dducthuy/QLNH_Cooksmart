const express = require("express");
const router = express.Router();
const banAnController = require("../controllers/banAn.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

// ── PUBLIC ──────────────────────────────────────────────────
// GET /api/ban-an  (app khách quét QR cần biết danh sách bàn)
router.get("/", banAnController.layTatCaBanAn);

// GET /api/ban-an/:id
router.get("/:id", banAnController.layBanAnTheoId);


router.post("/", baoVe, phanQuyen("Admin"), banAnController.taoBanAn);


router.patch("/:id", baoVe, phanQuyen("Admin"), banAnController.capNhatBanAn);


router.delete("/:id", baoVe, phanQuyen("Admin"), banAnController.xoaBanAn);

module.exports = router;
