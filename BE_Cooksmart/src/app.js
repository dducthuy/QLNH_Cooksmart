const express = require("express");
const cors = require("cors");
const AppError = require("./utils/AppError");
const errorHandler = require("./middlewares/error");

const authRoutes       = require("./routes/auth.route");
const danhMucRoutes    = require("./routes/danhMuc.route");
const monAnRoutes      = require("./routes/monAn.route");
const banAnRoutes      = require("./routes/banAn.route");
const nguyenLieuRoutes = require("./routes/nguyenLieu.route");
const dinhMucRoutes    = require("./routes/dinhMucMonAn.route");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "🍳 Chào mừng đến với API hệ thống CookSmart!" });
});

app.use("/api/auth", authRoutes);

app.use("/api/danh-muc",         danhMucRoutes);
app.use("/api/mon-an",           monAnRoutes);
app.use("/api/ban-an",           banAnRoutes);

app.use("/api/nguyen-lieu",       nguyenLieuRoutes);
app.use("/api/dinh-muc-mon-an",  dinhMucRoutes);

app.all("/{*path}", (req, res, next) => {
    next(new AppError(`Không tìm thấy đường dẫn: ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;