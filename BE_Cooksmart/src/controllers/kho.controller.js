const {
    NguyenLieu,
    NhatKyKho,
    ChiTietNhatKyKho,
    ChiTietBaoCaoHaoHut,
    BaoCaoTaiChinh,
    HoaDon,
    NguoiDung,
    sequelize
} = require("../models/index");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");






exports.nhapKho = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { items } = req.body;
        const id_nguoi_thuc_hien = req.nguoiDung.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new AppError("Danh sách nguyên liệu nhập không hợp lệ", 400));
        }

        const maPhieu = `PN${new Date().getTime().toString().slice(-6)}`;

        
        const phieu = await NhatKyKho.create({
            ma_phieu: maPhieu,
            loai_giao_dich: "NHAP_HANG",
            id_nguoi_thuc_hien,
            thoi_gian: new Date()
        }, { transaction: t });

        const chiTiets = [];

        for (const item of items) {
            const { id_nguyen_lieu, so_luong_nhap, gia_nhap } = item;

            if (!id_nguyen_lieu || so_luong_nhap <= 0) {
                throw new AppError("Dữ liệu nguyên liệu không hợp lệ (số lượng phải > 0)", 400);
            }

            const nguyenLieu = await NguyenLieu.findByPk(id_nguyen_lieu, { transaction: t });
            if (!nguyenLieu) {
                throw new AppError(`Không tìm thấy nguyên liệu ID: ${id_nguyen_lieu}`, 404);
            }

            
            const soLuongCu = Number(nguyenLieu.so_luong_ton);
            const giaVonCu = Number(nguyenLieu.gia_von_binh_quan) > 0
                ? Number(nguyenLieu.gia_von_binh_quan)
                : Number(nguyenLieu.gia_nhap_gan_nhat || 0);
            const soLuongNhap = Number(so_luong_nhap);
            const giaNhapMoi = gia_nhap !== undefined ? Number(gia_nhap) : Number(nguyenLieu.gia_nhap_gan_nhat || 0);
            const soLuongMoi = soLuongCu + soLuongNhap;
            const giaVonBinhQuanMoi = soLuongMoi > 0
                ? Math.round((soLuongCu * giaVonCu + soLuongNhap * giaNhapMoi) / soLuongMoi)
                : 0;

            
            await nguyenLieu.update({
                so_luong_ton: soLuongMoi,
                gia_nhap_gan_nhat: giaNhapMoi,
                gia_von_binh_quan: giaVonBinhQuanMoi
            }, { transaction: t });

            
            const chiTiet = await ChiTietNhatKyKho.create({
                id_nhat_ky_kho: phieu.id,
                id_nguyen_lieu,
                so_luong: soLuongNhap,
                don_gia: giaNhapMoi,
                thanh_tien: soLuongNhap * giaNhapMoi
            }, { transaction: t });

            chiTiets.push({ nguyenLieu, chiTiet });
        }

        await t.commit();

        res.status(201).json({
            status: "success",
            message: `Nhập kho thành công ${items.length} mặt hàng!`,
            data: { phieu, chiTiets }
        });

    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};






