const express = require("express");
const router = express.Router();
const comboController = require("../controllers/combo.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");


router.get("/public", comboController.layTatCaComboPublic);


router.get("/", baoVe, phanQuyen("Admin", "PhucVu", "ThuNgan", "Bep"), comboController.layTatCaCombo);
router.get("/:id", baoVe, phanQuyen("Admin", "PhucVu", "ThuNgan", "Bep"), comboController.layChiTietCombo);


router.post("/", baoVe, phanQuyen("Admin"), comboController.taoCombo);
router.put("/:id", baoVe, phanQuyen("Admin"), comboController.capNhatCombo);
router.delete("/:id", baoVe, phanQuyen("Admin"), comboController.xoaCombo);

module.exports = router;
