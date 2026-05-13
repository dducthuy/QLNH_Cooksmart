const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';


  console.error('❌ Lỗi hệ thống:', err);

  
  if (err.name === 'SequelizeValidationError') {
    err.statusCode = 400;
    err.message = err.errors.map(el => el.message).join('; ');
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
