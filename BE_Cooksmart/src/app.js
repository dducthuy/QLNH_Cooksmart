const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const AppError = require("./utils/AppError");
const errorHandler = require("./middlewares/error");

const authRoutes       = require("./routes/auth.route");
const danhMucRoutes    = require("./routes/danhMuc.route");
const monAnRoutes      = require("./routes/monAn.route");
const banAnRoutes      = require("./routes/banAn.route");
const nguyenLieuRoutes = require("./routes/nguyenLieu.route");
const loaiNguyenLieuRoutes = require("./routes/loaiNguyenLieu.route");
const dinhMucRoutes    = require("./routes/dinhMucMonAn.route");
const uploadRoutes     = require("./routes/upload.routes");
const nguoiDungRoutes  = require("./routes/nguoiDung.route");
const khoRoutes        = require("./routes/kho.route");
const hoaDonRoutes     = require("./routes/hoaDon.route");
const ketCaRoutes      = require("./routes/ketCa.route");
const adminKetCaRoutes = require("./routes/adminKetCa.route");
const dashboardRoutes  = require("./routes/dashboard.routes");
const comboRoutes      = require("./routes/combo.route");
const zalopayRoutes    = require("./routes/zalopay.route");
const khuyenMaiRoutes  = require("./routes/khuyenMai.route");

const app = express();

app.use(cors());
app.use(express.json());


app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({ message: "🍳 Chào mừng đến với API hệ thống CookSmart!" });
});

app.use("/api/auth",             authRoutes);

app.use("/api/danh-muc",         danhMucRoutes);
app.use("/api/mon-an",           monAnRoutes);
app.use("/api/ban-an",           banAnRoutes);
app.use("/api/nguoi-dung",       nguoiDungRoutes);

app.use("/api/nguyen-lieu",       nguyenLieuRoutes);
app.use("/api/loai-nguyen-lieu", loaiNguyenLieuRoutes);
app.use("/api/dinh-muc-mon-an",  dinhMucRoutes);
app.use("/api/upload",           uploadRoutes);
app.use("/api/kho",              khoRoutes);
app.use("/api/hoa-don",          hoaDonRoutes);
app.use("/api/shifts",           ketCaRoutes);
app.use("/api/admin/shifts",     adminKetCaRoutes);
app.use("/api/dashboard",        dashboardRoutes);
app.use("/api/combo",            comboRoutes);
app.use("/api/zalopay",          zalopayRoutes);
app.use("/api/khuyen-mai",       khuyenMaiRoutes);

app.use((req, res, next) => {
    next(new AppError(`Không tìm thấy đường dẫn: ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;
