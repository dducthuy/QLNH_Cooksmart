const { BanAn, HoaDon } = require("../models/index");
const AppError = require("../utils/AppError");

const TRANG_THAI_HOP_LE = ["Trong", "DangPhucVu", "DatTruoc"];

// ============================================================
//  GET /api/ban-an
//  Public – Lấy tất cả bàn ăn
// ============================================================
exports.layTatCaBanAn = async (req, res, next) => {
    try {
        const danhSach = await BanAn.findAll({
            attributes: ["id", "so_ban", "vi_tri", "ma_qr_code", "trang_thai_ban"],
            order: [["so_ban", "ASC"]],
        });

        res.status(200).json({
            status: "success",
            results: danhSach.length,
            data: danhSach,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  GET /api/ban-an/:id
//  Public – Lấy chi tiết một bàn ăn
// ============================================================
exports.layBanAnTheoId = async (req, res, next) => {
    try {
        const banAn = await BanAn.findByPk(req.params.id);
        if (!banAn) {
            return next(new AppError(`Không tìm thấy bàn ăn với ID: ${req.params.id}`, 404));
        }

        res.status(200).json({ status: "success", data: banAn });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  POST /api/ban-an
//  Admin only – Thêm bàn ăn mới
// ============================================================
exports.taoBanAn = async (req, res, next) => {
    try {
        const { so_ban, vi_tri, ma_qr_code, trang_thai_ban } = req.body;

        if (!so_ban || !so_ban.trim()) {
            return next(new AppError("Vui lòng nhập số bàn!", 400));
        }

        // Kiểm tra trang thái hợp lệ
        if (trang_thai_ban && !TRANG_THAI_HOP_LE.includes(trang_thai_ban)) {
            return next(new AppError(`Trạng thái bàn không hợp lệ! Chỉ chấp nhận: ${TRANG_THAI_HOP_LE.join(", ")}`, 400));
        }

        // Kiểm tra trùng số bàn
        const daTonTai = await BanAn.findOne({ where: { so_ban: so_ban.trim() } });
        if (daTonTai) {
            return next(new AppError(`Bàn số "${so_ban.trim()}" đã tồn tại!`, 409));
        }

        const banAnMoi = await BanAn.create({
            so_ban:       so_ban.trim(),
            vi_tri:       vi_tri       || null,
            ma_qr_code:   ma_qr_code   || null,
            trang_thai_ban: trang_thai_ban || "Trong",
        });

        res.status(201).json({
            status: "success",
            message: `Đã thêm bàn "${banAnMoi.so_ban}" thành công!`,
            data: banAnMoi,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  PATCH /api/ban-an/:id
//  Admin only – Cập nhật thông tin bàn ăn
// ============================================================
exports.capNhatBanAn = async (req, res, next) => {
    try {
        const banAn = await BanAn.findByPk(req.params.id);
        if (!banAn) {
            return next(new AppError(`Không tìm thấy bàn ăn với ID: ${req.params.id}`, 404));
        }

        const { so_ban, vi_tri, ma_qr_code, trang_thai_ban } = req.body;

        // Kiểm tra trạng thái hợp lệ
        if (trang_thai_ban && !TRANG_THAI_HOP_LE.includes(trang_thai_ban)) {
            return next(new AppError(`Trạng thái bàn không hợp lệ! Chỉ chấp nhận: ${TRANG_THAI_HOP_LE.join(", ")}`, 400));
        }

        // Kiểm tra trùng số bàn với bàn KHÁC
        if (so_ban && so_ban.trim() !== banAn.so_ban) {
            const daTonTai = await BanAn.findOne({ where: { so_ban: so_ban.trim() } });
            if (daTonTai && daTonTai.id !== banAn.id) {
                return next(new AppError(`Bàn số "${so_ban.trim()}" đã tồn tại!`, 409));
            }
        }

        await banAn.update({
            so_ban:         so_ban         !== undefined ? so_ban.trim()    : banAn.so_ban,
            vi_tri:         vi_tri         !== undefined ? vi_tri           : banAn.vi_tri,
            ma_qr_code:     ma_qr_code     !== undefined ? ma_qr_code       : banAn.ma_qr_code,
            trang_thai_ban: trang_thai_ban !== undefined ? trang_thai_ban   : banAn.trang_thai_ban,
        });

        res.status(200).json({
            status: "success",
            message: "Cập nhật bàn ăn thành công!",
            data: banAn,
        });
    } catch (err) {
        next(err);
    }
};


exports.xoaBanAn = async (req, res, next) => {
    try {
        const banAn = await BanAn.findByPk(req.params.id);
        if (!banAn) {
            return next(new AppError(`Không tìm thấy bàn ăn với ID: ${req.params.id}`, 404));
        }

        // Chặn xóa bàn đang phục vụ
        if (banAn.trang_thai_ban === "DangPhucVu") {
            return next(new AppError(`Không thể xóa bàn "${banAn.so_ban}" đang có khách!`, 400));
        }

        const so = banAn.so_ban;
        await banAn.destroy();

        res.status(200).json({
            status: "success",
            message: `Đã xóa bàn "${so}" thành công!`,
        });
    } catch (err) {
        next(err);
    }
};
