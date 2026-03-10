const express = require("express");
const router = express.Router();
const nguyenLieuController = require("../controllers/nguyenLieu.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");


router.get("/", baoVe, phanQuyen("Admin"), nguyenLieuController.layTatCaNguyenLieu);


router.get("/:id", baoVe, phanQuyen("Admin"), nguyenLieuController.layNguyenLieuTheoId);


router.post("/", baoVe, phanQuyen("Admin"), nguyenLieuController.taoNguyenLieu);


router.patch("/:id", baoVe, phanQuyen("Admin"), nguyenLieuController.capNhatNguyenLieu);


router.delete("/:id", baoVe, phanQuyen("Admin"), nguyenLieuController.xoaNguyenLieu);

module.exports = router;
