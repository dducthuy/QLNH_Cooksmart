const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * BaoCaoHaoHut – Bảng CHI TIẾT báo cáo hao hụt của 1 phiếu kiểm kê
 * 
 * Quan hệ:
 *   NhatKyKho  1 ──────────── N  BaoCaoHaoHut  (1 phiếu kiểm kê có nhiều dòng chi tiết)
 *   NguyenLieu 1 ──────────── N  BaoCaoHaoHut
 * 
 * Bảng này lưu thông tin CHÊNH LỆCH cho mỗi nguyên liệu trong phiếu kiểm kê.
 * Chỉ được tạo khi loai_giao_dich = 'KIEM_KE_CHOT_LO'.
 */
const ChiTietBaoCaoHaoHut = sequelize.define(
    "ChiTietBaoCaoHaoHut",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_nhat_ky_kho: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "FK → NhatKyKho.id (phiếu kiểm kê cha)"
        },
        id_nguyen_lieu: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "FK → NguyenLieu.id"
        },
        luong_ban_ly_thuyet: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: "Số lượng tồn theo hệ thống trước khi kiểm kê"
        },
        luong_du_thuc_te: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: "Số lượng thực đếm được"
        },
        luong_hao_hut: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: "Chênh lệch = ly_thuyet - thuc_te (dương = hao hụt, âm = thừa)"
        },
        gia_tri_hao_hut: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            comment: "luong_hao_hut × gia_von_binh_quan tại thời điểm kiểm kê"
        },
    },
    {
        tableName: "ChiTietHaoHut",
        timestamps: false,
    }
);

module.exports = ChiTietBaoCaoHaoHut;
