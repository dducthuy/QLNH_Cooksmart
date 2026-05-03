const { DinhMucMonAn, MonAn, NguyenLieu } = require("../models/index");
const AppError = require("../utils/AppError");


exports.layDinhMucTheoMonAn = async (req, res, next) => {
    try {
        const { id_mon_an } = req.params;


        const monAn = await MonAn.findByPk(id_mon_an, { attributes: ["id", "ten_mon"] });
        if (!monAn) {
            return next(new AppError(`Không tìm thấy món ăn với ID: ${id_mon_an}`, 404));
        }

        const danhSach = await DinhMucMonAn.findAll({
            where: { id_mon_an },
            attributes: ["id", "luong_tieu_hao"],
            include: [
                {
                    model: NguyenLieu,
                    attributes: ["id", "ten_nguyen_lieu", "don_vi_tinh"],
                },
            ],
        });

        res.status(200).json({
            status: "success",
            mon_an: monAn,
            results: danhSach.length,
            data: danhSach,
        });
    } catch (err) {
        next(err);
    }
};


exports.layTatCaDinhMuc = async (req, res, next) => {
    try {
        const danhSach = await DinhMucMonAn.findAll({
            attributes: ["id", "luong_tieu_hao"],
            include: [
                { model: MonAn, attributes: ["id", "ten_mon"] },
                { model: NguyenLieu, attributes: ["id", "ten_nguyen_lieu", "don_vi_tinh"] },
            ],
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


exports.taoDinhMuc = async (req, res, next) => {
    try {
        const { id_mon_an, id_nguyen_lieu, luong_tieu_hao } = req.body;

        // [1] Validate bắt buộc
        if (!id_mon_an || !id_nguyen_lieu || luong_tieu_hao === undefined) {
            return next(new AppError("Vui lòng cung cấp đầy đủ: id_mon_an, id_nguyen_lieu, luong_tieu_hao!", 400));
        }
        if (isNaN(luong_tieu_hao) || Number(luong_tieu_hao) <= 0) {
            return next(new AppError("Lượng tiêu hao phải là số dương!", 400));
        }

        // [2] Kiểm tra món ăn và nguyên liệu tồn tại
        const monAn = await MonAn.findByPk(id_mon_an);
        if (!monAn) return next(new AppError(`Không tìm thấy món ăn với ID: ${id_mon_an}`, 404));

        const nguyenLieu = await NguyenLieu.findByPk(id_nguyen_lieu);
        if (!nguyenLieu) return next(new AppError(`Không tìm thấy nguyên liệu với ID: ${id_nguyen_lieu}`, 404));

        // [3] Kiểm tra đã tồn tại định mức cho cặp (món ăn + nguyên liệu) này chưa
        const daTonTai = await DinhMucMonAn.findOne({ where: { id_mon_an, id_nguyen_lieu } });
        if (daTonTai) {
            return next(
                new AppError(
                    `Định mức cho món "${monAn.ten_mon}" với nguyên liệu "${nguyenLieu.ten_nguyen_lieu}" đã tồn tại! Hãy cập nhật thay vì tạo mới.`,
                    409
                )
            );
        }

        // [4] Tạo mới
        const dinhMucMoi = await DinhMucMonAn.create({
            id_mon_an,
            id_nguyen_lieu,
            luong_tieu_hao: Number(luong_tieu_hao),
        });

        res.status(201).json({
            status: "success",
            message: `Đã thêm định mức: ${luong_tieu_hao} ${nguyenLieu.don_vi_tinh || ""} "${nguyenLieu.ten_nguyen_lieu}" cho món "${monAn.ten_mon}"!`,
            data: dinhMucMoi,
        });
    } catch (err) {
        next(err);
    }
};

// ============================================================

exports.capNhatDinhMuc = async (req, res, next) => {
    try {
        const dinhMuc = await DinhMucMonAn.findByPk(req.params.id);
        if (!dinhMuc) {
            return next(new AppError(`Không tìm thấy định mức với ID: ${req.params.id}`, 404));
        }

        const { luong_tieu_hao } = req.body;

        if (luong_tieu_hao === undefined) {
            return next(new AppError("Vui lòng cung cấp luong_tieu_hao!", 400));
        }
        if (isNaN(luong_tieu_hao) || Number(luong_tieu_hao) <= 0) {
            return next(new AppError("Lượng tiêu hao phải là số dương!", 400));
        }

        await dinhMuc.update({ luong_tieu_hao: Number(luong_tieu_hao) });

        res.status(200).json({
            status: "success",
            message: "Cập nhật định mức thành công!",
            data: dinhMuc,
        });
    } catch (err) {
        next(err);
    }
};


exports.xoaDinhMuc = async (req, res, next) => {
    try {
        const dinhMuc = await DinhMucMonAn.findByPk(req.params.id);
        if (!dinhMuc) {
            return next(new AppError(`Không tìm thấy định mức với ID: ${req.params.id}`, 404));
        }

        await dinhMuc.destroy();

        res.status(200).json({
            status: "success",
            message: "Đã xóa định mức thành công!",
        });
    } catch (err) {
        next(err);
    }
};
