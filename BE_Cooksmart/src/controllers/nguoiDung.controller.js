const bcrypt = require("bcryptjs");
const { NguoiDung } = require("../models/index");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");


const SAFE_ATTRS = ["id", "ten_dang_nhap", "ho_ten", "vai_tro", "trang_thai"];
const DS_VAI_TRO = ["Admin", "ThuNgan", "PhucVu", "Bep"];


exports.layTatCaNguoiDung = async (req, res, next) => {
    try {
        const { vai_tro, trang_thai, q } = req.query;

        const where = {};


        if (vai_tro && DS_VAI_TRO.includes(vai_tro)) {
            where.vai_tro = vai_tro;
        }

        if (trang_thai !== undefined) {
            where.trang_thai = trang_thai === "true";
        }


        if (q) {
            where[Op.or] = [
                { ten_dang_nhap: { [Op.like]: `%${q}%` } },
                { ho_ten: { [Op.like]: `%${q}%` } },
            ];
        }

        const danhSach = await NguoiDung.findAll({
            where,
            attributes: SAFE_ATTRS,
            order: [["ho_ten", "ASC"]],
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





exports.layNguoiDungTheoId = async (req, res, next) => {
    try {
        const nguoiDung = await NguoiDung.findByPk(req.params.id, {
            attributes: SAFE_ATTRS,
        });

        if (!nguoiDung) {
            return next(new AppError(`Không tìm thấy người dùng với ID: ${req.params.id}`, 404));
        }

        res.status(200).json({ status: "success", data: nguoiDung });
    } catch (err) {
        next(err);
    }
};





exports.taoNguoiDung = async (req, res, next) => {
    try {
        const { ten_dang_nhap, mat_khau, ho_ten, vai_tro } = req.body;

        
        if (!ten_dang_nhap || !ten_dang_nhap.trim()) {
            return next(new AppError("Vui lòng nhập tên đăng nhập!", 400));
        }
        if (!mat_khau || mat_khau.length < 6) {
            return next(new AppError("Mật khẩu phải có ít nhất 6 ký tự!", 400));
        }
        if (!vai_tro || !DS_VAI_TRO.includes(vai_tro)) {
            return next(new AppError(`Vai trò không hợp lệ! Chỉ chấp nhận: ${DS_VAI_TRO.join(", ")}`, 400));
        }

        
        const daTonTai = await NguoiDung.findOne({ where: { ten_dang_nhap: ten_dang_nhap.trim() } });
        if (daTonTai) {
            return next(new AppError(`Tên đăng nhập "${ten_dang_nhap.trim()}" đã tồn tại!`, 409));
        }

        
        const nguoiDungMoi = await NguoiDung.create({
            ten_dang_nhap: ten_dang_nhap.trim(),
            mat_khau,
            ho_ten: ho_ten?.trim() || null,
            vai_tro,
            trang_thai: true,
        });

        res.status(201).json({
            status: "success",
            message: `Đã tạo tài khoản "${nguoiDungMoi.ten_dang_nhap}" thành công!`,
            data: {
                id: nguoiDungMoi.id,
                ten_dang_nhap: nguoiDungMoi.ten_dang_nhap,
                ho_ten: nguoiDungMoi.ho_ten,
                vai_tro: nguoiDungMoi.vai_tro,
                trang_thai: nguoiDungMoi.trang_thai,
            },
        });
    } catch (err) {
        next(err);
    }
};





exports.capNhatNguoiDung = async (req, res, next) => {
    try {
        const nguoiDung = await NguoiDung.findByPk(req.params.id);
        if (!nguoiDung) {
            return next(new AppError(`Không tìm thấy người dùng với ID: ${req.params.id}`, 404));
        }

        const { ho_ten, vai_tro, trang_thai, ten_dang_nhap } = req.body;

        
        if (vai_tro !== undefined && !DS_VAI_TRO.includes(vai_tro)) {
            return next(new AppError(`Vai trò không hợp lệ! Chỉ chấp nhận: ${DS_VAI_TRO.join(", ")}`, 400));
        }

        
        if (ten_dang_nhap && ten_dang_nhap.trim() !== nguoiDung.ten_dang_nhap) {
            const daTonTai = await NguoiDung.findOne({ where: { ten_dang_nhap: ten_dang_nhap.trim() } });
            if (daTonTai && daTonTai.id !== nguoiDung.id) {
                return next(new AppError(`Tên đăng nhập "${ten_dang_nhap.trim()}" đã tồn tại!`, 409));
            }
        }

        
        if (
            req.nguoiDung.id === nguoiDung.id &&
            vai_tro !== undefined &&
            vai_tro !== "Admin"
        ) {
            return next(new AppError("Bạn không thể tự thay đổi vai trò của chính mình!", 403));
        }

        await nguoiDung.update({
            ten_dang_nhap: ten_dang_nhap !== undefined ? ten_dang_nhap.trim() : nguoiDung.ten_dang_nhap,
            ho_ten: ho_ten !== undefined ? ho_ten.trim() : nguoiDung.ho_ten,
            vai_tro: vai_tro !== undefined ? vai_tro : nguoiDung.vai_tro,
            trang_thai: trang_thai !== undefined ? Boolean(trang_thai) : nguoiDung.trang_thai,
        });

        res.status(200).json({
            status: "success",
            message: "Cập nhật thông tin người dùng thành công!",
            data: {
                id: nguoiDung.id,
                ten_dang_nhap: nguoiDung.ten_dang_nhap,
                ho_ten: nguoiDung.ho_ten,
                vai_tro: nguoiDung.vai_tro,
                trang_thai: nguoiDung.trang_thai,
            },
        });
    } catch (err) {
        next(err);
    }
};


exports.doiMatKhau = async (req, res, next) => {
    try {
        const nguoiDung = await NguoiDung.findByPk(req.params.id);
        if (!nguoiDung) {
            return next(new AppError(`Không tìm thấy người dùng với ID: ${req.params.id}`, 404));
        }

        const { mat_khau_moi } = req.body;

        if (!mat_khau_moi || mat_khau_moi.length < 6) {
            return next(new AppError("Mật khẩu mới phải có ít nhất 6 ký tự!", 400));
        }

        
        nguoiDung.mat_khau = mat_khau_moi;
        await nguoiDung.save();

        res.status(200).json({
            status: "success",
            message: `Đã đặt lại mật khẩu cho "${nguoiDung.ten_dang_nhap}" thành công!`,
        });
    } catch (err) {
        next(err);
    }
};


exports.doiTrangThai = async (req, res, next) => {
    try {
        const nguoiDung = await NguoiDung.findByPk(req.params.id);
        if (!nguoiDung) {
            return next(new AppError(`Không tìm thấy người dùng với ID: ${req.params.id}`, 404));
        }

        
        if (req.nguoiDung.id === nguoiDung.id) {
            return next(new AppError("Bạn không thể vô hiệu hóa tài khoản của chính mình!", 403));
        }

        const trangThaiMoi = !nguoiDung.trang_thai;
        await nguoiDung.update({ trang_thai: trangThaiMoi });

        res.status(200).json({
            status: "success",
            message: trangThaiMoi
                ? `Đã kích hoạt tài khoản "${nguoiDung.ten_dang_nhap}"!`
                : `Đã vô hiệu hóa tài khoản "${nguoiDung.ten_dang_nhap}"!`,
            data: { id: nguoiDung.id, trang_thai: trangThaiMoi },
        });
    } catch (err) {
        next(err);
    }
};


exports.xoaNguoiDung = async (req, res, next) => {
    try {
        const nguoiDung = await NguoiDung.findByPk(req.params.id);
        if (!nguoiDung) {
            return next(new AppError(`Không tìm thấy người dùng với ID: ${req.params.id}`, 404));
        }

        
        if (req.nguoiDung.id === nguoiDung.id) {
            return next(new AppError("Bạn không thể xóa tài khoản của chính mình!", 403));
        }

        const ten = nguoiDung.ten_dang_nhap;
        await nguoiDung.destroy();

        res.status(200).json({
            status: "success",
            message: `Đã xóa tài khoản "${ten}" thành công!`,
        });
    } catch (err) {
        next(err);
    }
};


exports.layDanhSachOnline = async (req, res, next) => {
    try {
        const onlineUsers = req.app.get("onlineUsers");
        const onlineIds = onlineUsers ? Array.from(onlineUsers.keys()) : [];

        res.status(200).json({
            status: "success",
            data: onlineIds,
        });
    } catch (err) {
        next(err);
    }
};
