const { HoaDon, ChiTietHoaDon, BanAn, MonAn, KhuyenMai, Combo, NguoiDung, KetCa, DinhMucMonAn, NguyenLieu, NhatKyKho, ChiTietNhatKyKho, sequelize } = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");


exports.taoHoaDon = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id_ban, phuong_thuc_tt, chi_tiet_hoa_don, id_khuyen_mai } = req.body;
        const id_nhan_vien = req.nguoiDung.id;

        if (!chi_tiet_hoa_don || !Array.isArray(chi_tiet_hoa_don) || chi_tiet_hoa_don.length === 0) {
            return next(new AppError("Danh sách món ăn không được để trống", 400));
        }

        let tong_tien_them = 0;
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
                chiTietHopLe.push({ id_mon_an: monAn.id, so_luong, ghi_chu, trang_thai_mon: "DangCho" });
            } else if (id_combo) {
                const combo = await Combo.findByPk(id_combo, { transaction: t });
                if (!combo) throw new AppError(`Không tìm thấy combo`, 404);
                gia_ap_dung = parseFloat(combo.gia_tien);
                ten_hien_thi = combo.ten_combo;
                chiTietHopLe.push({ id_combo: combo.id, so_luong, ghi_chu, trang_thai_mon: "DangCho" });
            }

            tong_tien_them += Number(so_luong) * gia_ap_dung;
            dsMonAnSocket.push({ ten_mon: ten_hien_thi, so_luong, ghi_chu });
        }


        let hoadonActive = null;
        if (id_ban) {
            hoadonActive = await HoaDon.findOne({
                where: {
                    id_ban,
                    trang_thai_hd: { [Op.in]: ["DangPhucVu", "ChoXuLy"] }
                },
                transaction: t
            });
        }

        let hoaDonKetQua;
        if (hoadonActive) {
            
            const tongTienMoi = Number(hoadonActive.tong_tien) + tong_tien_them;


            await hoadonActive.update({ tong_tien: tongTienMoi }, { transaction: t });
            hoaDonKetQua = hoadonActive;
        } else {
            
            let giam_gia = 0;
            if (id_khuyen_mai) {
                const km = await KhuyenMai.findByPk(id_khuyen_mai, { transaction: t });
                if (km && km.trang_thai && tong_tien_them >= km.gia_tri_dh_toi_thieu) {
                    if (km.loai_km === 'PhanTram') {
                        giam_gia = (tong_tien_them * parseFloat(km.gia_tri_km)) / 100;
                    } else {
                        giam_gia = parseFloat(km.gia_tri_km);
                    }
                }
            }

            hoaDonKetQua = await HoaDon.create(
                {
                    id_ban: id_ban || null,
                    id_nhan_vien,
                    tong_tien: tong_tien_them,
                    id_khuyen_mai: id_khuyen_mai || null,
                    giam_gia,
                    phuong_thuc_tt: phuong_thuc_tt || "TienMat",
                    trang_thai_hd: "DangPhucVu"
                },
                { transaction: t }
            );
        }

        const chiTietCanTao = chiTietHopLe.map((ct) => ({ ...ct, id_hoa_don: hoaDonKetQua.id }));
        await ChiTietHoaDon.bulkCreate(chiTietCanTao, { transaction: t });

        let so_ban_hien_thi = "Mang về";
        if (id_ban) {
            const banAn = await BanAn.findByPk(id_ban, { transaction: t });
            if (!banAn) throw new AppError("Bàn ăn không tồn tại", 404);
            so_ban_hien_thi = banAn.so_ban;
            if (banAn.trang_thai_ban !== "DangPhucVu") {
                await banAn.update({ trang_thai_ban: "DangPhucVu" }, { transaction: t });

                if (req.app.get("socketio")) {
                    req.app.get("socketio").emit("cap_nhat_trang_thai_ban", {
                        id_ban: banAn.id,
                        trang_thai_ban: "DangPhucVu"
                    });
                }

            }
        }

        await t.commit();


        const io = req.app.get("socketio");
        if (io) {

            
            io.to("khu_vuc_bep").emit("thong_bao_moi", {
                id_hoa_don: hoaDonKetQua.id,
                so_ban: so_ban_hien_thi,
                nguoi_dat: req.nguoiDung.ho_ten,
                danh_sach_mon: dsMonAnSocket,
                thoi_gian: new Date()
            });

            io.emit("thong_bao_moi", {
                id_hoa_don: hoaDonKetQua.id,
                so_ban: so_ban_hien_thi,
                nguoi_dat: req.nguoiDung.ho_ten,
                danh_sach_mon: dsMonAnSocket,
                thoi_gian: new Date()
            });
        }

        res.status(201).json({
            status: "success",
            message: hoadonActive ? "Đã thêm món vào hóa đơn hiện tại" : "Nhân viên tạo hóa đơn mới thành công",
            data: { hoaDon: hoaDonKetQua, chiTiet: chiTietCanTao }
        });
    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};


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

        let tong_tien_them = 0;
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
                chiTietHopLe.push({ id_mon_an: monAn.id, so_luong, ghi_chu, trang_thai_mon: "DangCho" });
            } else if (id_combo) {
                const combo = await Combo.findByPk(id_combo, { transaction: t });
                if (!combo) throw new AppError(`Combo không tồn tại`, 404);
                gia_ap_dung = parseFloat(combo.gia_tien);
                ten_hien_thi = combo.ten_combo;
                chiTietHopLe.push({ id_combo: combo.id, so_luong, ghi_chu, trang_thai_mon: "DangCho" });
            }

            tong_tien_them += Number(so_luong) * gia_ap_dung;
            dsMonAnSocket.push({ ten_mon: ten_hien_thi, so_luong, ghi_chu });
        }

        
        const hoadonChoDuyet = await HoaDon.findOne({
            where: {
                id_ban,
                trang_thai_hd: "ChoXuLy"
            },
            transaction: t
        });

        let hoaDonKetQua;
        if (hoadonChoDuyet) {
            
            const tongTienMoi = Number(hoadonChoDuyet.tong_tien) + tong_tien_them;
            await hoadonChoDuyet.update({ tong_tien: tongTienMoi }, { transaction: t });
            hoaDonKetQua = hoadonChoDuyet;
        } else {
            
            hoaDonKetQua = await HoaDon.create(
                { id_ban, id_nhan_vien: null, tong_tien: tong_tien_them, phuong_thuc_tt: "TienMat", trang_thai_hd: "ChoXuLy" },
                { transaction: t }
            );
        }

        const chiTietCanTao = chiTietHopLe.map((ct) => ({ ...ct, id_hoa_don: hoaDonKetQua.id }));
        await ChiTietHoaDon.bulkCreate(chiTietCanTao, { transaction: t });

        
        if (banAn.trang_thai_ban !== "DangPhucVu") {
            await banAn.update({ trang_thai_ban: "DangPhucVu" }, { transaction: t });

            if (req.app.get("socketio")) {
                req.app.get("socketio").emit("cap_nhat_trang_thai_ban", {
                    id_ban: banAn.id,
                    trang_thai_ban: "DangPhucVu"
                });
            }

        }

        await t.commit();

        
        const io = req.app.get("socketio");
        if (io) {
            io.emit("don_qr_cho_duyet", {
                id_hoa_don: hoaDonKetQua.id,
                so_ban: banAn.so_ban,
                danh_sach_mon: dsMonAnSocket,
                ds_ten_mon: dsMonAnSocket.map(m => m.ten_mon).join(", "), 
                thoi_gian: new Date()
            });
        }

        res.status(201).json({
            status: "success",
            message: hoadonChoDuyet ? "Đã thêm món vào đơn chờ duyệt hiện tại" : "Khách gọi món thành công. Vui lòng chờ nhân viên xác nhận!",
            data: { hoaDon: hoaDonKetQua, chiTiet: chiTietCanTao }
        });
    } catch (error) {
        if (t && !t.finished) {
            try { await t.rollback(); } catch (e) { /* ignore */ }
        }
        next(error);
    }
};


