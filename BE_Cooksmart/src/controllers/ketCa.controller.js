const { KetCa, HoaDon, ChiTieuCa, NguoiDung, ChiTietHoaDon, DinhMucMonAn, NguyenLieu, NhatKyKho, ChiTietNhatKyKho, sequelize } = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");
const { convertUnit } = require("../utils/unitConverter");

async function xuatKhoChoKetCa(id_ket_ca, id_nguoi_thuc_hien, transaction) {
    try {
        const danhSachHoaDon = await HoaDon.findAll({
            where: {
                id_ket_ca,
                trang_thai_hd: "DaThanhToan",
                da_chot_kho: false
            },
            attributes: ["id"],
            transaction
        });

        if (!danhSachHoaDon.length) return;

        const listIdHoaDon = danhSachHoaDon.map(hd => hd.id);

        const chiTiets = await ChiTietHoaDon.findAll({
            where: { id_hoa_don: { [Op.in]: listIdHoaDon }, id_mon_an: { [Op.ne]: null } },
            attributes: ["id_mon_an", "so_luong"],
            transaction,
        });

        if (!chiTiets.length) {
            await HoaDon.update(
                { da_chot_kho: true },
                { where: { id: { [Op.in]: listIdHoaDon } }, transaction }
            );
            return;
        }

        const bangXuat = {};

        for (const ct of chiTiets) {
            const soLuongMon = Number(ct.so_luong);

            const dinhMucs = await DinhMucMonAn.findAll({
                where: { id_mon_an: ct.id_mon_an },
                attributes: ["luong_tieu_hao", "don_vi_tinh", "id_nguyen_lieu"],
                include: [{
                    model: NguyenLieu,
                    attributes: ["id", "ten_nguyen_lieu", "don_vi_tinh", "loai_quan_ly", "so_luong_ton", "gia_von_binh_quan", "gia_nhap_gan_nhat"],
                    where: { loai_quan_ly: "TU_DONG" },
                    required: true,
                }],
                transaction,
            });

            for (const dm of dinhMucs) {
                const idNL = dm.id_nguyen_lieu;
                const nl = dm.NguyenLieu;
                
                // Quy đổi đơn vị
                const tongTieuHao = Number(dm.luong_tieu_hao) * soLuongMon;
                const luongXuat = convertUnit(tongTieuHao, dm.don_vi_tinh, nl.don_vi_tinh);

                const donGia = Number(nl.gia_von_binh_quan) > 0
                    ? Number(nl.gia_von_binh_quan)
                    : Number(nl.gia_nhap_gan_nhat || 0);

                if (!bangXuat[idNL]) {
                    bangXuat[idNL] = { luong: 0, donGia, tenNL: nl.ten_nguyen_lieu };
                }
                bangXuat[idNL].luong += luongXuat;
            }
        }

        if (Object.keys(bangXuat).length > 0) {
            const maPhieu = `PX${new Date().getTime().toString().slice(-6)}`;
            const phieu = await NhatKyKho.create({
                ma_phieu: maPhieu,
                loai_giao_dich: "XUAT_BAN",
                id_nguoi_thuc_hien,
                ghi_chu: `Chốt kho khi đóng ca (Ca ID: ${id_ket_ca.slice(0, 8)}, gồm ${listIdHoaDon.length} hóa đơn)`,
                thoi_gian: new Date(),
            }, { transaction });

            for (const [idNL, info] of Object.entries(bangXuat)) {
                const nguyenLieu = await NguyenLieu.findByPk(idNL, { transaction });
                if (!nguyenLieu) continue;

                const soLuongMoi = Number(nguyenLieu.so_luong_ton) - info.luong;
                await nguyenLieu.update({ so_luong_ton: soLuongMoi }, { transaction });

                await ChiTietNhatKyKho.create({
                    id_nhat_ky_kho: phieu.id,
                    id_nguyen_lieu: idNL,
                    so_luong: info.luong,
                    don_gia: info.donGia,
                    thanh_tien: info.luong * info.donGia,
                }, { transaction });
            }
        }

        await HoaDon.update(
            { da_chot_kho: true },
            { where: { id: { [Op.in]: listIdHoaDon } }, transaction }
        );

    } catch (err) {
        console.error(`[XuatKho] Lỗi xuất kho gộp cho ca ${id_ket_ca}:`, err.message);
        throw err;
    }
}

exports.moCa = async (req, res, next) => {
    try {
        const id_nhan_vien = req.nguoiDung.id; 
        const { starting_cash } = req.body; 

        
        const caDangChay = await KetCa.findOne({
            where: {
                id_nhan_vien,
                trang_thai_ca: "DangChay",
            },
        });

        if (caDangChay) {
            return next(new AppError("Bạn đang có một ca làm việc chưa đóng. Vui lòng chốt ca trước khi mở ca mới!", 400));
        }

        
        const caMoi = await KetCa.create({
            id_nhan_vien,
            tien_dau_ca: starting_cash || 0,
            trang_thai_ca: "DangChay",
        });

        res.status(201).json({
            status: "success",
            message: "Mở ca làm việc thành công",
            data: caMoi,
        });

        
        const io = req.app.get("socketio");
        if (io) {
            io.emit("cap_nhat_ca", { status: "OPEN", ca: caMoi });
        }
    } catch (error) {
        next(error);
    }
};




