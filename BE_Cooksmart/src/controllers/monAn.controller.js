const { MonAn, DanhMuc } = require("../models/index");
const AppError = require("../utils/AppError");

// ============================================================
//  GET /api/mon-an
//  Public – Lấy tất cả món ăn (kèm tên danh mục)
// ============================================================
exports.layTatCaMonAn = async (req, res, next) => {
    try {
        const danhSach = await MonAn.findAll({
            attributes: ["id", "ten_mon", "gia_tien", "hinh_anh_mon", "mo_ta_ai", "con_hang"],
            include: [
                {
                    model: DanhMuc,
                    attributes: ["id", "ten_danh_muc"],
                },
            ],
            order: [["ten_mon", "ASC"]],
        });

        res.status(200).json({
            status: "success",
            results: danhSach.length,
            data: danhSach,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  GET /api/mon-an/:id
//  Public – Lấy chi tiết một món ăn
// ============================================================
exports.layMonAnTheoId = async (req, res, next) => {
    try {
        const monAn = await MonAn.findByPk(req.params.id, {
            attributes: ["id", "ten_mon", "gia_tien", "hinh_anh_mon", "mo_ta_ai", "con_hang"],
            include: [{ model: DanhMuc, attributes: ["id", "ten_danh_muc"] }],
        });

        if (!monAn) {
            return next(new AppError(`Không tìm thấy món ăn với ID: ${req.params.id}`, 404));
        }

        res.status(200).json({ status: "success", data: monAn });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  POST /api/mon-an
//  Admin only – Tạo món ăn mới
// ============================================================
exports.taoMonAn = async (req, res, next) => {
    try {
        const { ten_mon, gia_tien, id_danh_muc, hinh_anh_mon, mo_ta_ai } = req.body;

        // [1] Validate bắt buộc
        if (!ten_mon || !ten_mon.trim()) {
            return next(new AppError("Vui lòng nhập tên món ăn!", 400));
        }
        if (gia_tien === undefined || gia_tien === null || isNaN(gia_tien) || Number(gia_tien) < 0) {
            return next(new AppError("Giá tiền không hợp lệ!", 400));
        }

        // [2] Kiểm tra danh mục tồn tại (nếu truyền vào)
        if (id_danh_muc) {
            const danhMuc = await DanhMuc.findByPk(id_danh_muc);
            if (!danhMuc) {
                return next(new AppError(`Không tìm thấy danh mục với ID: ${id_danh_muc}`, 404));
            }
        }

        // [3] Kiểm tra trùng tên
        const daTonTai = await MonAn.findOne({ where: { ten_mon: ten_mon.trim() } });
        if (daTonTai) {
            return next(new AppError(`Món ăn "${ten_mon.trim()}" đã tồn tại!`, 409));
        }

        // [4] Tạo mới
        const monAnMoi = await MonAn.create({
            ten_mon: ten_mon.trim(),
            gia_tien: Number(gia_tien),
            id_danh_muc: id_danh_muc || null,
            hinh_anh_mon: hinh_anh_mon || null,
            mo_ta_ai: mo_ta_ai || null,
        });

        res.status(201).json({
            status: "success",
            message: `Đã thêm món "${monAnMoi.ten_mon}" thành công!`,
            data: monAnMoi,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  PATCH /api/mon-an/:id
//  Admin only – Cập nhật thông tin món ăn
// ============================================================
exports.capNhatMonAn = async (req, res, next) => {
    try {
        const monAn = await MonAn.findByPk(req.params.id);
        if (!monAn) {
            return next(new AppError(`Không tìm thấy món ăn với ID: ${req.params.id}`, 404));
        }

        const { ten_mon, gia_tien, id_danh_muc, hinh_anh_mon, mo_ta_ai, con_hang } = req.body;

        // Kiểm tra danh mục nếu có thay đổi
        if (id_danh_muc) {
            const danhMuc = await DanhMuc.findByPk(id_danh_muc);
            if (!danhMuc) {
                return next(new AppError(`Không tìm thấy danh mục với ID: ${id_danh_muc}`, 404));
            }
        }

        // Kiểm tra trùng tên với món KHÁC
        if (ten_mon && ten_mon.trim() !== monAn.ten_mon) {
            const daTonTai = await MonAn.findOne({ where: { ten_mon: ten_mon.trim() } });
            if (daTonTai && daTonTai.id !== monAn.id) {
                return next(new AppError(`Món ăn "${ten_mon.trim()}" đã tồn tại!`, 409));
            }
        }

        // Chỉ cập nhật các field được gửi lên
        await monAn.update({
            ten_mon:      ten_mon      !== undefined ? ten_mon.trim()     : monAn.ten_mon,
            gia_tien:     gia_tien     !== undefined ? Number(gia_tien)   : monAn.gia_tien,
            id_danh_muc:  id_danh_muc  !== undefined ? id_danh_muc        : monAn.id_danh_muc,
            hinh_anh_mon: hinh_anh_mon !== undefined ? hinh_anh_mon       : monAn.hinh_anh_mon,
            mo_ta_ai:     mo_ta_ai     !== undefined ? mo_ta_ai           : monAn.mo_ta_ai,
            con_hang:     con_hang     !== undefined ? con_hang           : monAn.con_hang,
        });

        res.status(200).json({
            status: "success",
            message: "Cập nhật món ăn thành công!",
            data: monAn,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================
//  DELETE /api/mon-an/:id
//  Admin only – Xóa món ăn
// ============================================================
exports.xoaMonAn = async (req, res, next) => {
    try {
        const monAn = await MonAn.findByPk(req.params.id);
        if (!monAn) {
            return next(new AppError(`Không tìm thấy món ăn với ID: ${req.params.id}`, 404));
        }

        const ten = monAn.ten_mon;
        await monAn.destroy();

        res.status(200).json({
            status: "success",
            message: `Đã xóa món ăn "${ten}" thành công!`,
        });
    } catch (err) {
        next(err);
    }
};
