const bcrypt = require("bcryptjs");
const { NguoiDung } = require("../models/index");
const AppError = require("../utils/AppError");
const { taoToken } = require("../utils/jwt");

/**
 * POST /api/auth/dang-nhap
 * Body: { ten_dang_nhap, mat_khau }
 *
 * Luồng:
 *  1. Kiểm tra body có đủ thông tin không
 *  2. Tìm user theo ten_dang_nhap trong DB
 *  3. So sánh mat_khau với hash đã lưu
 *  4. Kiểm tra tài khoản còn hoạt động không (trang_thai)
 *  5. Tạo JWT Token và trả về Client
 */
exports.dangNhap = async (req, res, next) => {
    try {
        const { ten_dang_nhap, mat_khau } = req.body;

        // [1] Kiểm tra đầu vào
        if (!ten_dang_nhap || !mat_khau) {
            return next(new AppError("Vui lòng nhập tên đăng nhập và mật khẩu!", 400));
        }

        // [2] Tìm user theo tên đăng nhập
        const nguoiDung = await NguoiDung.findOne({
            where: { ten_dang_nhap },
        });

        if (!nguoiDung) {
            return next(new AppError("Tên đăng nhập hoặc mật khẩu không đúng!", 401));
        }

        // [3] So sánh mật khẩu người dùng nhập với hash trong DB
        const matKhauDung = await bcrypt.compare(mat_khau, nguoiDung.mat_khau);

        if (!matKhauDung) {
            return next(new AppError("Tên đăng nhập hoặc mật khẩu không đúng!", 401));
        }

        // [4] Kiểm tra tài khoản còn hoạt động không
        if (!nguoiDung.trang_thai) {
            return next(new AppError("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin!", 403));
        }

        // [5] Tạo JWT Token
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
