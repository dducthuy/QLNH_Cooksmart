const { LoaiNguyenLieu, NguyenLieu } = require("../models/index");
const AppError = require("../utils/AppError");

exports.layTatCa = async (req, res, next) => {
    try {
        const danhSach = await LoaiNguyenLieu.findAll({
            order: [["ten_loai", "ASC"]],
        });
        res.status(200).json({ status: "success", results: danhSach.length, data: danhSach });
    } catch (err) {
        next(err);
    }
};

exports.layTheoId = async (req, res, next) => {
    try {
        const loai = await LoaiNguyenLieu.findByPk(req.params.id);
        if (!loai) return next(new AppError(`Không tìm thấy loại nguyên liệu với ID: ${req.params.id}`, 404));
        res.status(200).json({ status: "success", data: loai });
    } catch (err) {
        next(err);
    }
};

exports.taoMoi = async (req, res, next) => {
    try {
        const { ten_loai } = req.body;
        if (!ten_loai || !ten_loai.trim()) return next(new AppError("Vui lòng nhập tên loại nguyên liệu!", 400));
        
        const daTonTai = await LoaiNguyenLieu.findOne({ where: { ten_loai: ten_loai.trim() } });
        if (daTonTai) return next(new AppError(`Loại nguyên liệu "${ten_loai.trim()}" đã tồn tại!`, 409));

        const moi = await LoaiNguyenLieu.create({ ten_loai: ten_loai.trim() });
        res.status(201).json({ status: "success", message: `Đã thêm loại nguyên liệu "${moi.ten_loai}"`, data: moi });
    } catch (err) {
        next(err);
    }
};

exports.capNhat = async (req, res, next) => {
    try {
        const loai = await LoaiNguyenLieu.findByPk(req.params.id);
        if (!loai) return next(new AppError(`Không tìm thấy loại nguyên liệu với ID: ${req.params.id}`, 404));

        const { ten_loai } = req.body;
        if (ten_loai && ten_loai.trim() !== loai.ten_loai) {
            const daTonTai = await LoaiNguyenLieu.findOne({ where: { ten_loai: ten_loai.trim() } });
            if (daTonTai && daTonTai.id !== loai.id) {
                return next(new AppError(`Loại nguyên liệu "${ten_loai.trim()}" đã tồn tại!`, 409));
            }
        }

        await loai.update({ ten_loai: ten_loai !== undefined ? ten_loai.trim() : loai.ten_loai });
        res.status(200).json({ status: "success", message: "Cập nhật thành công!", data: loai });
    } catch (err) {
        next(err);
    }
};

exports.xoa = async (req, res, next) => {
    try {
        const loai = await LoaiNguyenLieu.findByPk(req.params.id);
        if (!loai) return next(new AppError(`Không tìm thấy loại nguyên liệu với ID: ${req.params.id}`, 404));

        const soNguyenLieu = await NguyenLieu.count({ where: { id_loai_nguyen_lieu: req.params.id } });
        if (soNguyenLieu > 0) {
            return next(new AppError(`Không thể xóa loại nguyên liệu này vì đang có ${soNguyenLieu} nguyên liệu thuộc loại này.`, 400));
        }

        const ten = loai.ten_loai;
        await loai.destroy();
        res.status(200).json({ status: "success", message: `Đã xóa loại nguyên liệu "${ten}" thành công!` });
    } catch (err) {
        next(err);
    }
};
