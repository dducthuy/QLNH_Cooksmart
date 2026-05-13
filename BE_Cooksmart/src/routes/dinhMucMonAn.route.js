const express = require("express");
const router = express.Router();
const dinhMucController = require("../controllers/dinhMucMonAn.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");


router.get("/", baoVe, phanQuyen("Admin"), dinhMucController.layTatCaDinhMuc);


router.get("/mon-an/:id_mon_an", baoVe, phanQuyen("Admin"), dinhMucController.layDinhMucTheoMonAn);


router.post("/", baoVe, phanQuyen("Admin"), dinhMucController.taoDinhMuc);


router.patch("/:id", baoVe, phanQuyen("Admin"), dinhMucController.capNhatDinhMuc);


router.delete("/:id", baoVe, phanQuyen("Admin"), dinhMucController.xoaDinhMuc);

module.exports = router;
