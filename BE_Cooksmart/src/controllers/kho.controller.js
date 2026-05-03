const { NguyenLieu, NhatKyKho, BaoCaoHaoHut, sequelize } = require("../models/index");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");

// ============================================================
//  POST /api/kho/nhap-hang
//  Admin – Nhập hàng vào kho (cộng dồn số lượng)
// ============================================================
exports.nhapKho = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        // items: mảng chứa các object { id_nguyen_lieu, so_luong_nhap, gia_nhap }
        const { items } = req.body;
        const id_nguoi_thuc_hien = req.nguoiDung.id; // Lấy từ middleware auth

        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new AppError("Danh sách nguyên liệu nhập không hợp lệ", 400));
        }

        const ketQuaNhap = [];

        for (const item of items) {
            const { id_nguyen_lieu, so_luong_nhap, gia_nhap } = item;
            
            if (!id_nguyen_lieu || so_luong_nhap <= 0) {
                throw new AppError("Dữ liệu từng nguyên liệu không hợp lệ (số lượng phải > 0)", 400);
            }

            const nguyenLieu = await NguyenLieu.findByPk(id_nguyen_lieu, { transaction: t });
            if (!nguyenLieu) {
                throw new AppError(`Không tìm thấy nguyên liệu có ID: ${id_nguyen_lieu}`, 404);
            }

            // 1. Cập nhật số lượng và giá nhập gần nhất
            const soLuongCu = Number(nguyenLieu.so_luong_ton);
            const soLuongMoi = soLuongCu + Number(so_luong_nhap);
            const giaNhapMoi = gia_nhap !== undefined ? Number(gia_nhap) : Number(nguyenLieu.gia_nhap_gan_nhat);

            await nguyenLieu.update({
                so_luong_ton: soLuongMoi,
                gia_nhap_gan_nhat: giaNhapMoi
            }, { transaction: t });

            // 2. Ghi nhật ký kho
            const log = await NhatKyKho.create({
                id_nguyen_lieu: nguyenLieu.id,
                id_nguoi_thuc_hien,
                loai_giao_dich: "NHAP_HANG",
                so_luong: Number(so_luong_nhap),
                gia_nhap_lo_hang: giaNhapMoi
            }, { transaction: t });

            ketQuaNhap.push({ nguyenLieu, log });
        }

        await t.commit();

        res.status(201).json({
            status: "success",
            message: `Nhập kho thành công ${items.length} mặt hàng!`,
            data: ketQuaNhap
        });

    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};

// ============================================================
//  POST /api/kho/kiem-ke
//  Admin – Kiểm kê kho thủ công cuối ngày (chốt số liệu)
// ============================================================
exports.kiemKeKho = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        // items: mảng chứa các object { id_nguyen_lieu, so_luong_thuc_te }
        const { items } = req.body;
        const id_nguoi_thuc_hien = req.nguoiDung.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new AppError("Danh sách nguyên liệu kiểm kê không hợp lệ", 400));
        }

        const ketQuaKiemKe = [];

        for (const item of items) {
            const { id_nguyen_lieu, so_luong_thuc_te } = item;
            
            if (!id_nguyen_lieu || so_luong_thuc_te < 0) {
                throw new AppError("Dữ liệu kiểm kê không hợp lệ (số lượng >= 0)", 400);
            }

            const nguyenLieu = await NguyenLieu.findByPk(id_nguyen_lieu, { transaction: t });
            if (!nguyenLieu) {
                throw new AppError(`Không tìm thấy nguyên liệu có ID: ${id_nguyen_lieu}`, 404);
            }

            const soLuongHienTai = Number(nguyenLieu.so_luong_ton);
            const soLuongDemDuoc = Number(so_luong_thuc_te);
            const chenhLech = soLuongHienTai - soLuongDemDuoc; // Số lượng hao hụt

            // 1. Cập nhật lại số lượng tồn đúng với thực tế
            await nguyenLieu.update({ so_luong_ton: soLuongDemDuoc }, { transaction: t });

            // 2. Tạo báo cáo hao hụt (dù chênh lệch âm, dương hay = 0 đều lưu lại để truy vết)
            const baoCao = await BaoCaoHaoHut.create({
                id_nguyen_lieu: nguyenLieu.id,
                luong_ban_ly_thuyet: soLuongHienTai, // Số hệ thống nghĩ là có
                luong_du_thuc_te: soLuongDemDuoc,   // Số thực đếm được
                luong_hao_hut: chenhLech,
                gia_tri_hao_hut: chenhLech * Number(nguyenLieu.gia_nhap_gan_nhat)
            }, { transaction: t });

            // 3. Ghi log kiểm kê vào NhatKyKho
            await NhatKyKho.create({
                id_nguyen_lieu: nguyenLieu.id,
                id_nguoi_thuc_hien,
                loai_giao_dich: "KIEM_KE_CHOT_LO",
                so_luong: soLuongDemDuoc, // Ghi nhận số dư cuối cùng
                gia_nhap_lo_hang: Number(nguyenLieu.gia_nhap_gan_nhat)
            }, { transaction: t });

            ketQuaKiemKe.push({ nguyenLieu, baoCao });
        }

        await t.commit();

        res.status(200).json({
            status: "success",
            message: `Kiểm kê kho thành công ${items.length} mặt hàng!`,
            data: ketQuaKiemKe
        });

    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};