exports.layHoaDonKhachHang = async (req, res, next) => {
    try {
        const id_ban = req.params.id_ban;
        const hoaDon = await HoaDon.findOne({
            where: {
                id_ban: id_ban,
                trang_thai_hd: { [Op.in]: ['DangPhucVu', 'ChoXuLy'] }
            },
            include: [
                {
                    model: ChiTietHoaDon,
                    as: "ChiTietHoaDons",
                    include: [
                        { model: MonAn, attributes: ["ten_mon", "gia_tien", ["hinh_anh_mon", "hinh_anh"]] },
                        { model: Combo, attributes: ["ten_combo", "gia_tien", ["hinh_anh_combo", "hinh_anh"]] }
                    ]
                }
            ],
            order: [["thoi_gian_tao", "DESC"]]
        });

        res.status(200).json({ status: "success", data: hoaDon });
    } catch (error) {
        next(error);
    }
};


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
            if (tu_ngay) {
                const fromDate = new Date(tu_ngay);
                if (!isNaN(fromDate.getTime())) {
                    whereClause.thoi_gian_tao[Op.gte] = fromDate;
                }
            }
            if (den_ngay) {
                const toDate = new Date(den_ngay);
                if (!isNaN(toDate.getTime())) {
                    toDate.setHours(23, 59, 59, 999);
                    whereClause.thoi_gian_tao[Op.lte] = toDate;
                }
            }
            
            if (Object.keys(whereClause.thoi_gian_tao).length === 0) {
                delete whereClause.thoi_gian_tao;
            }
        }

        const danhsachHoaDon = await HoaDon.findAll({
            where: whereClause,
            include: [
                { model: BanAn, attributes: ["so_ban"] },
                { model: NguoiDung, attributes: ["ho_ten"] },
                { model: KhuyenMai, attributes: ["ten_km", "loai_km", "gia_tri_km"] },
                {
                    model: ChiTietHoaDon,
                    as: "ChiTietHoaDons",
                    include: [
                        { model: MonAn, attributes: ["ten_mon", "gia_tien"] },
                        { model: Combo, attributes: ["ten_combo", "gia_tien"] }
                    ]
                }
            ],
            order: [["thoi_gian_tao", "DESC"]],
        });

        res.status(200).json({ status: "success", results: danhsachHoaDon.length, data: danhsachHoaDon });
    } catch (error) {
        next(error);
    }
};


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
                    as: "ChiTietHoaDons",
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


