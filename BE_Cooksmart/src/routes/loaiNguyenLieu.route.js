const express = require("express");
const controller = require("../controllers/loaiNguyenLieu.controller");

const router = express.Router();

router.route("/")
    .get(controller.layTatCa)
    .post(controller.taoMoi);

router.route("/:id")
    .get(controller.layTheoId)
    .patch(controller.capNhat)
    .delete(controller.xoa);

module.exports = router;
