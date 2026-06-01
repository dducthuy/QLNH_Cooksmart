const { HoaDon, BanAn, MonAn, ChiTietHoaDon, DanhMuc, NguyenLieu, DinhMucMonAn } = require("../models/index");
const { convertUnit } = require("../utils/unitConverter");
const { Op } = require("sequelize");
const sequelize = require("../models/index").sequelize;

exports.getDashboardTongQuan = async (req, res, next) => {
    try {
        const { ngay } = req.query;


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


        const tongBan = await BanAn.count();
        const banDangPhucVu = await BanAn.count({
            where: { trang_thai_ban: 'DangPhucVu' }
        });
        const tyLeLapDayBan = tongBan > 0 ? Math.round((banDangPhucVu / tongBan) * 100) : 0;


        const monDungBan = await MonAn.count({
            where: { con_hang: false }
        });


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
            name: ct['MonAn.ten_mon'] || 'Combo/Khác',
            sold: Number(ct.total_sold)
        }));

        const nguyenLieuSapHetData = await NguyenLieu.findAll({
            where: { 
                loai_quan_ly: 'TU_DONG',
                so_luong_ton: { [Op.lt]: 10 } // Tạm thời cảnh báo nếu tồn kho < 10
            },
            order: [['so_luong_ton', 'ASC']],
            limit: 5,
            attributes: ['id', 'ten_nguyen_lieu', 'so_luong_ton', 'don_vi_tinh']
        });

        const doanhThuDanhMucData = await ChiTietHoaDon.findAll({
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
                    attributes: [],
                    include: [{
                        model: DanhMuc,
                        attributes: ['ten_danh_muc']
                    }]
                }
            ],
            attributes: [
                [sequelize.col('MonAn.DanhMuc.ten_danh_muc'), 'name'],
                [sequelize.fn('SUM', sequelize.literal('`ChiTietHoaDon`.`so_luong` * `MonAn`.`gia_tien`')), 'value']
            ],
            group: ['MonAn.id_danh_muc', 'MonAn.DanhMuc.id', 'MonAn.DanhMuc.ten_danh_muc'],
            raw: true
        });

        const doanhThuTheoDanhMuc = doanhThuDanhMucData.map(d => ({
            name: d.name || 'Combo/Khác',
            value: Number(d.value)
        })).filter(d => d.value > 0);

        const tatCaChiTiet = await ChiTietHoaDon.findAll({
            include: [
                {
                    model: HoaDon,
                    attributes: [],
                    where: {
                        trang_thai_hd: 'DaThanhToan',
                        thoi_gian_tao: timeFilter
                    }
                }
            ],
            attributes: [
                'id_mon_an',
                [sequelize.fn('SUM', sequelize.col('ChiTietHoaDon.so_luong')), 'total_sold']
            ],
            group: ['id_mon_an'],
            raw: true
        });

        let tongTienCost = 0;
        for (const ct of tatCaChiTiet) {
            if (!ct.id_mon_an) continue;
            
            const dinhMucs = await DinhMucMonAn.findAll({
                where: { id_mon_an: ct.id_mon_an },
                include: [{ model: NguyenLieu, attributes: ['gia_von_binh_quan', 'gia_nhap_gan_nhat', 'don_vi_tinh'] }]
            });

            let costMonAn = 0;
            dinhMucs.forEach(dm => {
                const nl = dm.NguyenLieu;
                if (nl) {
                    const donGia = Number(nl.gia_von_binh_quan) > 0 ? Number(nl.gia_von_binh_quan) : Number(nl.gia_nhap_gan_nhat || 0);
                    const luongXuatKho = convertUnit(dm.luong_tieu_hao, dm.don_vi_tinh, nl.don_vi_tinh);
                    costMonAn += luongXuatKho * donGia;
                }
            });

            tongTienCost += costMonAn * Number(ct.total_sold);
        }

        const tienLoi = doanhThuThuan - tongTienCost;

        res.status(200).json({
            status: "success",
            data: {
                thongKeNhanh: {
                    doanhThuThuan,
                    tongTienCost,
                    tienLoi,
                    soDonHang,
                    tyLeLapDayBan,
                    monDungBan
                },
                doanhThuTheoGio,
                topMonBanChay,
                nguyenLieuSapHet: nguyenLieuSapHetData,
                doanhThuTheoDanhMuc
            }
        });

    } catch (err) {
        next(err);
    }
};