exports.capNhatTrangThaiHoaDon = async (req, res, next) => {
    try {
        const { trang_thai_hd, phuong_thuc_tt, id_khuyen_mai } = req.body;
        const hoaDonId = req.params.id;

        const hoadon = await HoaDon.findByPk(hoaDonId);
        if (!hoadon) {
            return next(new AppError("Hóa đơn không tồn tại", 404));
        }

        if (!["ChoXuLy", "DangPhucVu", "DaThanhToan", "DaHuy"].includes(trang_thai_hd)) {
            return next(new AppError("Trạng thái hóa đơn không hợp lệ", 400));
        }


        if (trang_thai_hd === "DaThanhToan" || trang_thai_hd === "DaHuy") {
            if (hoadon.id_ban) {
                const banAn = await BanAn.findByPk(hoadon.id_ban);
                if (banAn) {

                    await banAn.update({ trang_thai_ban: "Trong" });


                    const io = req.app.get("socketio");
                    if (io) {
                        io.emit("cap_nhat_trang_thai_ban", {
                            id_ban: banAn.id,
                            trang_thai_ban: "Trong"
                        });
                    }

                }
            }
        }

        let id_ket_ca_to_update = hoadon.id_ket_ca;
        if (trang_thai_hd === "DaThanhToan") {
            
            let activeShift = await KetCa.findOne({ where: { id_nhan_vien: req.nguoiDung.id, trang_thai_ca: "DangChay" } });

            if (!activeShift) {
                activeShift = await KetCa.findOne({
                    where: { trang_thai_ca: "DangChay" },
                    order: [['thoi_gian_bat_dau', 'DESC']]
                });
            }

            if (activeShift) {
                id_ket_ca_to_update = activeShift.id;
            }
        }

        let giam_gia_moi = hoadon.giam_gia;
        let id_km_moi = hoadon.id_khuyen_mai;

        if (trang_thai_hd === "DaThanhToan" && id_khuyen_mai) {
            const { KhuyenMai } = require("../models");
            const km = await KhuyenMai.findByPk(id_khuyen_mai);
            if (km && km.trang_thai && Number(hoadon.tong_tien) >= km.gia_tri_dh_toi_thieu) {
                if (km.so_luong > 0 && km.da_dung >= km.so_luong) {
                    return next(new AppError("Mã khuyến mãi đã hết lượt sử dụng", 400));
                }

                if (km.loai_km === 'PhanTram') {
                    giam_gia_moi = (Number(hoadon.tong_tien) * parseFloat(km.gia_tri_km)) / 100;
                } else {
                    giam_gia_moi = parseFloat(km.gia_tri_km);
                }
                id_km_moi = id_khuyen_mai;
                
                await km.increment('da_dung', { by: 1 });
            } else if (km && (!km.trang_thai || Number(hoadon.tong_tien) < km.gia_tri_dh_toi_thieu)) {
                return next(new AppError("Mã khuyến mãi không hợp lệ hoặc chưa đủ điều kiện", 400));
            }
        }

        const oldTrangThai = hoadon.trang_thai_hd;
        await hoadon.update({
            trang_thai_hd,
            phuong_thuc_tt: phuong_thuc_tt || hoadon.phuong_thuc_tt,
            id_ket_ca: id_ket_ca_to_update,
            id_khuyen_mai: id_km_moi,
            giam_gia: giam_gia_moi
        });

        if (oldTrangThai === "ChoXuLy" && (trang_thai_hd === "DangPhucVu" || trang_thai_hd === "DaHuy")) {
            const io = req.app.get("socketio");
            if (io) {
                io.emit("don_qr_da_xu_ly", { id_hoa_don: hoadon.id });
            }
        }

        // Đã bỏ xuất kho tự động từng hóa đơn. (Sẽ xuất kho gộp lúc chốt ca)


        if (trang_thai_hd === "DaThanhToan") {
            const io = req.app.get("socketio");
            if (io) {
                io.emit("thanh_toan_xong", { id_hoa_don: hoadon.id });
            }
        }

        
        if (trang_thai_hd === "DangPhucVu" && hoadon.id_ban) {
            const banAn = await BanAn.findByPk(hoadon.id_ban);
            if (banAn && banAn.trang_thai_ban !== "DangPhucVu") {
                await banAn.update({ trang_thai_ban: "DangPhucVu" });
                const io = req.app.get("socketio");
                if (io) {
                    io.emit("cap_nhat_trang_thai_ban", {
                        id_ban: banAn.id,
                        trang_thai_ban: "DangPhucVu"
                    });
                }
            }
        }

        
        if (trang_thai_hd === "DangPhucVu" && oldTrangThai === "ChoXuLy") {
            const { ChiTietHoaDon: CTHD, MonAn, Combo, BanAn: BanAnModel } = require("../models");

            
            if (hoadon.id_ban) {
                const otherActiveInvoice = await HoaDon.findOne({
                    where: {
                        id_ban: hoadon.id_ban,
                        trang_thai_hd: "DangPhucVu",
                        id: { [Op.ne]: hoadon.id } 
                    }
                });

                if (otherActiveInvoice) {
                    
                    const dsChiTiet = await CTHD.findAll({ where: { id_hoa_don: hoadon.id } });

                    
                    await Promise.all(dsChiTiet.map(ct => ct.update({ id_hoa_don: otherActiveInvoice.id })));

                    
                    const totalMoi = Number(otherActiveInvoice.tong_tien) + Number(hoadon.tong_tien);
                    await otherActiveInvoice.update({ tong_tien: totalMoi });

                    
                    const banAn = await BanAnModel.findByPk(hoadon.id_ban);
                    const dsMonAnSocket = await Promise.all(dsChiTiet.map(async ct => {
                        const m = ct.id_mon_an ? await MonAn.findByPk(ct.id_mon_an) : null;
                        const c = ct.id_combo ? await Combo.findByPk(ct.id_combo) : null;
                        return {
                            ten_mon: m?.ten_mon || c?.ten_combo || "Món ăn",
                            so_luong: ct.so_luong,
                            ghi_chu: ct.ghi_chu
                        };
                    }));

                    const io = req.app.get("socketio");
                    if (io) {
                        io.to("khu_vuc_bep").emit("thong_bao_moi", {
                            id_hoa_don: otherActiveInvoice.id,
                            so_ban: banAn?.so_ban || "Không xác định",
                            nguoi_dat: "Khách hàng (QR - Gọi thêm - Đã duyệt)",
                            danh_sach_mon: dsMonAnSocket,
                            thoi_gian: new Date()
                        });
                        io.emit("thong_bao_moi", {
                            id_hoa_don: otherActiveInvoice.id,
                            so_ban: banAn?.so_ban || "Không xác định",
                            nguoi_dat: "Khách hàng (QR - Gọi thêm - Đã duyệt)",
                            danh_sach_mon: dsMonAnSocket,
                            thoi_gian: new Date()
                        });
                    }

                    
                    await hoadon.destroy();
                    return res.status(200).json({ status: "success", message: "Đã gộp món vào hóa đơn chính của bàn" });
                }
            }

            
            const io = req.app.get("socketio");
            if (io) {
                const chiTietList = await CTHD.findAll({
                    where: { id_hoa_don: hoadon.id },
                    include: [
                        { model: MonAn, attributes: ["ten_mon"] },
                        { model: Combo, attributes: ["ten_combo"] }
                    ]
                });
                const banAn = hoadon.id_ban ? await BanAnModel.findByPk(hoadon.id_ban) : null;
                const dsMonAnSocket = chiTietList.map(ct => ({
                    ten_mon: ct.MonAn?.ten_mon || ct.Combo?.ten_combo || "Món ăn",
                    so_luong: ct.so_luong,
                    ghi_chu: ct.ghi_chu
                }));

                io.to("khu_vuc_bep").emit("thong_bao_moi", {
                    id_hoa_don: hoadon.id,
                    so_ban: banAn?.so_ban || "Không xác định",
                    nguoi_dat: "Khách hàng (QR - Đã duyệt)",
                    danh_sach_mon: dsMonAnSocket,
                    thoi_gian: new Date()
                });
                io.emit("thong_bao_moi", {
                    id_hoa_don: hoadon.id,
                    so_ban: banAn?.so_ban || "Không xác định",
                    nguoi_dat: "Khách hàng (QR - Đã duyệt)",
                    danh_sach_mon: dsMonAnSocket,
                    thoi_gian: new Date()
                });
            }
        }

        res.status(200).json({ status: "success", message: "Cập nhật trạng thái hóa đơn thành công" });

    } catch (error) {
        next(error);
    }
};


