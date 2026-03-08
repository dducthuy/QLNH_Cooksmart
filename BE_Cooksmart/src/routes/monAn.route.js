const express = require("express");
const router = express.Router();
const monAnController = require("../controllers/monAn.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

// ── PUBLIC ──────────────────────────────────────────────────
// GET /api/mon-an
router.get("/", monAnController.layTatCaMonAn);

// GET /api/mon-an/:id
router.get("/:id", monAnController.layMonAnTheoId);

// ── ADMIN ONLY ───────────────────────────────────────────────
// POST /api/mon-an
router.post("/", baoVe, phanQuyen("Admin"), monAnController.taoMonAn);

// PATCH /api/mon-an/:id
router.patch("/:id", baoVe, phanQuyen("Admin"), monAnController.capNhatMonAn);

// DELETE /api/mon-an/:id
router.delete("/:id", baoVe, phanQuyen("Admin"), monAnController.xoaMonAn);

module.exports = router;
