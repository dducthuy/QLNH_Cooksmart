const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * ChiTietNhatKyKho – Bảng CHI TIẾT nguyên liệu trong phiếu kho
 * 
 * Quan hệ:
 *   NhatKyKho  1 ──────────── N  ChiTietNhatKyKho
 *   NguyenLieu 1 ──────────── N  ChiTietNhatKyKho
 * 
 * Mỗi dòng = 1 nguyên liệu trong 1 phiếu giao dịch.
 */
const ChiTietNhatKyKho = sequelize.define(
    "ChiTietNhatKyKho",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_nhat_ky_kho: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "FK → NhatKyKho.id"
        },
        id_nguyen_lieu: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "FK → NguyenLieu.id"
        },
        so_luong: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: "Số lượng giao dịch (nhập/xuất/đếm thực tế)"
        },
        don_gia: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            comment: "Đơn giá tại thời điểm giao dịch"
        },
        thanh_tien: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
            comment: "so_luong × don_gia"
        },
    },
    {
        tableName: "ChiTietNhatKyKho",
        timestamps: false,
    }
);

module.exports = ChiTietNhatKyKho;
