const { KetCa, HoaDon, ChiTieuCa, NguoiDung, sequelize } = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");


exports.layLichSuCa = async (req, res, next) => {
    try {
        const {
            status,      // "open" | "closed"
            userId,      // ID nhân viên
            tuNgay,      // "YYYY-MM-DD"
            denNgay,     // "YYYY-MM-DD"
            limit = 20,
            offset = 0,
        } = req.query;

        const whereClause = {};

        // Lọc theo trạng thái
        if (status === "open") {
            whereClause.trang_thai_ca = "DangChay";
        } else if (status === "closed") {
            whereClause.trang_thai_ca = "DaKetThuc";
        }

        // Lọc theo nhân viên
        if (userId) {
            whereClause.id_nhan_vien = userId;
        }

        // Lọc theo khoảng thời gian mở ca
        if (tuNgay || denNgay) {
            whereClause.thoi_gian_bat_dau = {};
            if (tuNgay) {
                whereClause.thoi_gian_bat_dau[Op.gte] = new Date(tuNgay);
            }
            if (denNgay) {
                const toDate = new Date(denNgay);
                toDate.setHours(23, 59, 59, 999);
                whereClause.thoi_gian_bat_dau[Op.lte] = toDate;
            }
        }

        const { count, rows: danhSachCa } = await KetCa.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: NguoiDung,
                    as: "NguoiDung",
                    attributes: ["id", "ho_ten", "ten_dang_nhap", "vai_tro"],
                },
            ],
            order: [["thoi_gian_bat_dau", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.status(200).json({
            status: "success",
            total: count,
            results: danhSachCa.length,
            phanTrang: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                trangHienTai: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
                tongSoTrang: Math.ceil(count / parseInt(limit)),
            },
            data: danhSachCa,
        });
    } catch (error) {
        next(error);
    }
};