// ============================================================
//  GET /api/kho/lich-su
//  Lấy nhật ký giao dịch kho
// ============================================================
exports.layNhatKyKho = async (req, res, next) => {
    try {
        const { tu_ngay, den_ngay, loai_giao_dich, id_nguyen_lieu } = req.query;
        let whereClause = {};

        if (loai_giao_dich) whereClause.loai_giao_dich = loai_giao_dich;
        if (id_nguyen_lieu) whereClause.id_nguyen_lieu = id_nguyen_lieu;

        if (tu_ngay || den_ngay) {
            whereClause.thoi_gian = {};
            if (tu_ngay) whereClause.thoi_gian[Op.gte] = new Date(tu_ngay);
            if (den_ngay) {
                const toDate = new Date(den_ngay);
                toDate.setHours(23, 59, 59, 999);
                whereClause.thoi_gian[Op.lte] = toDate;
            }
        }

        const { NguoiDung } = require("../models"); // Import lazy để tránh circular
        const lichSu = await NhatKyKho.findAll({
            where: whereClause,
            include: [
                { model: NguyenLieu, attributes: ["ten_nguyen_lieu", "don_vi_tinh"] },
                { model: NguoiDung, attributes: ["ho_ten"] }
            ],
            order: [["thoi_gian", "DESC"]]
        });

        res.status(200).json({
            status: "success",
            results: lichSu.length,
            data: lichSu
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
//  GET /api/kho/bao-cao-hao-hut
//  Lấy báo cáo chênh lệch sau khi kiểm kê
// ============================================================
exports.layBaoCaoHaoHut = async (req, res, next) => {
    try {
        const { tu_ngay, den_ngay, id_nguyen_lieu } = req.query;
        let whereClause = {};

        if (id_nguyen_lieu) whereClause.id_nguyen_lieu = id_nguyen_lieu;

        if (tu_ngay || den_ngay) {
            whereClause.ngay_chot = {};
            if (tu_ngay) whereClause.ngay_chot[Op.gte] = new Date(tu_ngay);
            if (den_ngay) {
                const toDate = new Date(den_ngay);
                toDate.setHours(23, 59, 59, 999);
                whereClause.ngay_chot[Op.lte] = toDate;
            }
        }

        const baoCao = await BaoCaoHaoHut.findAll({
            where: whereClause,
            include: [
                { model: NguyenLieu, attributes: ["ten_nguyen_lieu", "don_vi_tinh", "gia_nhap_gan_nhat"] }
            ],
            order: [["ngay_chot", "DESC"]]
        });

        res.status(200).json({
            status: "success",
            results: baoCao.length,
            data: baoCao
        });
    } catch (error) {
        next(error);
    }
};