exports.layThongTinCaHienTai = async (req, res, next) => {
    try {
        const id_nhan_vien = req.nguoiDung.id;

        const includeNguoiDung = [
            {
                model: NguoiDung,
                attributes: ["id", "ho_ten", "ten_dang_nhap", "vai_tro"],
            },
        ];

        
        let caHienTai = await KetCa.findOne({
            where: {
                id_nhan_vien,
                trang_thai_ca: "DangChay",
            },
            include: includeNguoiDung,
        });

        
        if (!caHienTai) {
            caHienTai = await KetCa.findOne({
                where: {
                    trang_thai_ca: "DangChay",
                },
                include: includeNguoiDung,
                order: [['thoi_gian_bat_dau', 'DESC']]
            });
        }

        if (!caHienTai) {
            return next(new AppError("Không tìm thấy ca làm việc nào đang mở trong hệ thống.", 404));
        }

        
        const danhSachChiTieu = await ChiTieuCa.findAll({
            where: { id_ket_ca: caHienTai.id }
        });
        const tongTienChi = danhSachChiTieu.reduce((sum, item) => sum + Number(item.so_tien), 0);

        
        const danhSachHoaDon = await HoaDon.findAll({
            where: {
                id_ket_ca: caHienTai.id,
                trang_thai_hd: "DaThanhToan",
            },
        });

        let tongDoanhThuTienMat = 0;
        let tongDoanhThuChuyenKhoan = 0;
        let tongSoDon = danhSachHoaDon.length;

        danhSachHoaDon.forEach((hd) => {
            if (hd.phuong_thuc_tt === "TienMat") {
                tongDoanhThuTienMat += Number(hd.tong_tien) - Number(hd.giam_gia);
            } else if (hd.phuong_thuc_tt === "ChuyenKhoan") {
                tongDoanhThuChuyenKhoan += Number(hd.tong_tien) - Number(hd.giam_gia);
            }
        });

        
        const expected_cash = Number(caHienTai.tien_dau_ca) + tongDoanhThuTienMat - tongTienChi;

        res.status(200).json({
            status: "success",
            data: {
                ca_lam_viec: caHienTai,
                tong_so_don: tongSoDon,
                doanh_thu_tien_mat: tongDoanhThuTienMat,
                doanh_thu_chuyen_khoan: tongDoanhThuChuyenKhoan,
                tong_tien_chi: tongTienChi,
                danh_sach_chi_tieu: danhSachChiTieu,
                tien_mat_ly_thuyet: expected_cash,
            },
        });
    } catch (error) {
        next(error);
    }
};




exports.chotCa = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const shift_id = req.params.id;
        const { actual_cash } = req.body; 

        
        const caLamViec = await KetCa.findByPk(shift_id, { transaction: t });
        
        if (!caLamViec) {
            await t.rollback();
            return next(new AppError("Ca làm việc không tồn tại", 404));
        }
        
        if (caLamViec.trang_thai_ca === "DaKetThuc") {
            await t.rollback();
            return next(new AppError("Ca làm việc này đã được chốt rồi!", 400));
        }

        
        const danhSachHoaDon = await HoaDon.findAll({
            where: {
                id_ket_ca: shift_id,
                trang_thai_hd: "DaThanhToan",
            },
            transaction: t
        });

        let tongDoanhThuTienMat = 0;
        let tongDoanhThuChuyenKhoan = 0;

        danhSachHoaDon.forEach((hd) => {
            if (hd.phuong_thuc_tt === "TienMat") {
                tongDoanhThuTienMat += Number(hd.tong_tien) - Number(hd.giam_gia);
            } else if (hd.phuong_thuc_tt === "ChuyenKhoan") {
                tongDoanhThuChuyenKhoan += Number(hd.tong_tien) - Number(hd.giam_gia);
            }
        });

        
        const danhSachChiTieu = await ChiTieuCa.findAll({
            where: { id_ket_ca: shift_id },
            transaction: t
        });
        const tongTienChi = danhSachChiTieu.reduce((sum, item) => sum + Number(item.so_tien), 0);

        const tien_dau_ca = Number(caLamViec.tien_dau_ca);
        const expected_cash = tien_dau_ca + tongDoanhThuTienMat - tongTienChi;
        const difference = (actual_cash !== undefined ? actual_cash : expected_cash) - expected_cash;

        
        await caLamViec.update({
            trang_thai_ca: "DaKetThuc",
            thoi_gian_ket_thuc: new Date(),
            tong_tien_mat_he_thong: expected_cash,
            tong_chuyen_khoan_he_thong: tongDoanhThuChuyenKhoan,
            tien_mat_thuc_te_ban_giao: actual_cash !== undefined ? actual_cash : expected_cash,
            tien_chenh_lech: difference,
        }, { transaction: t });

        // THỰC HIỆN XUẤT KHO GỘP
        await xuatKhoChoKetCa(shift_id, req.nguoiDung.id, t);

        await t.commit();

        res.status(200).json({
            status: "success",
            message: "Chốt ca làm việc và xuất kho thành công",
            data: caLamViec,
        });

        
        const io = req.app.get("socketio");
        if (io) {
            io.emit("cap_nhat_ca", { status: "CLOSED", ca: caLamViec });
        }
    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};




exports.themChiTieuCa = async (req, res, next) => {
    try {
        const id_nhan_vien = req.nguoiDung.id;
        const { ly_do, so_tien } = req.body;

        if (!ly_do || !so_tien || so_tien <= 0) {
            return next(new AppError("Lý do và số tiền chi không hợp lệ", 400));
        }

        
        const caActive = await KetCa.findOne({
            where: { id_nhan_vien, trang_thai_ca: "DangChay" }
        });

        if (!caActive) {
            return next(new AppError("Bạn phải mở ca làm việc mới có thể ghi nhận chi tiêu", 400));
        }

        
        const chiTieuMoi = await ChiTieuCa.create({
            id_ket_ca: caActive.id,
            id_nhan_vien,
            ly_do,
            so_tien
        });

        res.status(201).json({
            status: "success",
            message: "Ghi nhận chi tiêu thành công",
            data: chiTieuMoi
        });
    } catch (error) {
        next(error);
    }
};
