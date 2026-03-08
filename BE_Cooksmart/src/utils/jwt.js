const jwt = require("jsonwebtoken");

/**
 * Tạo JWT Token từ payload (id, vai_tro)
 */
const taoToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

/**
 * Xác minh JWT Token, trả về payload hoặc throw lỗi nếu không hợp lệ
 */
const xacMinhToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { taoToken, xacMinhToken };
