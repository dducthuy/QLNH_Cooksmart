const express = require("express");
const router = express.Router();
const khuyenMaiController = require("../controllers/khuyenMai.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

router.get("/", khuyenMaiController.layTatCaKhuyenMai);
router.post("/", baoVe, phanQuyen("Admin"), khuyenMaiController.taoKhuyenMai);
router.patch("/:id", baoVe, phanQuyen("Admin"), khuyenMaiController.capNhatKhuyenMai);
router.delete("/:id", baoVe, phanQuyen("Admin"), khuyenMaiController.xoaKhuyenMai);

module.exports = router;
