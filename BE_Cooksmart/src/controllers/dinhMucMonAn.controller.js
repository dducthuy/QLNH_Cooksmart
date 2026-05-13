const { DinhMucMonAn, MonAn, NguyenLieu } = require("../models/index");
const AppError = require("../utils/AppError");

exports.layDinhMucTheoMonAn = async (req, res, next) => {
    try {
        const { id_mon_an } = req.params;

        const monAn = await MonAn.findByPk(id_mon_an, { attributes: ["id", "ten_mon"] });
        if (!monAn) {
            return next(new AppError(`Khong tim thay mon an voi ID: ${id_mon_an}`, 404));
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

        if (!id_mon_an || !id_nguyen_lieu || luong_tieu_hao === undefined) {
            return next(new AppError("Vui long cung cap day du: id_mon_an, id_nguyen_lieu, luong_tieu_hao", 400));
        }
        if (isNaN(luong_tieu_hao) || Number(luong_tieu_hao) <= 0) {
            return next(new AppError("Luong tieu hao phai la so duong", 400));
        }

        const monAn = await MonAn.findByPk(id_mon_an);
        if (!monAn) return next(new AppError(`Khong tim thay mon an voi ID: ${id_mon_an}`, 404));

        const nguyenLieu = await NguyenLieu.findByPk(id_nguyen_lieu);
        if (!nguyenLieu) return next(new AppError(`Khong tim thay nguyen lieu voi ID: ${id_nguyen_lieu}`, 404));

        const daTonTai = await DinhMucMonAn.findOne({ where: { id_mon_an, id_nguyen_lieu } });
        if (daTonTai) {
            return next(new AppError("Dinh muc cho mon an va nguyen lieu nay da ton tai", 409));
        }

        const dinhMucMoi = await DinhMucMonAn.create({
            id_mon_an,
            id_nguyen_lieu,
            luong_tieu_hao: Number(luong_tieu_hao),
        });

        res.status(201).json({
            status: "success",
            message: "Da them dinh muc thanh cong",
            data: dinhMucMoi,
        });
    } catch (err) {
        next(err);
    }
};

exports.capNhatDinhMuc = async (req, res, next) => {
    try {
        const dinhMuc = await DinhMucMonAn.findByPk(req.params.id);
        if (!dinhMuc) {
            return next(new AppError(`Khong tim thay dinh muc voi ID: ${req.params.id}`, 404));
        }

        const { luong_tieu_hao } = req.body;
        if (luong_tieu_hao === undefined) {
            return next(new AppError("Vui long cung cap luong_tieu_hao", 400));
        }
        if (isNaN(luong_tieu_hao) || Number(luong_tieu_hao) <= 0) {
            return next(new AppError("Luong tieu hao phai la so duong", 400));
        }

        await dinhMuc.update({ luong_tieu_hao: Number(luong_tieu_hao) });

        res.status(200).json({
            status: "success",
            message: "Cap nhat dinh muc thanh cong",
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
            return next(new AppError(`Khong tim thay dinh muc voi ID: ${req.params.id}`, 404));
        }

        await dinhMuc.destroy();

        res.status(200).json({
            status: "success",
            message: "Da xoa dinh muc thanh cong",
        });
    } catch (err) {
        next(err);
    }
};
