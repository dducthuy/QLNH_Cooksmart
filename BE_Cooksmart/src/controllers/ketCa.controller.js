const { KetCa, HoaDon, ChiTieuCa, NguoiDung } = require("../models");
const AppError = require("../utils/AppError");
const { Op } = require("sequelize");




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
    try {
        const shift_id = req.params.id;
        const { actual_cash } = req.body; 

        
        const caLamViec = await KetCa.findByPk(shift_id);
        
        if (!caLamViec) {
            return next(new AppError("Ca làm việc không tồn tại", 404));
        }
        
        if (caLamViec.trang_thai_ca === "DaKetThuc") {
            return next(new AppError("Ca làm việc này đã được chốt rồi!", 400));
        }

        
        const danhSachHoaDon = await HoaDon.findAll({
            where: {
                id_ket_ca: shift_id,
                trang_thai_hd: "DaThanhToan",
            },
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
            where: { id_ket_ca: shift_id }
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
        });

        res.status(200).json({
            status: "success",
            message: "Chốt ca làm việc thành công",
            data: caLamViec,
        });

        
        const io = req.app.get("socketio");
        if (io) {
            io.emit("cap_nhat_ca", { status: "CLOSED", ca: caLamViec });
        }
    } catch (error) {
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
