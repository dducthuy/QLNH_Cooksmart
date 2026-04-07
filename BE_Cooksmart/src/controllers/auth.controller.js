const bcrypt = require("bcryptjs");
const { NguoiDung } = require("../models/index");
const AppError = require("../utils/AppError");
const { taoToken } = require("../utils/jwt");


exports.dangNhap = async (req, res, next) => {
    try {
        const { ten_dang_nhap, mat_khau } = req.body;


        if (!ten_dang_nhap || !mat_khau) {
            return next(new AppError("Vui lòng nhập tên đăng nhập và mật khẩu!", 400));
        }


        const nguoiDung = await NguoiDung.findOne({
            where: { ten_dang_nhap },
        });

        if (!nguoiDung) {
            return next(new AppError("Tên đăng nhập hoặc mật khẩu không đúng!", 401));
        }


        const matKhauDung = await bcrypt.compare(mat_khau, nguoiDung.mat_khau);

        if (!matKhauDung) {
            return next(new AppError("Tên đăng nhập hoặc mật khẩu không đúng!", 401));
        }


        if (!nguoiDung.trang_thai) {
            return next(new AppError("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin!", 403));
        }


        const token = taoToken({
            id: nguoiDung.id,
            vai_tro: nguoiDung.vai_tro,
        });

        // Ẩn mật khẩu trước khi trả về
        nguoiDung.mat_khau = undefined;

        res.status(200).json({
            status: "success",
            message: `Chào mừng trở lại, ${nguoiDung.ho_ten || nguoiDung.ten_dang_nhap}!`,
            token,
            data: {
                id: nguoiDung.id,
                ten_dang_nhap: nguoiDung.ten_dang_nhap,
                ho_ten: nguoiDung.ho_ten,
                vai_tro: nguoiDung.vai_tro,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.    taoTaiKhoan = async (req, res, next) => {
    try {
        const { ten_dang_nhap, mat_khau, ho_ten, vai_tro } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào
        if (!ten_dang_nhap || !mat_khau || !vai_tro) {
            return next(new AppError("Vui lòng cung cấp đầy đủ tên đăng nhập, mật khẩu và vai trò!", 400));
        }

        // Kiểm tra vai trò hợp lệ
        const dsVaiTro = ["Admin", "PhucVu", "Bep"];
        if (!dsVaiTro.includes(vai_tro)) {
            return next(new AppError("Vai trò không hợp lệ!", 400));
        }

        // 2. Kiểm tra xem người dùng đã tồn tại chưa
        const nguoiDungTonTai = await NguoiDung.findOne({
            where: { ten_dang_nhap },
        });

        if (nguoiDungTonTai) {
            return next(new AppError("Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.", 400));
        }

        // 3. Tạo người dùng mới (Mật khẩu sẽ được tự động hash nhờ hook beforeCreate trong NguoiDung model)
        const nguoiDungMoi = await NguoiDung.create({
            ten_dang_nhap,
            mat_khau,
            ho_ten,
            vai_tro,
        });

        // 4. Trả về phản hồi (Ẩn mật khẩu)
        nguoiDungMoi.mat_khau = undefined;

        res.status(201).json({
            status: "success",
            message: "Tạo tài khoản thành công!",
            data: {
                id: nguoiDungMoi.id,
                ten_dang_nhap: nguoiDungMoi.ten_dang_nhap,
                ho_ten: nguoiDungMoi.ho_ten,
                vai_tro: nguoiDungMoi.vai_tro,
            },
        });
    } catch (err) {
        next(err);
    }
};
