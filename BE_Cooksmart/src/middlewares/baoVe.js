const { NguoiDung } = require("../models/index");
const AppError = require("../utils/AppError");
const { xacMinhToken } = require("../utils/jwt");

/**
 * Middleware BẢO VỆ ROUTE – Bắt buộc phải có JWT Token hợp lệ
 *
 * Client phải gửi token trong Header:
 *   Authorization: Bearer <token>
 *
 * Luồng:
 *  1. Lấy token từ header Authorization
 *  2. Xác minh token còn hợp lệ và chưa hết hạn
 *  3. Truy vấn lại DB xem user còn tồn tại không
 *  4. Gán req.nguoiDung để các controller sau dùng
 */
const baoVe = async (req, res, next) => {
    try {
        // [1] Lấy token từ header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return next(new AppError("Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.", 401));
        }

        // [2] Xác minh token (sẽ throw lỗi nếu hết hạn hoặc giả mạo)
        const decoded = xacMinhToken(token);

        // [3] Kiểm tra user còn tồn tại trong DB không
        const nguoiDung = await NguoiDung.findByPk(decoded.id, {
            attributes: ["id", "ten_dang_nhap", "ho_ten", "vai_tro", "trang_thai"],
        });

        if (!nguoiDung) {
            return next(new AppError("Tài khoản không còn tồn tại trong hệ thống!", 401));
        }

     
        if (!nguoiDung.trang_thai) {
            return next(new AppError("Tài khoản đã bị vô hiệu hóa!", 403));
        }

       
        req.nguoiDung = nguoiDung;
        next();
    } catch (err) {
    
        if (err.name === "TokenExpiredError") {
            return next(new AppError("Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.", 401));
        }
  
        if (err.name === "JsonWebTokenError") {
            return next(new AppError("Token không hợp lệ! Vui lòng đăng nhập lại.", 401));
        }
        next(err);
    }
};

/**
 * Middleware PHÂN QUYỀN – Chỉ cho phép các vai trò nhất định truy cập
 *
 * Dùng sau middleware baoVe:
 *   router.delete('/...', baoVe, phanQuyen('Admin'), controller)
 */
const phanQuyen = (...vaiTroChoPhep) => {
    return (req, res, next) => {
        if (!vaiTroChoPhep.includes(req.nguoiDung.vai_tro)) {
            return next(
                new AppError(
                    `Bạn không có quyền thực hiện hành động này! (Cần vai trò: ${vaiTroChoPhep.join(", ")})`,
                    403
                )
            );
        }
        next();
    };
};

module.exports = { baoVe, phanQuyen };