exports.xuatKho = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { items } = req.body;
        const id_nguoi_thuc_hien = req.nguoiDung.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new AppError("Danh sách nguyên liệu xuất không hợp lệ", 400));
        }

        const loaiGiaoDich = items[0]?.loai_giao_dich || "XUAT_BAN";
        const prefix = loaiGiaoDich === "HUY_HANG" ? "PH" : "PX";
        const maPhieu = `${prefix}${new Date().getTime().toString().slice(-6)}`;

        
        const phieu = await NhatKyKho.create({
            ma_phieu: maPhieu,
            loai_giao_dich: loaiGiaoDich,
            id_nguoi_thuc_hien,
            thoi_gian: new Date()
        }, { transaction: t });

        const chiTiets = [];

        for (const item of items) {
            const { id_nguyen_lieu, so_luong_xuat, loai_giao_dich } = item;

            if (!id_nguyen_lieu || so_luong_xuat <= 0) {
                throw new AppError("Dữ liệu nguyên liệu không hợp lệ (số lượng xuất phải > 0)", 400);
            }

            const nguyenLieu = await NguyenLieu.findByPk(id_nguyen_lieu, { transaction: t });
            if (!nguyenLieu) {
                throw new AppError(`Không tìm thấy nguyên liệu ID: ${id_nguyen_lieu}`, 404);
            }

            const soLuongCu = Number(nguyenLieu.so_luong_ton);
            if (soLuongCu < so_luong_xuat) {
                throw new AppError(
                    `"${nguyenLieu.ten_nguyen_lieu}" không đủ tồn kho (Tồn: ${soLuongCu}, Cần: ${so_luong_xuat})`,
                    400
                );
            }

            const donGia = Number(nguyenLieu.gia_von_binh_quan) > 0
                ? Number(nguyenLieu.gia_von_binh_quan)
                : Number(nguyenLieu.gia_nhap_gan_nhat || 0);

            await nguyenLieu.update({
                so_luong_ton: soLuongCu - Number(so_luong_xuat)
            }, { transaction: t });

            
            const chiTiet = await ChiTietNhatKyKho.create({
                id_nhat_ky_kho: phieu.id,
                id_nguyen_lieu,
                so_luong: Number(so_luong_xuat),
                don_gia: donGia,
                thanh_tien: Number(so_luong_xuat) * donGia
            }, { transaction: t });

            chiTiets.push({ nguyenLieu, chiTiet });
        }

        await t.commit();

        res.status(201).json({
            status: "success",
            message: `Xuất kho thành công ${items.length} mặt hàng!`,
            data: { phieu, chiTiets }
        });

    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};






exports.kiemKeKho = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { items } = req.body;
        const id_nguoi_thuc_hien = req.nguoiDung.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new AppError("Danh sách nguyên liệu kiểm kê không hợp lệ", 400));
        }

        const maPhieu = `KK${new Date().getTime().toString().slice(-6)}`;
        let tongGiaVonBanHang = 0;

        
        const phieu = await NhatKyKho.create({
            ma_phieu: maPhieu,
            loai_giao_dich: "KIEM_KE_CHOT_LO",
            id_nguoi_thuc_hien,
            thoi_gian: new Date()
        }, { transaction: t });

        const ketQuaKiemKe = [];

        for (const item of items) {
            const { id_nguyen_lieu, so_luong_thuc_te } = item;

            if (!id_nguyen_lieu || so_luong_thuc_te < 0) {
                throw new AppError("Dữ liệu kiểm kê không hợp lệ (số lượng >= 0)", 400);
            }

            const nguyenLieu = await NguyenLieu.findByPk(id_nguyen_lieu, { transaction: t });
            if (!nguyenLieu) {
                throw new AppError(`Không tìm thấy nguyên liệu ID: ${id_nguyen_lieu}`, 404);
            }

            const soLuongHienTai = Number(nguyenLieu.so_luong_ton);
            const soLuongDemDuoc = Number(so_luong_thuc_te);
            const chenhLech = soLuongHienTai - soLuongDemDuoc;

            const giaVon = Number(nguyenLieu.gia_von_binh_quan) > 0
                ? Number(nguyenLieu.gia_von_binh_quan)
                : Number(nguyenLieu.gia_nhap_gan_nhat || 0);
            const tienTieuHao = chenhLech * giaVon;
            tongGiaVonBanHang += tienTieuHao;

            
            await nguyenLieu.update({ so_luong_ton: soLuongDemDuoc }, { transaction: t });

            
            await ChiTietNhatKyKho.create({
                id_nhat_ky_kho: phieu.id,
                id_nguyen_lieu,
                so_luong: soLuongDemDuoc,
                don_gia: giaVon,
                thanh_tien: soLuongDemDuoc * giaVon
            }, { transaction: t });

            
            const chiTietHaoHut = await ChiTietBaoCaoHaoHut.create({
                id_nhat_ky_kho: phieu.id,
                id_nguyen_lieu,
                luong_ban_ly_thuyet: soLuongHienTai,
                luong_du_thuc_te: soLuongDemDuoc,
                luong_hao_hut: chenhLech,
                gia_tri_hao_hut: tienTieuHao
            }, { transaction: t });

            ketQuaKiemKe.push({ nguyenLieu, chiTietHaoHut });
        }

        
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const doanhThuThuan = await HoaDon.sum('tong_tien', {
            where: {
                trang_thai_hd: 'DaThanhToan',
                thoi_gian_tao: { [Op.between]: [startOfDay, endOfDay] }
            },
            transaction: t
        }) || 0;

        let baoCaoTaiChinh = await BaoCaoTaiChinh.findOne({
            where: { thoi_gian: { [Op.between]: [startOfDay, endOfDay] } },
            transaction: t
        });

        if (baoCaoTaiChinh) {
            const giaVonMoi = Number(baoCaoTaiChinh.gia_von_ban_hang || 0) + tongGiaVonBanHang;
            await baoCaoTaiChinh.update({
                doanh_thu_thuan: doanhThuThuan,
                gia_von_ban_hang: giaVonMoi,
                loi_nhuan_rong: doanhThuThuan - giaVonMoi
            }, { transaction: t });
        } else {
            await BaoCaoTaiChinh.create({
                doanh_thu_thuan: doanhThuThuan,
                gia_von_ban_hang: tongGiaVonBanHang,
                tong_hao_hut: 0,
                loi_nhuan_rong: doanhThuThuan - tongGiaVonBanHang,
                thoi_gian: new Date()
            }, { transaction: t });
        }

        await t.commit();

        res.status(200).json({
            status: "success",
            message: `Kiểm kê thành công ${items.length} mặt hàng! Đã cập nhật Báo cáo tài chính.`,
            data: { phieu, ketQuaKiemKe }
        });

    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};





