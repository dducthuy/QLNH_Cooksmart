const { DanhMuc, MonAn } = require("../models/index");
const AppError = require("../utils/AppError");

// ============================================================
//  GET /api/danh-muc
//  Public – Lấy tất cả danh mục
// ============================================================
exports.layTatCaDanhMuc = async (req, res, next) => {
    try {
        const danhSachDanhMuc = await DanhMuc.findAll({
            attributes: ["id", "ten_danh_muc"],
            order: [["ten_danh_muc", "ASC"]],
        });

        res.status(200).json({
            status: "success",
            results: danhSachDanhMuc.length,
            data: danhSachDanhMuc,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  GET /api/danh-muc/:id
//  Public – Lấy chi tiết một danh mục theo ID
// ============================================================
exports.layDanhMucTheoId = async (req, res, next) => {
    try {
        const danhMuc = await DanhMuc.findByPk(req.params.id, {
            attributes: ["id", "ten_danh_muc"],
        });

        if (!danhMuc) {
            return next(new AppError(`Không tìm thấy danh mục với ID: ${req.params.id}`, 404));
        }

        res.status(200).json({
            status: "success",
            data: danhMuc,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  POST /api/danh-muc
//  Admin only – Tạo danh mục mới
// ============================================================
exports.taoDanhMuc = async (req, res, next) => {
    try {
        const { ten_danh_muc } = req.body;

        // [1] Kiểm tra đầu vào
        if (!ten_danh_muc || !ten_danh_muc.trim()) {
            return next(new AppError("Vui lòng nhập tên danh mục!", 400));
        }

        // [2] Kiểm tra trùng tên
        const daTonTai = await DanhMuc.findOne({
            where: { ten_danh_muc: ten_danh_muc.trim() },
        });

        if (daTonTai) {
            return next(new AppError(`Danh mục "${ten_danh_muc.trim()}" đã tồn tại!`, 409));
        }

        // [3] Tạo mới
        const danhMucMoi = await DanhMuc.create({
            ten_danh_muc: ten_danh_muc.trim(),
        });

        res.status(201).json({
            status: "success",
            message: `Đã tạo danh mục "${danhMucMoi.ten_danh_muc}" thành công!`,
            data: danhMucMoi,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  PATCH /api/danh-muc/:id
//  Admin only – Cập nhật tên danh mục
// ============================================================
exports.capNhatDanhMuc = async (req, res, next) => {
    try {
        const { ten_danh_muc } = req.body;

        // [1] Kiểm tra đầu vào
        if (!ten_danh_muc || !ten_danh_muc.trim()) {
            return next(new AppError("Vui lòng nhập tên danh mục mới!", 400));
        }

        // [2] Tìm danh mục cần sửa
        const danhMuc = await DanhMuc.findByPk(req.params.id);

        if (!danhMuc) {
            return next(new AppError(`Không tìm thấy danh mục với ID: ${req.params.id}`, 404));
        }

        // [3] Kiểm tra trùng tên với danh mục KHÁC
        const daTonTai = await DanhMuc.findOne({
            where: { ten_danh_muc: ten_danh_muc.trim() },
        });

        if (daTonTai && daTonTai.id !== danhMuc.id) {
            return next(new AppError(`Danh mục "${ten_danh_muc.trim()}" đã tồn tại!`, 409));
        }

        // [4] Cập nhật
        await danhMuc.update({ ten_danh_muc: ten_danh_muc.trim() });

        res.status(200).json({
            status: "success",
            message: `Đã cập nhật danh mục thành công!`,
            data: danhMuc,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  DELETE /api/danh-muc/:id
//  Admin only – Xóa danh mục
//  ⚠️ Nếu còn món ăn thuộc danh mục → từ chối xóa (tránh mồ côi dữ liệu)
// ============================================================
exports.xoaDanhMuc = async (req, res, next) => {
    try {
        // [1] Tìm danh mục
        const danhMuc = await DanhMuc.findByPk(req.params.id);

        if (!danhMuc) {
            return next(new AppError(`Không tìm thấy danh mục với ID: ${req.params.id}`, 404));
        }

        // [2] Kiểm tra còn món ăn thuộc danh mục này không
        const soMonAn = await MonAn.count({
            where: { id_danh_muc: req.params.id },
        });

        if (soMonAn > 0) {
            return next(
                new AppError(
                    `Không thể xóa danh mục "${danhMuc.ten_danh_muc}" vì còn ${soMonAn} món ăn đang thuộc danh mục này. Vui lòng chuyển hoặc xóa các món ăn trước!`,
                    400
                )
            );
        }

        // [3] Xóa
        const tenDanhMuc = danhMuc.ten_danh_muc;
        await danhMuc.destroy();

        res.status(200).json({
            status: "success",
            message: `Đã xóa danh mục "${tenDanhMuc}" thành công!`,
        });
    } catch (err) {
        next(err);
    }
};
