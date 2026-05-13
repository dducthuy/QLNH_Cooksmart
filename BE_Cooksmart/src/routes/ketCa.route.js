const express = require("express");
const ketCaController = require("../controllers/ketCa.controller");
const { baoVe } = require("../middlewares/baoVe");

const router = express.Router();


router.use(baoVe);


router.post("/open", ketCaController.moCa);


router.get("/current", ketCaController.layThongTinCaHienTai);


router.post("/close/:id", ketCaController.chotCa);


router.post("/expense", ketCaController.themChiTieuCa);

module.exports = router;
