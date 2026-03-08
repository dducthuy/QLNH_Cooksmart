const express = require("express");
const cors = require("cors");
const AppError = require("./utils/AppError");
const errorHandler = require("./middlewares/error");

// ===================== ROUTES IMPORTS =====================
const authRoutes = require("./routes/auth.route");

const app = express();

app.use(cors());          // Cho phép Next.js / Frontend gọi API
app.use(express.json());  // Đọc body JSON từ request

// ===================== ROUTES =====================
// Route kiểm tra server còn sống
app.get("/", (req, res) => {
    res.json({ message: "🍳 Chào mừng đến với API hệ thống CookSmart!" });
});

// Auth – Đăng nhập (không cần token)
app.use("/api/auth", authRoutes);

// (Thêm các router khác vào đây)
// app.use("/api/ban-an", baoVe, banAnRoutes);
// app.use("/api/mon-an", monAnRoutes);

// ===================== 404 HANDLER =====================
// Express 5 không chấp nhận '*' – phải dùng '/{*path}'
app.all("/{*path}", (req, res, next) => {
    next(new AppError(`Không tìm thấy đường dẫn: ${req.originalUrl}`, 404));
});

// ===================== GLOBAL ERROR HANDLER =====================
app.use(errorHandler);

module.exports = app;