const express = require("express");
const adminKetCaController = require("../controllers/adminKetCa.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");

const router = express.Router();


router.use(baoVe);
router.use(phanQuyen("Admin"));








router.get("/dashboard-summary", adminKetCaController.layTongQuanDashboard);



router.get("/", adminKetCaController.layLichSuCa);



router.get("/:id/report", adminKetCaController.layBaoCaoChiTietCa);




router.put("/:id/audit", adminKetCaController.kiemDuyetCa);

module.exports = router;
