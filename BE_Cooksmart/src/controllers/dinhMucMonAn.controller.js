const { DinhMucMonAn, MonAn, NguyenLieu } = require("../models/index");
const AppError = require("../utils/AppError");
const { convertUnit } = require("../utils/unitConverter");

exports.layDinhMucTheoMonAn = async (req, res, next) => {
    try {
        const { id_mon_an } = req.params;

        const monAn = await MonAn.findByPk(id_mon_an, { attributes: ["id", "ten_mon"] });
        if (!monAn) {
            return next(new AppError(`Khong tim thay mon an voi ID: ${id_mon_an}`, 404));
        }

        const danhSach = await DinhMucMonAn.findAll({
            where: { id_mon_an },
            attributes: ["id", "luong_tieu_hao", "don_vi_tinh"],
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

exports.layDinhMucTheoMonAnVoiChiPhi = async (req, res, next) => {
    try {
        const { id_mon_an } = req.params;

        const monAn = await MonAn.findByPk(id_mon_an, {
            attributes: ["id", "ten_mon", "gia_tien"],
        });
        if (!monAn) {
            return next(new AppError(`Không tìm thấy món ăn với ID: ${id_mon_an}`, 404));
        }

        const danhSach = await DinhMucMonAn.findAll({
            where: { id_mon_an },
            attributes: ["id", "luong_tieu_hao", "don_vi_tinh"],
            include: [
                {
                    model: NguyenLieu,
                    attributes: ["id", "ten_nguyen_lieu", "don_vi_tinh", "gia_von_binh_quan", "gia_nhap_gan_nhat"],
                },
            ],
        });

        // Tính chi phí nguyên liệu cho từng định mức
        const danhSachVoiChiPhi = danhSach.map((dm) => {
            const nl = dm.NguyenLieu;
            const donGia = Number(nl?.gia_von_binh_quan) > 0
                ? Number(nl.gia_von_binh_quan)
                : Number(nl?.gia_nhap_gan_nhat || 0);
                
            const luongXuatKho = convertUnit(dm.luong_tieu_hao, dm.don_vi_tinh, nl?.don_vi_tinh);
            const chiPhiDong = luongXuatKho * donGia;
            return {
                id: dm.id,
                luong_tieu_hao: Number(dm.luong_tieu_hao),
                don_vi_tinh: dm.don_vi_tinh,
                NguyenLieu: nl,
                don_gia_von: donGia,
                chi_phi: chiPhiDong,
            };
        });

        // Tổng chi phí và tỷ lệ cost
        const tongChiPhi = danhSachVoiChiPhi.reduce((s, d) => s + d.chi_phi, 0);
        const giaBan = Number(monAn.gia_tien);
        const tyLeCost = giaBan > 0 ? (tongChiPhi / giaBan) * 100 : 0;

        res.status(200).json({
            status: "success",
            mon_an: {
                id: monAn.id,
                ten_mon: monAn.ten_mon,
                gia_tien: giaBan,
            },
            results: danhSachVoiChiPhi.length,
            data: danhSachVoiChiPhi,
            tong_chi_phi: Math.round(tongChiPhi),
            ty_le_cost: Math.round(tyLeCost * 100) / 100,
        });
    } catch (err) {
        next(err);
    }
};

exports.layTatCaDinhMuc = async (req, res, next) => {
    try {
        const danhSach = await DinhMucMonAn.findAll({
            attributes: ["id", "luong_tieu_hao", "don_vi_tinh"],
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
        const { id_mon_an, id_nguyen_lieu, luong_tieu_hao, don_vi_tinh } = req.body;

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
            don_vi_tinh: don_vi_tinh || null,
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

        const { luong_tieu_hao, don_vi_tinh } = req.body;
        if (luong_tieu_hao === undefined) {
            return next(new AppError("Vui long cung cap luong_tieu_hao", 400));
        }
        if (isNaN(luong_tieu_hao) || Number(luong_tieu_hao) <= 0) {
            return next(new AppError("Luong tieu hao phai la so duong", 400));
        }

        await dinhMuc.update({ 
            luong_tieu_hao: Number(luong_tieu_hao),
            don_vi_tinh: don_vi_tinh !== undefined ? don_vi_tinh : dinhMuc.don_vi_tinh
        });

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
