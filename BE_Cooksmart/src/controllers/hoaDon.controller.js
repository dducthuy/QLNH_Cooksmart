const { HoaDon, ChiTietHoaDon, BanAn, MonAn, KhuyenMai, Combo, NguoiDung, KetCa, sequelize } = require("../models");
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

        // Kiểm tra xem bàn đã có hóa đơn đang hoạt động chưa
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
            // Cập nhật hóa đơn cũ
            const tongTienMoi = Number(hoadonActive.tong_tien) + tong_tien_them;

            // Re-calculate discount if needed (simplified for now, just adding to total)
            await hoadonActive.update({ tong_tien: tongTienMoi }, { transaction: t });
            hoaDonKetQua = hoadonActive;
        } else {
            // Xử lý khuyến mãi cho HÓA ĐƠN MỚI
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

        // 🔔 GỬI THÔNG BÁO CHO BẾP NGAY LẬP TỨC 🔔
        const io = req.app.get("socketio");
        if (io) {
            // --- BẮT ĐẦU CODE MỚI THÊM ---
            // Bắn dữ liệu thẳng vào Room 'khu_vuc_bep' cho màn hình KDS
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

        // Kiểm tra xem bàn đã có hóa đơn đang hoạt động chưa
        const hoadonActive = await HoaDon.findOne({
            where: {
                id_ban,
                trang_thai_hd: { [Op.in]: ["DangPhucVu", "ChoXuLy"] }
            },
            transaction: t
        });

        let hoaDonKetQua;
        if (hoadonActive) {
            const tongTienMoi = Number(hoadonActive.tong_tien) + tong_tien_them;
            await hoadonActive.update({ tong_tien: tongTienMoi }, { transaction: t });
            hoaDonKetQua = hoadonActive;
        } else {
            // Tạo hóa đơn mới nhưng id_nhan_vien là NULL
            hoaDonKetQua = await HoaDon.create(
                { id_ban, id_nhan_vien: null, tong_tien: tong_tien_them, phuong_thuc_tt: "TienMat", trang_thai_hd: "ChoXuLy" },
                { transaction: t }
            );
        }

        const chiTietCanTao = chiTietHopLe.map((ct) => ({ ...ct, id_hoa_don: hoaDonKetQua.id }));
        await ChiTietHoaDon.bulkCreate(chiTietCanTao, { transaction: t });

        // Khách gọi thêm món thì đổi bàn về Đang Phục Vụ hoặc Chờ
        if (banAn.trang_thai_ban === "Trong") {
            await banAn.update({ trang_thai_ban: "DangPhucVu" }, { transaction: t });
            // --- BẮT ĐẦU CODE MỚI THÊM ---
            if (req.app.get("socketio")) {
                req.app.get("socketio").emit("cap_nhat_trang_thai_ban", {
                    id_ban: banAn.id,
                    trang_thai_ban: "DangPhucVu"
                });
            }

        }

        await t.commit();

        // 🔔 GỬI THÔNG BÁO
        const io = req.app.get("socketio");
        if (io) {
            if (hoadonActive && hoadonActive.trang_thai_hd === "DangPhucVu") {
                // Đơn đã duyệt (bàn đang phục vụ), gửi món gọi thêm thẳng xuống bếp
                io.to("khu_vuc_bep").emit("thong_bao_moi", {
                    id_hoa_don: hoaDonKetQua.id,
                    so_ban: banAn.so_ban,
                    nguoi_dat: "Khách hàng (QR - Gọi thêm)",
                    danh_sach_mon: dsMonAnSocket,
                    thoi_gian: new Date()
                });
                io.emit("thong_bao_moi", {
                    id_hoa_don: hoaDonKetQua.id,
                    so_ban: banAn.so_ban,
                    nguoi_dat: "Khách hàng (QR - Gọi thêm)",
                    danh_sach_mon: dsMonAnSocket,
                    thoi_gian: new Date()
                });
            } else {
                // Đơn mới hoặc đang chờ xử lý, báo cho POS duyệt
                io.emit("don_qr_cho_duyet", {
                    id_hoa_don: hoaDonKetQua.id,
                    so_ban: banAn.so_ban,
                    danh_sach_mon: dsMonAnSocket,
                    thoi_gian: new Date()
                });
            }
        }

        res.status(201).json({
            status: "success",
            message: hoadonActive ? "Đã thêm món vào đơn hiện tại" : "Khách gọi món thành công. Vui lòng chờ bếp chuẩn bị!",
            data: { hoaDon: hoaDonKetQua, chiTiet: chiTietCanTao }
        });
    } catch (error) {
        if (t) await t.rollback();
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
        const { trang_thai_hd, phuong_thuc_tt } = req.body;
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

                    // --- BẮT ĐẦU CODE MỚI THÊM ---
                    const io = req.app.get("socketio");
                    if (io) {
                        io.emit("cap_nhat_trang_thai_ban", {
                            id_ban: banAn.id,
                            trang_thai_ban: "Trong"
                        });
                    }
                    // --- KẾT THÚC CODE MỚI THÊM ---
                }
            }
        }

        let id_ket_ca_to_update = hoadon.id_ket_ca;
        if (trang_thai_hd === "DaThanhToan") {
            // Tìm ca đang chạy (Ưu tiên ca của chính mình, sau đó đến ca chung bất kỳ đang mở)
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

        const oldTrangThai = hoadon.trang_thai_hd; // Lưu lại trạng thái cũ trước khi update

        await hoadon.update({
            trang_thai_hd,
            phuong_thuc_tt: phuong_thuc_tt || hoadon.phuong_thuc_tt,
            id_ket_ca: id_ket_ca_to_update
        });

        // 🔔 Nếu nhân viên DUYỆT đơn QR (ChoXuLy → DangPhucVu) → bắn xuống bếp ngay
        if (trang_thai_hd === "DangPhucVu" && oldTrangThai === "ChoXuLy") {
            const io = req.app.get("socketio");
            if (io) {
                // Lấy chi tiết món để gửi xuống bếp
                const { ChiTietHoaDon: CTHD, MonAn, Combo, BanAn: BanAnModel } = require("../models");
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

// API cập nhật trạng thái chế biến của từng món (cho Bếp)
exports.capNhatTrangThaiMon = async (req, res, next) => {
    try {
        const chiTietId = req.params.id;
        const { trang_thai_mon } = req.body;

        if (!["DangCho", "DangNau", "DaXong"].includes(trang_thai_mon)) {
            return next(new AppError("Trạng thái món không hợp lệ", 400));
        }

        const chiTiet = await ChiTietHoaDon.findByPk(chiTietId);
        if (!chiTiet) {
            return next(new AppError("Không tìm thấy chi tiết hóa đơn", 404));
        }

        await chiTiet.update({ trang_thai_mon });

        // Có thể emit socket ở đây để báo POS hoặc KDS tự động cập nhật
        const io = req.app.get("socketio");
        if (io) {
            io.emit("cap_nhat_trang_thai_mon", {
                id_hoa_don: chiTiet.id_hoa_don,
                id_chi_tiet: chiTiet.id,
                trang_thai_mon
            });
        }

        res.status(200).json({ status: "success", message: "Cập nhật trạng thái món thành công" });
    } catch (error) {
        next(error);
    }
};
