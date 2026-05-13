const express = require("express");
const khoController = require("../controllers/kho.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

const router = express.Router();


router.use(baoVe);
router.use(phanQuyen("Admin", "NhanVien", "PhucVu", "ThuNgan"));


router.post("/nhap-hang", khoController.nhapKho);


router.post("/xuat-hang", khoController.xuatKho);


router.post("/kiem-ke", khoController.kiemKeKho);


router.get("/lich-su", khoController.layNhatKyKho);


router.get("/bao-cao-hao-hut", khoController.layBaoCaoHaoHut);


router.get("/phieu-kiem-ke", khoController.layDanhSachPhieuKiemKe);
router.get("/phieu-kiem-ke/:id", khoController.layChiTietPhieuKiemKe);


router.get("/phieu-nhap-xuat", khoController.layDanhSachPhieuNhapXuat);
router.get("/phieu-nhap-xuat/:id", khoController.layChiTietPhieuNhapXuat);

module.exports = router;
