const { HoaDon, ChiTietHoaDon, BanAn, MonAn, KhuyenMai, Combo, sequelize } = require("../models");
const AppError = require("../utils/AppError");

// API tạo hóa đơn cho Nhân viên / Admin
exports.taoHoaDon = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id_ban, phuong_thuc_tt, chi_tiet_hoa_don, id_khuyen_mai } = req.body;
        const id_nhan_vien = req.user.id;

        if (!chi_tiet_hoa_don || !Array.isArray(chi_tiet_hoa_don) || chi_tiet_hoa_don.length === 0) {
            return next(new AppError("Danh sách món ăn không được để trống", 400));
        }

        let tong_tien = 0;
        const chiTietHopLe = [];
        const dsMonAnSocket = [];

        for (const item of chi_tiet_hoa_don) {
            const { id_mon_an, id_combo, so_luong, ghi_chu } = item;
            if ((!id_mon_an && !id_combo) || so_luong <= 0) throw new AppError("Dữ liệu chi tiết không hợp lệ", 400);

            let gia_ap_dung = 0;
            let ten_hien_thi = "";

            if (id_mon_an) {
                const monAn = await MonAn.findByPk(id_mon_an, { transaction: t });
                if (!monAn) throw new AppError(`Không tìm thấy món ăn`, 404);
                gia_ap_dung = parseFloat(monAn.gia_tien);
                ten_hien_thi = monAn.ten_mon;
                chiTietHopLe.push({ id_mon_an: monAn.id, so_luong, trang_thai_mon: "DangCho" });
            } else if (id_combo) {
                const combo = await Combo.findByPk(id_combo, { transaction: t });
                if (!combo) throw new AppError(`Không tìm thấy combo`, 404);
                gia_ap_dung = parseFloat(combo.gia_tien);
                ten_hien_thi = combo.ten_combo;
                chiTietHopLe.push({ id_combo: combo.id, so_luong, trang_thai_mon: "DangCho" });
            }

            tong_tien += Number(so_luong) * gia_ap_dung;
            dsMonAnSocket.push({ ten_mon: ten_hien_thi, so_luong, ghi_chu });
        }

        // Xử lý khuyến mãi
        let giam_gia = 0;
        if (id_khuyen_mai) {
            const km = await KhuyenMai.findByPk(id_khuyen_mai, { transaction: t });
            if (km && km.trang_thai && tong_tien >= km.gia_tri_dh_toi_thieu) {
                if (km.loai_km === 'PhanTram') {
                    giam_gia = (tong_tien * parseFloat(km.gia_tri_km)) / 100;
                } else {
                    giam_gia = parseFloat(km.gia_tri_km);
                }
            }
        }

        const hoaDonMoi = await HoaDon.create(
            { 
                id_ban: id_ban || null, 
                id_nhan_vien, 
                tong_tien, 
                id_khuyen_mai: id_khuyen_mai || null,
                giam_gia,
                phuong_thuc_tt: phuong_thuc_tt || "TienMat", 
                trang_thai_hd: "DangPhucVu" 
            },
            { transaction: t }
        );

        const chiTietCanTao = chiTietHopLe.map((ct) => ({ ...ct, id_hoa_don: hoaDonMoi.id }));
        await ChiTietHoaDon.bulkCreate(chiTietCanTao, { transaction: t });

        let so_ban_hien_thi = "Mang về";
        if (id_ban) {
            const banAn = await BanAn.findByPk(id_ban, { transaction: t });
            if (!banAn) throw new AppError("Bàn ăn không tồn tại", 404);
            so_ban_hien_thi = banAn.so_ban;
            await banAn.update({ trang_thai_ban: "DangPhucVu" }, { transaction: t });
        }

        await t.commit();

        // 🔔 GỬI THÔNG BÁO CHO BẾP NGAY LẬP TỨC 🔔
        const io = req.app.get("socketio");
        if (io) {
            io.emit("thong_bao_moi", {
                id_hoa_don: hoaDonMoi.id,
                so_ban: so_ban_hien_thi,
                nguoi_dat: req.user.ho_ten,
                danh_sach_mon: dsMonAnSocket,
                thoi_gian: new Date()
            });
        }

        res.status(201).json({ status: "success", message: "Nhân viên tạo hóa đơn thành công", data: { hoaDon: hoaDonMoi, chiTiet: chiTietCanTao } });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// API tạo hóa đơn cho Khách hàng (Quét mã QR)
