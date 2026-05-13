const express = require("express");
const router = express.Router();
const monAnController = require("../controllers/monAn.controller");
const { baoVe, phanQuyen } = require("../middlewares/baoVe");



router.get("/", monAnController.layTatCaMonAn);


router.get("/:id", monAnController.layMonAnTheoId);



router.post("/", baoVe, phanQuyen("Admin"), monAnController.taoMonAn);


router.patch("/:id", baoVe, phanQuyen("Admin"), monAnController.capNhatMonAn);


router.delete("/:id", baoVe, phanQuyen("Admin"), monAnController.xoaMonAn);

module.exports = router;
