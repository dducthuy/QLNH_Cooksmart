const express = require("express");
const router = express.Router();
const nguoiDungController = require("../controllers/nguoiDung.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");


router.use(baoVe, phanQuyen("Admin"));


router.get("/", nguoiDungController.layTatCaNguoiDung);


router.get("/online", nguoiDungController.layDanhSachOnline);


router.get("/:id", nguoiDungController.layNguoiDungTheoId);


router.post("/", nguoiDungController.taoNguoiDung);


router.patch("/:id", nguoiDungController.capNhatNguoiDung);


router.patch("/:id/doi-mat-khau", nguoiDungController.doiMatKhau);


router.patch("/:id/trang-thai", nguoiDungController.doiTrangThai);


router.delete("/:id", nguoiDungController.xoaNguoiDung);

module.exports = router;