exports.taoHoaDonKhachHang = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id_ban, chi_tiet_hoa_don } = req.body;

        if (!id_ban) return next(new AppError("Không xác định được bàn. Vui lòng quét lại mã QR.", 400));
        if (!chi_tiet_hoa_don || !Array.isArray(chi_tiet_hoa_don) || chi_tiet_hoa_don.length === 0) {
            return next(new AppError("Bạn chưa chọn món ăn", 400));
        }

        const banAn = await BanAn.findByPk(id_ban, { transaction: t });
        if (!banAn) throw new AppError("Bàn ăn không tồn tại", 404);

        let tong_tien = 0;
        const chiTietHopLe = [];
        const dsMonAnSocket = [];

        for (const item of chi_tiet_hoa_don) {
            const { id_mon_an, id_combo, so_luong, ghi_chu } = item;
            if ((!id_mon_an && !id_combo) || so_luong <= 0) throw new AppError("Dữ liệu món ăn không hợp lệ", 400);

            let gia_ap_dung = 0;
            let ten_hien_thi = "";

            if (id_mon_an) {
                const monAn = await MonAn.findByPk(id_mon_an, { transaction: t });
                if (!monAn) throw new AppError(`Món ăn không tồn tại`, 404);
                gia_ap_dung = parseFloat(monAn.gia_tien);
                ten_hien_thi = monAn.ten_mon;
                chiTietHopLe.push({ id_mon_an: monAn.id, so_luong, trang_thai_mon: "DangCho" });
            } else if (id_combo) {
                const combo = await Combo.findByPk(id_combo, { transaction: t });
                if (!combo) throw new AppError(`Combo không tồn tại`, 404);
                gia_ap_dung = parseFloat(combo.gia_tien);
                ten_hien_thi = combo.ten_combo;
                chiTietHopLe.push({ id_combo: combo.id, so_luong, trang_thai_mon: "DangCho" });
            }

            tong_tien += Number(so_luong) * gia_ap_dung;
            dsMonAnSocket.push({ ten_mon: ten_hien_thi, so_luong, ghi_chu });
        }

        // Tạo hóa đơn nhưng id_nhan_vien là NULL
        const hoaDonMoi = await HoaDon.create(
            { id_ban, id_nhan_vien: null, tong_tien, phuong_thuc_tt: "TienMat", trang_thai_hd: "ChoXuLy" },
            { transaction: t }
        );

        const chiTietCanTao = chiTietHopLe.map((ct) => ({ ...ct, id_hoa_don: hoaDonMoi.id }));
        await ChiTietHoaDon.bulkCreate(chiTietCanTao, { transaction: t });

        // Khách gọi thêm món thì đổi bàn về Đang Phục Vụ hoặc Chờ
        if (banAn.trang_thai_ban === "Trong") {
             await banAn.update({ trang_thai_ban: "DangPhucVu" }, { transaction: t });
        }

        await t.commit();

        // 🔔 GỬI THÔNG BÁO CHO BẾP NGAY LẬP TỨC 🔔
        const io = req.app.get("socketio");
        if (io) {
            io.emit("thong_bao_moi", {
                id_hoa_don: hoaDonMoi.id,
                so_ban: banAn.so_ban,
                nguoi_dat: "Khách hàng (QR)",
                danh_sach_mon: dsMonAnSocket,
                thoi_gian: new Date()
            });
        }

        res.status(201).json({ status: "success", message: "Khách gọi món thành công. Vui lòng chờ bếp chuẩn bị!", data: { hoaDon: hoaDonMoi, chiTiet: chiTietCanTao } });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};
