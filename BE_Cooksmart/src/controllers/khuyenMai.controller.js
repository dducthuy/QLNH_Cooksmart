const KhuyenMai = require("../models/KhuyenMai");
const AppError = require("../utils/AppError");

exports.layTatCaKhuyenMai = async (req, res, next) => {
    try {
        const danhSachKM = await KhuyenMai.findAll({
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({
            status: "success",
            results: danhSachKM.length,
            data: danhSachKM,
        });
    } catch (error) {
        next(error);
    }
};

exports.taoKhuyenMai = async (req, res, next) => {
    try {
        const { ma_km, ten_km, loai_km, gia_tri_km, gia_tri_dh_toi_thieu, ngay_bat_dau, ngay_ket_thuc, trang_thai, so_luong } = req.body;

        const khuyenMaiMoi = await KhuyenMai.create({
            ma_km: ma_km.toUpperCase(),
            ten_km,
            loai_km,
            gia_tri_km,
            gia_tri_dh_toi_thieu: gia_tri_dh_toi_thieu || 0,
            ngay_bat_dau,
            ngay_ket_thuc,
            trang_thai: trang_thai !== undefined ? trang_thai : true,
            so_luong: so_luong || 0,
        });

        res.status(201).json({
            status: "success",
            message: "Tạo khuyến mãi thành công",
            data: khuyenMaiMoi,
        });
    } catch (error) {
        next(error);
    }
};

exports.capNhatKhuyenMai = async (req, res, next) => {
    try {
        const { id } = req.params;
        const khuyenMai = await KhuyenMai.findByPk(id);

        if (!khuyenMai) {
            return next(new AppError("Không tìm thấy khuyến mãi", 404));
        }

        if (req.body.ma_km) {
            req.body.ma_km = req.body.ma_km.toUpperCase();
        }

        await khuyenMai.update(req.body);

        res.status(200).json({
            status: "success",
            message: "Cập nhật khuyến mãi thành công",
            data: khuyenMai,
        });
    } catch (error) {
        next(error);
    }
};

exports.xoaKhuyenMai = async (req, res, next) => {
    try {
        const { id } = req.params;
        const khuyenMai = await KhuyenMai.findByPk(id);

        if (!khuyenMai) {
            return next(new AppError("Không tìm thấy khuyến mãi", 404));
        }

        await khuyenMai.destroy();

        res.status(200).json({
            status: "success",
            message: "Xóa khuyến mãi thành công",
        });
    } catch (error) {
        next(error);
    }
};