exports.capNhatTrangThaiMon = async (req, res, next) => {
    try {
        const chiTietId = req.params.id;
        const { trang_thai_mon } = req.body;

        if (!["DangCho", "DangNau", "DaXong", "DaLayDi"].includes(trang_thai_mon)) {
            return next(new AppError("Trạng thái món không hợp lệ", 400));
        }

        const chiTiet = await ChiTietHoaDon.findByPk(chiTietId);
        if (!chiTiet) {
            return next(new AppError("Không tìm thấy chi tiết hóa đơn", 404));
        }

        await chiTiet.update({ trang_thai_mon });

        const chiTietFull = await ChiTietHoaDon.findByPk(chiTietId, {
            include: [
                { model: MonAn, attributes: ['ten_mon'] },
                { model: Combo, attributes: ['ten_combo'] },
                {
                    model: HoaDon,
                    include: [{ model: BanAn, attributes: ['so_ban'] }]
                }
            ]
        });

        const io = req.app.get("socketio");
        const tenMon = chiTietFull.MonAn?.ten_mon || chiTietFull.Combo?.ten_combo || "Món ăn";
        const soBan = chiTietFull.HoaDon?.BanAn?.so_ban || "Mang về";

        if (io) {
            // Luôn emit cập nhật trạng thái (POS & bếp đều lắng nghe)
            io.emit("trang_thai_mon_da_doi", {
                id_hoa_don: chiTiet.id_hoa_don,
                id_chi_tiet: chiTiet.id,
                trang_thai_mon,
                ten_mon: tenMon,
                so_ban: soBan
            });

            // Khi món vừa được lấy đi (DaLayDi) → thông báo bếp ẩn item
            if (trang_thai_mon === "DaLayDi") {
                io.to("khu_vuc_bep").emit("mon_da_lay_di", {
                    id_hoa_don: chiTiet.id_hoa_don,
                    id_chi_tiet: chiTiet.id,
                    so_ban: soBan
                });

                // Kiểm tra xem tất cả món đã DaLayDi chưa → ẩn hẳn ticket bếp
                const tatCaMonTrongHD = await ChiTietHoaDon.findAll({
                    where: { id_hoa_don: chiTiet.id_hoa_don }
                });
                const tatCaDaLayDi = tatCaMonTrongHD.length > 0 &&
                    tatCaMonTrongHD.every(m => m.trang_thai_mon === "DaLayDi");

                if (tatCaDaLayDi) {
                    io.to("khu_vuc_bep").emit("ticket_hoan_tat", {
                        id_hoa_don: chiTiet.id_hoa_don,
                        so_ban: soBan
                    });
                }
            }
        }

        res.status(200).json({ status: "success", message: "Cập nhật trạng thái món thành công" });
    } catch (error) {
        next(error);
    }
};


