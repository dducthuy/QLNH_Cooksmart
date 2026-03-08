/**
 * AppError - Custom Error class để phân biệt lỗi nghiệp vụ với lỗi hệ thống
 * - isOperational: true  → lỗi có thể dự đoán trước (do người dùng / logic)
 * - isOperational: false → lỗi bug không mong đợi (crash)
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
