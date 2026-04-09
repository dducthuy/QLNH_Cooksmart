const { HoaDon, ChiTietHoaDon, BanAn, MonAn, KhuyenMai, Combo, NguoiDung, sequelize } = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");
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

// API lấy tất cả danh sách hóa đơn (có thể lọc theo trạng thái, từ ngày đến ngày)
exports.layTatCaHoaDon = async (req, res, next) => {
    try {
        const { trang_thai_hd, tu_ngay, den_ngay, search, id_ban } = req.query;
        let whereClause = {};

        if (trang_thai_hd) {
            whereClause.trang_thai_hd = trang_thai_hd;
        }

        if (id_ban) {
            whereClause.id_ban = id_ban;
        }

        if (tu_ngay || den_ngay) {
            whereClause.thoi_gian_tao = {};
            if (tu_ngay) whereClause.thoi_gian_tao[Op.gte] = new Date(tu_ngay);
            if (den_ngay) {
                // cộng 1 ngày để bao trọn ngày kết thúc nếu truyền ngày ở định dạng YYYY-MM-DD
                const toDate = new Date(den_ngay);
                toDate.setHours(23, 59, 59, 999);
                whereClause.thoi_gian_tao[Op.lte] = toDate;
            }
        }

        const danhsachHoaDon = await HoaDon.findAll({
            where: whereClause,
            include: [
                { model: BanAn, attributes: ["so_ban"] },
                { model: NguoiDung, attributes: ["ho_ten"] },
                { model: KhuyenMai, attributes: ["ten_km", "loai_km", "gia_tri_km"] }
            ],
            order: [["thoi_gian_tao", "DESC"]],
        });

        res.status(200).json({ status: "success", results: danhsachHoaDon.length, data: danhsachHoaDon });
    } catch (error) {
        next(error);
    }
};

// API lấy chi tiết một hóa đơn theo ID
exports.layChiTietHoaDon = async (req, res, next) => {
    try {
        const hoaDonId = req.params.id;

        const hoanDon = await HoaDon.findByPk(hoaDonId, {
            include: [
                { model: BanAn, attributes: ["so_ban"] },
                { model: NguoiDung, attributes: ["ho_ten"] },
                { model: KhuyenMai, attributes: ["ten_km"] },
                {
                    model: ChiTietHoaDon,
                    include: [
                        { model: MonAn, attributes: ["ten_mon", "gia_tien", ["hinh_anh_mon", "hinh_anh"]] },
                        { model: Combo, attributes: ["ten_combo", "gia_tien", ["hinh_anh_combo", "hinh_anh"]] }
                    ]
                }
            ]
        });

        if (!hoanDon) {
            return next(new AppError("Hóa đơn không tồn tại", 404));
        }

        res.status(200).json({ status: "success", data: hoanDon });
    } catch (error) {
        next(error);
    }
};

// API cập nhật trạng thái hóa đơn
exports.capNhatTrangThaiHoaDon = async (req, res, next) => {
    try {
        const { trang_thai_hd } = req.body;
        const hoaDonId = req.params.id;

        const hoadon = await HoaDon.findByPk(hoaDonId);
        if (!hoadon) {
            return next(new AppError("Hóa đơn không tồn tại", 404));
        }

        if (!["ChoXuLy", "DangPhucVu", "DaThanhToan", "DaHuy"].includes(trang_thai_hd)) {
            return next(new AppError("Trạng thái hóa đơn không hợp lệ", 400));
        }

        // Logic bổ sung: Nếu đang từ DangPhucVu -> DaThanhToan, ta phải giải phóng bàn.
        if (trang_thai_hd === "DaThanhToan" || trang_thai_hd === "DaHuy") {
             if (hoadon.id_ban) {
                 const banAn = await BanAn.findByPk(hoadon.id_ban);
                 if (banAn) {
                     // Lấy tất cả hóa đơn đang phục vụ của bàn. Nếu bàn chỉ có 1 hd này thì mới giải phóng
                     await banAn.update({ trang_thai_ban: "Trong" });
                 }
             }
        }

        await hoadon.update({ trang_thai_hd });

        res.status(200).json({ status: "success", message: "Cập nhật trạng thái hóa đơn thành công" });
    } catch (error) {
        next(error);
    }
};