// Lấy tất cả món DaXong trong 1 hóa đơn (chuyển sang DaLayDi)
exports.layTatCaMon = async (req, res, next) => {
    try {
        const hoaDonId = req.params.id;

        const hoaDon = await HoaDon.findByPk(hoaDonId, {
            include: [{ model: BanAn, attributes: ['so_ban'] }]
        });
        if (!hoaDon) return next(new AppError("Hóa đơn không tồn tại", 404));

        const chiTietList = await ChiTietHoaDon.findAll({
            where: { id_hoa_don: hoaDonId }
        });

        // Chỉ chuyển những món DaXong sang DaLayDi
        const monCanLay = chiTietList.filter(m => m.trang_thai_mon === "DaXong");
        if (monCanLay.length === 0) {
            return next(new AppError("Không có món nào ở trạng thái Đã Xong", 400));
        }

        await Promise.all(monCanLay.map(m => m.update({ trang_thai_mon: "DaLayDi" })));

        const io = req.app.get("socketio");
        const soBan = hoaDon.BanAn?.so_ban || "Mang về";

        if (io) {
            // Thông báo bếp ẩn từng item
            monCanLay.forEach(m => {
                io.to("khu_vuc_bep").emit("mon_da_lay_di", {
                    id_hoa_don: hoaDonId,
                    id_chi_tiet: m.id,
                    so_ban: soBan
                });
            });

            // Kiểm tra xem tất cả đã DaLayDi chưa
            const tatCaDaLayDi = chiTietList.every(m =>
                m.trang_thai_mon === "DaLayDi" || monCanLay.find(x => x.id === m.id)
            );
            if (tatCaDaLayDi) {
                io.to("khu_vuc_bep").emit("ticket_hoan_tat", {
                    id_hoa_don: hoaDonId,
                    so_ban: soBan
                });
            }
        }

        res.status(200).json({
            status: "success",
            message: `Đã lấy ${monCanLay.length} món`,
            so_luong_lay: monCanLay.length
        });
    } catch (error) {
        next(error);
    }
};





