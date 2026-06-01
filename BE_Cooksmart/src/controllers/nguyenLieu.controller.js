const { NguyenLieu, DinhMucMonAn, LoaiNguyenLieu } = require("../models/index");
const AppError = require("../utils/AppError");


exports.layTatCaNguyenLieu = async (req, res, next) => {
    try {
        const danhSach = await NguyenLieu.findAll({
            attributes: ["id", "id_loai_nguyen_lieu", "ten_nguyen_lieu", "don_vi_tinh", "loai_quan_ly", "so_luong_ton", "gia_nhap_gan_nhat", "gia_von_binh_quan"],
            include: [{ model: LoaiNguyenLieu, attributes: ["id", "ten_loai"] }],
            order: [["ten_nguyen_lieu", "ASC"]],
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





exports.layNguyenLieuTheoId = async (req, res, next) => {
    try {
        const nguyenLieu = await NguyenLieu.findByPk(req.params.id);
        if (!nguyenLieu) {
            return next(new AppError(`Không tìm thấy nguyên liệu với ID: ${req.params.id}`, 404));
        }

        res.status(200).json({ status: "success", data: nguyenLieu });
    } catch (err) {
        next(err);
    }
};





exports.taoNguyenLieu = async (req, res, next) => {
    try {
        const { id_loai_nguyen_lieu, ten_nguyen_lieu, don_vi_tinh, loai_quan_ly, so_luong_ton, gia_nhap_gan_nhat } = req.body;

        if (!ten_nguyen_lieu || !ten_nguyen_lieu.trim()) {
            return next(new AppError("Vui lòng nhập tên nguyên liệu!", 400));
        }


        const daTonTai = await NguyenLieu.findOne({ where: { ten_nguyen_lieu: ten_nguyen_lieu.trim() } });
        if (daTonTai) {
            return next(new AppError(`Nguyên liệu "${ten_nguyen_lieu.trim()}" đã tồn tại!`, 409));
        }

        const nguyenLieuMoi = await NguyenLieu.create({
            ten_nguyen_lieu: ten_nguyen_lieu.trim(),
            id_loai_nguyen_lieu: id_loai_nguyen_lieu || null,
            don_vi_tinh: don_vi_tinh || null,
            loai_quan_ly: loai_quan_ly || "THU_CONG",
            so_luong_ton: so_luong_ton !== undefined ? Number(so_luong_ton) : 0,
            gia_nhap_gan_nhat: gia_nhap_gan_nhat !== undefined ? Number(gia_nhap_gan_nhat) : 0,
            gia_von_binh_quan: gia_nhap_gan_nhat !== undefined ? Number(gia_nhap_gan_nhat) : 0,
        });

        const io = req.app.get("socketio");
        if (io) io.emit("cap_nhat_kho");

        res.status(201).json({
            status: "success",
            message: `Đã thêm nguyên liệu "${nguyenLieuMoi.ten_nguyen_lieu}" thành công!`,
            data: nguyenLieuMoi,
        });
    } catch (err) {
        next(err);
    }
};





exports.capNhatNguyenLieu = async (req, res, next) => {
    try {
        const nguyenLieu = await NguyenLieu.findByPk(req.params.id);
        if (!nguyenLieu) {
            return next(new AppError(`Không tìm thấy nguyên liệu với ID: ${req.params.id}`, 404));
        }

        const { id_loai_nguyen_lieu, ten_nguyen_lieu, don_vi_tinh, loai_quan_ly, so_luong_ton, gia_nhap_gan_nhat } = req.body;

        
        if (ten_nguyen_lieu && ten_nguyen_lieu.trim() !== nguyenLieu.ten_nguyen_lieu) {
            const daTonTai = await NguyenLieu.findOne({ where: { ten_nguyen_lieu: ten_nguyen_lieu.trim() } });
            if (daTonTai && daTonTai.id !== nguyenLieu.id) {
                return next(new AppError(`Nguyên liệu "${ten_nguyen_lieu.trim()}" đã tồn tại!`, 409));
            }
        }

        await nguyenLieu.update({
            ten_nguyen_lieu: ten_nguyen_lieu !== undefined ? ten_nguyen_lieu.trim() : nguyenLieu.ten_nguyen_lieu,
            id_loai_nguyen_lieu: id_loai_nguyen_lieu !== undefined ? id_loai_nguyen_lieu : nguyenLieu.id_loai_nguyen_lieu,
            don_vi_tinh: don_vi_tinh !== undefined ? don_vi_tinh : nguyenLieu.don_vi_tinh,
            loai_quan_ly: loai_quan_ly !== undefined ? loai_quan_ly : nguyenLieu.loai_quan_ly,
            so_luong_ton: so_luong_ton !== undefined ? Number(so_luong_ton) : nguyenLieu.so_luong_ton,
            gia_nhap_gan_nhat: gia_nhap_gan_nhat !== undefined ? Number(gia_nhap_gan_nhat) : nguyenLieu.gia_nhap_gan_nhat,
        });

        const io = req.app.get("socketio");
        if (io) io.emit("cap_nhat_kho");

        res.status(200).json({
            status: "success",
            message: "Cập nhật nguyên liệu thành công!",
            data: nguyenLieu,
        });
    } catch (err) {
        next(err);
    }
};






exports.xoaNguyenLieu = async (req, res, next) => {
    try {
        const nguyenLieu = await NguyenLieu.findByPk(req.params.id);
        if (!nguyenLieu) {
            return next(new AppError(`Không tìm thấy nguyên liệu với ID: ${req.params.id}`, 404));
        }

        
        const soDinhMuc = await DinhMucMonAn.count({ where: { id_nguyen_lieu: req.params.id } });
        if (soDinhMuc > 0) {
            return next(
                new AppError(
                    `Không thể xóa nguyên liệu "${nguyenLieu.ten_nguyen_lieu}" vì đang được dùng trong ${soDinhMuc} định mức món ăn. Vui lòng xóa định mức trước!`,
                    400
                )
            );
        }

        const ten = nguyenLieu.ten_nguyen_lieu;
        await nguyenLieu.destroy();

        const io = req.app.get("socketio");
        if (io) io.emit("cap_nhat_kho");

        res.status(200).json({
            status: "success",
            message: `Đã xóa nguyên liệu "${ten}" thành công!`,
        });
    } catch (err) {
        next(err);
    }
};
