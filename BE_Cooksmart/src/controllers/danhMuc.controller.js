const { DanhMuc, MonAn } = require("../models/index");
const AppError = require("../utils/AppError");


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


exports.taoDanhMuc = async (req, res, next) => {
    try {
        const { ten_danh_muc } = req.body;

     
        if (!ten_danh_muc || !ten_danh_muc.trim()) {
            return next(new AppError("Vui lòng nhập tên danh mục!", 400));
        }

        const daTonTai = await DanhMuc.findOne({
            where: { ten_danh_muc: ten_danh_muc.trim() },
        });

        if (daTonTai) {
            return next(new AppError(`Danh mục "${ten_danh_muc.trim()}" đã tồn tại!`, 409));
        }

    
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





exports.capNhatDanhMuc = async (req, res, next) => {
    try {
        const { ten_danh_muc } = req.body;

        
        if (!ten_danh_muc || !ten_danh_muc.trim()) {
            return next(new AppError("Vui lòng nhập tên danh mục mới!", 400));
        }

        
        const danhMuc = await DanhMuc.findByPk(req.params.id);

        if (!danhMuc) {
            return next(new AppError(`Không tìm thấy danh mục với ID: ${req.params.id}`, 404));
        }

        
        const daTonTai = await DanhMuc.findOne({
            where: { ten_danh_muc: ten_danh_muc.trim() },
        });

        if (daTonTai && daTonTai.id !== danhMuc.id) {
            return next(new AppError(`Danh mục "${ten_danh_muc.trim()}" đã tồn tại!`, 409));
        }

        
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






exports.xoaDanhMuc = async (req, res, next) => {
    try {
        
        const danhMuc = await DanhMuc.findByPk(req.params.id);

        if (!danhMuc) {
            return next(new AppError(`Không tìm thấy danh mục với ID: ${req.params.id}`, 404));
        }

        
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