// Lịch sử bếp: danh sách hóa đơn có món DaLayDi hôm nay
exports.lichSuBep = async (req, res, next) => {
    try {
        const { KetCa } = require("../models");
        let thoiGianBatDau = new Date();
        thoiGianBatDau.setHours(0, 0, 0, 0);
        let thoiGianKetThuc = new Date();
        thoiGianKetThuc.setHours(23, 59, 59, 999);

        // Tìm ca làm việc đang mở
        const caHienTai = await KetCa.findOne({
            where: { trang_thai_ca: "DangChay" },
            order: [['thoi_gian_bat_dau', 'DESC']]
        });

        if (caHienTai && caHienTai.thoi_gian_bat_dau) {
            thoiGianBatDau = caHienTai.thoi_gian_bat_dau;
            thoiGianKetThuc = new Date(); // Lấy đến thời điểm hiện tại
        }

        const hoaDons = await HoaDon.findAll({
            include: [
                {
                    model: BanAn,
                    attributes: ['so_ban']
                },
                {
                    model: ChiTietHoaDon,
                    as: 'ChiTietHoaDons',
                    where: { trang_thai_mon: "DaLayDi" },
                    required: true,
                    include: [
                        { model: MonAn, attributes: ['ten_mon', 'hinh_anh_mon'] },
                        { model: Combo, attributes: ['ten_combo'] }
                    ]
                }
            ],
            where: {
                thoi_gian_tao: { [Op.between]: [thoiGianBatDau, thoiGianKetThuc] }
            },
            order: [['thoi_gian_tao', 'DESC']]
        });

        res.status(200).json({
            status: "success",
            data: hoaDons
        });
    } catch (error) {
        console.error("Lỗi trong lichSuBep:", error);
        next(error);
    }
};