// =======================================================
// [2] BÁO CÁO CHI TIẾT CA – GET /api/admin/shifts/:id/report
//     Trả về thông tin ca + thống kê doanh thu từ bảng HoaDon
// =======================================================
exports.layBaoCaoChiTietCa = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Lấy thông tin ca và nhân viên trực
        const caLamViec = await KetCa.findByPk(id, {
            include: [
                {
                    model: NguoiDung,
                    as: "NguoiDung",
                    attributes: ["id", "ho_ten", "ten_dang_nhap", "vai_tro"],
                },
                {
                    model: ChiTieuCa,
                    as: "ChiTieuCas",
                    attributes: ["id", "ly_do", "so_tien", "thoi_gian_chi"],
                },
            ],
        });

        if (!caLamViec) {
            return next(new AppError("Ca làm việc không tồn tại", 404));
        }

        // Thống kê doanh thu từ bảng HoaDon trong ca này
        const thongKeDoanhThu = await HoaDon.findAll({
            where: {
                id_ket_ca: id,
                trang_thai_hd: "DaThanhToan",
            },
            attributes: [
                // Tổng doanh thu tiền mặt
                [
                    sequelize.fn(
                        "SUM",
                        sequelize.literal(
                            "CASE WHEN phuong_thuc_tt = 'TienMat' THEN CAST(tong_tien AS DECIMAL) - CAST(giam_gia AS DECIMAL) ELSE 0 END"
                        )
                    ),
                    "tong_tien_mat",
                ],
                // Tổng doanh thu chuyển khoản
                [
                    sequelize.fn(
                        "SUM",
                        sequelize.literal(
                            "CASE WHEN phuong_thuc_tt = 'ChuyenKhoan' THEN CAST(tong_tien AS DECIMAL) - CAST(giam_gia AS DECIMAL) ELSE 0 END"
                        )
                    ),
                    "tong_chuyen_khoan",
                ],
                // Tổng số hóa đơn
                [sequelize.fn("COUNT", sequelize.col("id")), "tong_so_don"],
                // Tổng doanh thu sau giảm giá
                [
                    sequelize.fn(
                        "SUM",
                        sequelize.literal("CAST(tong_tien AS DECIMAL) - CAST(giam_gia AS DECIMAL)")
                    ),
                    "tong_doanh_thu",
                ],
            ],
            raw: true,
        });

        const tongTienChi = caLamViec.ChiTieuCas.reduce(
            (sum, item) => sum + Number(item.so_tien),
            0
        );

        const thongKe = thongKeDoanhThu[0];

        res.status(200).json({
            status: "success",
            data: {
                ca_lam_viec: caLamViec,
                thong_ke_tai_chinh: {
                    tong_so_don: parseInt(thongKe.tong_so_don) || 0,
                    tong_doanh_thu: parseFloat(thongKe.tong_doanh_thu) || 0,
                    tong_tien_mat: parseFloat(thongKe.tong_tien_mat) || 0,
                    tong_chuyen_khoan: parseFloat(thongKe.tong_chuyen_khoan) || 0,
                    tong_chi_tieu: tongTienChi,
                    // Tiền mặt lý thuyết còn lại trong két
                    tien_mat_ket_ly_thuyet:
                        Number(caLamViec.tien_dau_ca) +
                        (parseFloat(thongKe.tong_tien_mat) || 0) -
                        tongTienChi,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// =======================================================
// [3] KIỂM DUYỆT CA – PUT /api/admin/shifts/:id/audit
//     Admin xác nhận đã kiểm tra và ghi chú xử lý chênh lệch
// =======================================================
exports.kiemDuyetCa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { ghi_chu_kiem_duyet } = req.body;

        const caLamViec = await KetCa.findByPk(id);

        if (!caLamViec) {
            return next(new AppError("Ca làm việc không tồn tại", 404));
        }

        if (caLamViec.trang_thai_ca !== "DaKetThuc") {
            return next(
                new AppError(
                    "Chỉ có thể kiểm duyệt ca đã kết thúc. Ca này vẫn đang chạy!",
                    400
                )
            );
        }

        // Cập nhật trạng thái kiểm duyệt và ghi chú của Admin
        await caLamViec.update({
            da_kiem_duyet: true,
            ghi_chu_kiem_duyet: ghi_chu_kiem_duyet || null,
            id_admin_kiem_duyet: req.nguoiDung.id,
            thoi_gian_kiem_duyet: new Date(),
        });

        res.status(200).json({
            status: "success",
            message: "Kiểm duyệt ca làm việc thành công",
            data: caLamViec,
        });
    } catch (error) {
        next(error);
    }
};

// =======================================================
// [4] THỐNG KÊ TỔNG QUAN – GET /api/admin/shifts/dashboard-summary
//     Tổng hợp doanh thu và chênh lệch của tất cả ca đã đóng
//     trong khoảng thời gian nhất định (dùng Sequelize.fn)
// =======================================================
exports.layTongQuanDashboard = async (req, res, next) => {
    try {
        const { tuNgay, denNgay } = req.query;

        const whereClause = {
            trang_thai_ca: "DaKetThuc",
        };

        if (tuNgay || denNgay) {
            whereClause.thoi_gian_bat_dau = {};
            if (tuNgay) {
                whereClause.thoi_gian_bat_dau[Op.gte] = new Date(tuNgay);
            }
            if (denNgay) {
                const toDate = new Date(denNgay);
                toDate.setHours(23, 59, 59, 999);
                whereClause.thoi_gian_bat_dau[Op.lte] = toDate;
            }
        }

        // Dùng Sequelize.fn để tính tổng hợp từ bảng KetCa
        const tongQuan = await KetCa.findAll({
            where: whereClause,
            attributes: [
                // Tổng số ca đã đóng
                [sequelize.fn("COUNT", sequelize.col("KetCa.id")), "tong_so_ca"],
                // Tổng doanh thu tiền mặt (theo hệ thống)
                [
                    sequelize.fn("SUM", sequelize.col("tong_tien_mat_he_thong")),
                    "tong_doanh_thu_tien_mat",
                ],
                // Tổng doanh thu chuyển khoản (theo hệ thống)
                [
                    sequelize.fn("SUM", sequelize.col("tong_chuyen_khoan_he_thong")),
                    "tong_doanh_thu_chuyen_khoan",
                ],
                // Tổng tiền chênh lệch (âm = thiếu, dương = thừa)
                [
                    sequelize.fn("SUM", sequelize.col("tien_chenh_lech")),
                    "tong_chenh_lech",
                ],
                // Tổng tiền đầu ca (vốn ban đầu)
                [
                    sequelize.fn("SUM", sequelize.col("tien_dau_ca")),
                    "tong_tien_dau_ca",
                ],
            ],
            raw: true,
        });

        // Thống kê ca chưa được kiểm duyệt
        const soCaChuaKiemDuyet = await KetCa.count({
            where: {
                ...whereClause,
                da_kiem_duyet: false,
            },
        });

        const data = tongQuan[0];

        res.status(200).json({
            status: "success",
            data: {
                tong_so_ca: parseInt(data.tong_so_ca) || 0,
                tong_doanh_thu_tien_mat: parseFloat(data.tong_doanh_thu_tien_mat) || 0,
                tong_doanh_thu_chuyen_khoan: parseFloat(data.tong_doanh_thu_chuyen_khoan) || 0,
                tong_doanh_thu:
                    (parseFloat(data.tong_doanh_thu_tien_mat) || 0) +
                    (parseFloat(data.tong_doanh_thu_chuyen_khoan) || 0),
                tong_chenh_lech: parseFloat(data.tong_chenh_lech) || 0,
                tong_tien_dau_ca: parseFloat(data.tong_tien_dau_ca) || 0,
                so_ca_chua_kiem_duyet: soCaChuaKiemDuyet,
            },
        });
    } catch (error) {
        next(error);
    }
};
