const { NguyenLieu, DinhMucMonAn } = require("../models/index");
const AppError = require("../utils/AppError");

// ============================================================
//  GET /api/nguyen-lieu
//  Admin – Lấy tất cả nguyên liệu
// ============================================================
exports.layTatCaNguyenLieu = async (req, res, next) => {
    try {
        const danhSach = await NguyenLieu.findAll({
            attributes: ["id", "ten_nguyen_lieu", "don_vi_tinh", "so_luong_kho_tong", "so_luong_tai_bep", "gia_nhap_gan_nhat"],
            order: [["ten_nguyen_lieu", "ASC"]],
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
//  GET /api/nguyen-lieu/:id
//  Admin – Lấy chi tiết một nguyên liệu
// ============================================================
exports.layNguyenLieuTheoId = async (req, res, next) => {
    try {
        const nguyenLieu = await NguyenLieu.findByPk(req.params.id);
        if (!nguyenLieu) {
            return next(new AppError(`Không tìm thấy nguyên liệu với ID: ${req.params.id}`, 404));
        }

        res.status(200).json({ status: "success", data: nguyenLieu });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  POST /api/nguyen-lieu
//  Admin only – Thêm nguyên liệu mới
// ============================================================
exports.taoNguyenLieu = async (req, res, next) => {
    try {
        const { ten_nguyen_lieu, don_vi_tinh, so_luong_kho_tong, so_luong_tai_bep, gia_nhap_gan_nhat } = req.body;

        if (!ten_nguyen_lieu || !ten_nguyen_lieu.trim()) {
            return next(new AppError("Vui lòng nhập tên nguyên liệu!", 400));
        }

        // Kiểm tra trùng tên
        const daTonTai = await NguyenLieu.findOne({ where: { ten_nguyen_lieu: ten_nguyen_lieu.trim() } });
        if (daTonTai) {
            return next(new AppError(`Nguyên liệu "${ten_nguyen_lieu.trim()}" đã tồn tại!`, 409));
        }

        const nguyenLieuMoi = await NguyenLieu.create({
            ten_nguyen_lieu:    ten_nguyen_lieu.trim(),
            don_vi_tinh:        don_vi_tinh        || null,
            so_luong_kho_tong:  so_luong_kho_tong  !== undefined ? Number(so_luong_kho_tong)  : 0,
            so_luong_tai_bep:   so_luong_tai_bep   !== undefined ? Number(so_luong_tai_bep)   : 0,
            gia_nhap_gan_nhat:  gia_nhap_gan_nhat  !== undefined ? Number(gia_nhap_gan_nhat)  : 0,
        });

        res.status(201).json({
            status: "success",
            message: `Đã thêm nguyên liệu "${nguyenLieuMoi.ten_nguyen_lieu}" thành công!`,
            data: nguyenLieuMoi,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  PATCH /api/nguyen-lieu/:id
//  Admin only – Cập nhật nguyên liệu
// ============================================================
exports.capNhatNguyenLieu = async (req, res, next) => {
    try {
        const nguyenLieu = await NguyenLieu.findByPk(req.params.id);
        if (!nguyenLieu) {
            return next(new AppError(`Không tìm thấy nguyên liệu với ID: ${req.params.id}`, 404));
        }

        const { ten_nguyen_lieu, don_vi_tinh, so_luong_kho_tong, so_luong_tai_bep, gia_nhap_gan_nhat } = req.body;

        // Kiểm tra trùng tên với nguyên liệu KHÁC
        if (ten_nguyen_lieu && ten_nguyen_lieu.trim() !== nguyenLieu.ten_nguyen_lieu) {
            const daTonTai = await NguyenLieu.findOne({ where: { ten_nguyen_lieu: ten_nguyen_lieu.trim() } });
            if (daTonTai && daTonTai.id !== nguyenLieu.id) {
                return next(new AppError(`Nguyên liệu "${ten_nguyen_lieu.trim()}" đã tồn tại!`, 409));
            }
        }

        await nguyenLieu.update({
            ten_nguyen_lieu:   ten_nguyen_lieu   !== undefined ? ten_nguyen_lieu.trim()           : nguyenLieu.ten_nguyen_lieu,
            don_vi_tinh:       don_vi_tinh       !== undefined ? don_vi_tinh                      : nguyenLieu.don_vi_tinh,
            so_luong_kho_tong: so_luong_kho_tong !== undefined ? Number(so_luong_kho_tong)        : nguyenLieu.so_luong_kho_tong,
            so_luong_tai_bep:  so_luong_tai_bep  !== undefined ? Number(so_luong_tai_bep)         : nguyenLieu.so_luong_tai_bep,
            gia_nhap_gan_nhat: gia_nhap_gan_nhat !== undefined ? Number(gia_nhap_gan_nhat)        : nguyenLieu.gia_nhap_gan_nhat,
        });

        res.status(200).json({
            status: "success",
            message: "Cập nhật nguyên liệu thành công!",
            data: nguyenLieu,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  DELETE /api/nguyen-lieu/:id
//  Admin only – Xóa nguyên liệu
//  ⚠️ Chặn xóa nếu nguyên liệu đang dùng trong định mức món ăn
// ============================================================
exports.xoaNguyenLieu = async (req, res, next) => {
    try {
        const nguyenLieu = await NguyenLieu.findByPk(req.params.id);
        if (!nguyenLieu) {
            return next(new AppError(`Không tìm thấy nguyên liệu với ID: ${req.params.id}`, 404));
        }

        // Kiểm tra còn liên kết định mức không
        const soDinhMuc = await DinhMucMonAn.count({ where: { id_nguyen_lieu: req.params.id } });
        if (soDinhMuc > 0) {
            return next(
                new AppError(
                    `Không thể xóa nguyên liệu "${nguyenLieu.ten_nguyen_lieu}" vì đang được dùng trong ${soDinhMuc} định mức món ăn. Vui lòng xóa định mức trước!`,
                    400
                )
            );
        }

        const ten = nguyenLieu.ten_nguyen_lieu;
        await nguyenLieu.destroy();

        res.status(200).json({
            status: "success",
            message: `Đã xóa nguyên liệu "${ten}" thành công!`,
        });
    } catch (err) {
        next(err);
    }
};