exports.chuyenBan = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id_hoa_don, id_ban_moi } = req.body;

        const hoaDon = await HoaDon.findByPk(id_hoa_don, { transaction: t });
        if (!hoaDon) throw new AppError("Không tìm thấy hóa đơn", 404);

        const id_ban_cu = hoaDon.id_ban;
        if (id_ban_cu === id_ban_moi) throw new AppError("Bàn mới phải khác bàn hiện tại", 400);

        const banMoi = await BanAn.findByPk(id_ban_moi, { transaction: t });
        if (!banMoi) throw new AppError("Bàn mới không tồn tại", 404);
        if (banMoi.trang_thai_ban !== "Trong") {
            
            const hdMoi = await HoaDon.findOne({
                where: { id_ban: id_ban_moi, trang_thai_hd: { [Op.in]: ["DangPhucVu", "ChoXuLy"] } },
                transaction: t
            });
            if (hdMoi) throw new AppError("Bàn mới đang có khách. Vui lòng gộp bàn nếu muốn chuyển vào.", 400);
        }

        
        if (id_ban_cu) {
            await HoaDon.update(
                { id_ban: id_ban_moi },
                {
                    where: {
                        id_ban: id_ban_cu,
                        trang_thai_hd: { [Op.in]: ["DangPhucVu", "ChoXuLy"] }
                    },
                    transaction: t
                }
            );
        } else {
            
            await hoaDon.update({ id_ban: id_ban_moi }, { transaction: t });
        }

        
        if (id_ban_cu) {
            await BanAn.update({ trang_thai_ban: "Trong" }, { where: { id: id_ban_cu }, transaction: t });
        }

        
        await banMoi.update({ trang_thai_ban: "DangPhucVu" }, { transaction: t });

        await t.commit();

        
        const io = req.app.get("socketio");
        if (io) {
            if (id_ban_cu) io.emit("cap_nhat_trang_thai_ban", { id_ban: id_ban_cu, trang_thai_ban: "Trong" });
            io.emit("cap_nhat_trang_thai_ban", { id_ban: id_ban_moi, trang_thai_ban: "DangPhucVu" });
            io.emit("lam_moi_danh_sach_bep");
        }

        res.status(200).json({ status: "success", message: "Chuyển bàn thành công" });
    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};


exports.gopBan = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { id_hoa_don_nguon, id_hoa_don_dich } = req.body;

        const hdNguon = await HoaDon.findByPk(id_hoa_don_nguon, { transaction: t });
        const hdDich = await HoaDon.findByPk(id_hoa_don_dich, { transaction: t });

        if (!hdNguon || !hdDich) throw new AppError("Hóa đơn không tồn tại", 404);
        if (hdNguon.id === hdDich.id) throw new AppError("Không thể gộp cùng một hóa đơn", 400);

        
        await ChiTietHoaDon.update(
            { id_hoa_don: hdDich.id },
            { where: { id_hoa_don: hdNguon.id }, transaction: t }
        );

        
        const tongTienMoi = Number(hdDich.tong_tien) + Number(hdNguon.tong_tien);
        await hdDich.update({ tong_tien: tongTienMoi }, { transaction: t });

        
        const id_ban_nguon = hdNguon.id_ban;
        await hdNguon.update({ trang_thai_hd: "DaHuy" }, { transaction: t });

        if (id_ban_nguon) {
            await BanAn.update({ trang_thai_ban: "Trong" }, { where: { id: id_ban_nguon }, transaction: t });
        }

        await t.commit();

        
        const io = req.app.get("socketio");
        if (io) {
            if (id_ban_nguon) io.emit("cap_nhat_trang_thai_ban", { id_ban: id_ban_nguon, trang_thai_ban: "Trong" });
            io.emit("lam_moi_danh_sach_bep");
        }

        res.status(200).json({ status: "success", message: "Gộp bàn thành công" });
    } catch (error) {
        if (t) await t.rollback();
        next(error);
    }
};
