const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log lỗi ra terminal để Thụy dễ sửa (Debug)
  console.error('❌ Lỗi hệ thống:', err);

  // Xử lý các lỗi đặc thù của Sequelize (ví dụ: thiếu trường bắt buộc)
  if (err.name === 'SequelizeValidationError') {
    err.statusCode = 400;
    err.message = err.errors.map(el => el.message).join('; ');
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // Chỉ hiện stack trace (dòng lỗi) khi đang code (development)
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;