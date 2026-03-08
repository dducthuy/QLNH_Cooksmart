const express = require("express");
const router = express.Router();
const danhMucController = require("../controllers/danhMuc.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");


router.get("/", danhMucController.layTatCaDanhMuc);


router.get("/:id", danhMucController.layDanhMucTheoId);



router.post("/", baoVe, phanQuyen("Admin"), danhMucController.taoDanhMuc);


router.patch("/:id", baoVe, phanQuyen("Admin"), danhMucController.capNhatDanhMuc);


router.delete("/:id", baoVe, phanQuyen("Admin"), danhMucController.xoaDanhMuc);

module.exports = router;
