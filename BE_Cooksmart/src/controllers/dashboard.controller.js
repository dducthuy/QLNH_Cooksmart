const { HoaDon, BanAn, MonAn, ChiTietHoaDon } = require("../models/index");
const { Op } = require("sequelize");
const sequelize = require("../models/index").sequelize;

exports.getDashboardTongQuan = async (req, res, next) => {
    try {
        const { ngay } = req.query;

        // Xác định khoảng thời gian đầu ngày và cuối ngày
        let startDate, endDate;
        if (ngay) {
            startDate = new Date(ngay);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(ngay);
            endDate.setHours(23, 59, 59, 999);
        } else {
            const today = new Date();
            startDate = new Date(today);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
        }

        const timeFilter = {
            [Op.between]: [startDate, endDate],
        };

        // --- 1. Thống kê nhanh ---
        // Tổng doanh thu và số đơn
        const tongDoanhThuData = await HoaDon.sum('tong_tien', {
            where: {
                trang_thai_hd: 'DaThanhToan',
                thoi_gian_tao: timeFilter
            }
        });
        const doanhThuThuan = tongDoanhThuData || 0;

        const soDonHang = await HoaDon.count({
            where: {
                trang_thai_hd: 'DaThanhToan',
                thoi_gian_tao: timeFilter
            }
        });

        // Lấp đầy bàn
        const tongBan = await BanAn.count();
        const banDangPhucVu = await BanAn.count({
            where: { trang_thai_ban: 'DangPhucVu' }
        });
        const tyLeLapDayBan = tongBan > 0 ? Math.round((banDangPhucVu / tongBan) * 100) : 0;

        // Món dừng bán
        const monDungBan = await MonAn.count({
            where: { con_hang: false }
        });

        // --- 2. Doanh thu theo giờ ---
        const hoaDons = await HoaDon.findAll({
            attributes: ['tong_tien', 'thoi_gian_tao'],
            where: {
                trang_thai_hd: 'DaThanhToan',
                thoi_gian_tao: timeFilter
            }
        });

        const hourlyData = {
            '08:00': 0, '10:00': 0, '12:00': 0, '14:00': 0, '16:00': 0, '18:00': 0, '20:00': 0, '22:00': 0
        };

        hoaDons.forEach(hd => {
            const date = new Date(hd.thoi_gian_tao);
            const hour = date.getHours();
            
            if (hour >= 6 && hour < 10) hourlyData['08:00'] += Number(hd.tong_tien);
            else if (hour >= 10 && hour < 12) hourlyData['10:00'] += Number(hd.tong_tien);
            else if (hour >= 12 && hour < 14) hourlyData['12:00'] += Number(hd.tong_tien);
            else if (hour >= 14 && hour < 16) hourlyData['14:00'] += Number(hd.tong_tien);
            else if (hour >= 16 && hour < 18) hourlyData['16:00'] += Number(hd.tong_tien);
            else if (hour >= 18 && hour < 20) hourlyData['18:00'] += Number(hd.tong_tien);
            else if (hour >= 20 && hour < 22) hourlyData['20:00'] += Number(hd.tong_tien);
            else hourlyData['22:00'] += Number(hd.tong_tien);
        });

        const doanhThuTheoGio = Object.keys(hourlyData).map(time => ({
            time,
            total: hourlyData[time]
        }));

        // --- 3. Top 5 món bán chạy ---
        const chiTiets = await ChiTietHoaDon.findAll({
            include: [
                {
                    model: HoaDon,
                    attributes: [],
                    where: {
                        trang_thai_hd: 'DaThanhToan',
                        thoi_gian_tao: timeFilter
                    }
                },
                {
                    model: MonAn,
                    attributes: ['ten_mon']
                }
            ],
            attributes: [
                'id_mon_an',
                [sequelize.fn('SUM', sequelize.col('ChiTietHoaDon.so_luong')), 'total_sold']
            ],
            group: ['id_mon_an', 'MonAn.id', 'MonAn.ten_mon'],
            order: [[sequelize.fn('SUM', sequelize.col('ChiTietHoaDon.so_luong')), 'DESC']],
            limit: 5,
            raw: true
        });

        const topMonBanChay = chiTiets.map(ct => ({
            name: ct['MonAn.ten_mon'] || 'Món không rõ',
            sold: Number(ct.total_sold)
        }));

        res.status(200).json({
            status: "success",
            data: {
                thongKeNhanh: {
                    doanhThuThuan,
                    soDonHang,
                    tyLeLapDayBan,
                    monDungBan
                },
                doanhThuTheoGio,
                topMonBanChay
            }
        });

    } catch (err) {
        next(err);
    }
};