exports.layNhatKyKho = async (req, res, next) => {
    try {
        const { loai_giao_dich, tu_ngay, den_ngay } = req.query;
        const whereClause = {};

        if (loai_giao_dich) whereClause.loai_giao_dich = loai_giao_dich;
        if (tu_ngay || den_ngay) {
            whereClause.thoi_gian = {};
            if (tu_ngay) whereClause.thoi_gian[Op.gte] = new Date(tu_ngay);
            if (den_ngay) {
                const d = new Date(den_ngay);
                d.setHours(23, 59, 59, 999);
                whereClause.thoi_gian[Op.lte] = d;
            }
        }

        const lichSu = await NhatKyKho.findAll({
            where: whereClause,
            include: [
                {
                    model: ChiTietNhatKyKho,
                    as: "ChiTiets",
                    include: [{ model: NguyenLieu, attributes: ["ten_nguyen_lieu", "don_vi_tinh"] }]
                },
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





exports.layDanhSachPhieuNhapXuat = async (req, res, next) => {
    try {
        const { loai_giao_dich } = req.query;
        const whereClause = {};
        if (loai_giao_dich && loai_giao_dich !== "ALL") {
            whereClause.loai_giao_dich = loai_giao_dich;
        }

        const danhSach = await NhatKyKho.findAll({
            where: whereClause,
            include: [
                {
                    model: ChiTietNhatKyKho,
                    as: "ChiTiets",
                    attributes: ["so_luong", "thanh_tien"]
                },
                { model: NguoiDung, attributes: ["ho_ten"] }
            ],
            order: [["thoi_gian", "DESC"]]
        });

        
        const result = danhSach.map(phieu => ({
            id: phieu.id,
            ma_phieu: phieu.ma_phieu,
            loai_giao_dich: phieu.loai_giao_dich,
            thoi_gian: phieu.thoi_gian,
            nguoi_thuc_hien: phieu.NguoiDung?.ho_ten || "Hệ thống",
            tong_so_luong: phieu.ChiTiets?.reduce((s, c) => s + Number(c.so_luong), 0) || 0,
            tong_gia_tri: phieu.ChiTiets?.reduce((s, c) => s + Number(c.thanh_tien), 0) || 0,
            so_mat_hang: phieu.ChiTiets?.length || 0
        }));

        res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};





exports.layChiTietPhieuNhapXuat = async (req, res, next) => {
    try {
        const phieu = await NhatKyKho.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: ChiTietNhatKyKho,
                    as: "ChiTiets",
                    include: [{ model: NguyenLieu, attributes: ["ten_nguyen_lieu", "don_vi_tinh"] }]
                },
                { model: NguoiDung, attributes: ["ho_ten"] }
            ]
        });

        if (!phieu) return next(new AppError("Không tìm thấy phiếu", 404));

        res.status(200).json({ status: "success", data: phieu });
    } catch (error) {
        next(error);
    }
};





exports.layDanhSachPhieuKiemKe = async (req, res, next) => {
    try {
        const danhSach = await NhatKyKho.findAll({
            where: { loai_giao_dich: "KIEM_KE_CHOT_LO" },
            include: [
                {
                    model: ChiTietBaoCaoHaoHut,
                    as: "ChiTietHaoHuts",
                    attributes: ["luong_hao_hut", "gia_tri_hao_hut"]
                },
                { model: NguoiDung, attributes: ["ho_ten"] }
            ],
            order: [["thoi_gian", "DESC"]]
        });

        const result = danhSach.map(phieu => ({
            id: phieu.id,
            ma_phieu: phieu.ma_phieu,
            thoi_gian: phieu.thoi_gian,
            nguoi_tao: phieu.NguoiDung?.ho_ten || "Hệ thống",
            tong_sl_lech: phieu.ChiTietHaoHuts?.reduce((s, c) => s + Number(c.luong_hao_hut), 0) || 0,
            tong_gia_tri_lech: phieu.ChiTietHaoHuts?.reduce((s, c) => s + Number(c.gia_tri_hao_hut), 0) || 0
        }));

        res.status(200).json({ status: "success", data: result });
    } catch (error) {
        next(error);
    }
};





exports.layChiTietPhieuKiemKe = async (req, res, next) => {
    try {
        const phieu = await NhatKyKho.findOne({
            where: { id: req.params.id, loai_giao_dich: "KIEM_KE_CHOT_LO" },
            include: [
                {
                    model: ChiTietBaoCaoHaoHut,
                    as: "ChiTietHaoHuts",
                    include: [{ model: NguyenLieu, attributes: ["ten_nguyen_lieu", "don_vi_tinh"] }]
                },
                { model: NguoiDung, attributes: ["ho_ten"] }
            ]
        });

        if (!phieu) return next(new AppError("Không tìm thấy phiếu kiểm kê", 404));

        res.status(200).json({ status: "success", data: phieu });
    } catch (error) {
        next(error);
    }
};





exports.layBaoCaoHaoHut = async (req, res, next) => {
    try {
        const { tu_ngay, den_ngay, id_nguyen_lieu } = req.query;
        const whereClause = {};

        if (id_nguyen_lieu) whereClause.id_nguyen_lieu = id_nguyen_lieu;

        
        const wherePhieu = {};
        if (tu_ngay || den_ngay) {
            wherePhieu.thoi_gian = {};
            if (tu_ngay) wherePhieu.thoi_gian[Op.gte] = new Date(tu_ngay);
            if (den_ngay) {
                const d = new Date(den_ngay);
                d.setHours(23, 59, 59, 999);
                wherePhieu.thoi_gian[Op.lte] = d;
            }
        }

        const baoCao = await ChiTietBaoCaoHaoHut.findAll({
            where: whereClause,
            include: [
                { model: NguyenLieu, attributes: ["ten_nguyen_lieu", "don_vi_tinh", "gia_nhap_gan_nhat"] },
                {
                    model: NhatKyKho,
                    where: wherePhieu,
                    attributes: ["ma_phieu", "thoi_gian"],
                    include: [{ model: NguoiDung, attributes: ["ho_ten"] }]
                }
            ],
            order: [[NhatKyKho, "thoi_gian", "DESC"]]
        });

        res.status(200).json({ status: "success", results: baoCao.length, data: baoCao });
    } catch (error) {
        next(error);
    }
};
