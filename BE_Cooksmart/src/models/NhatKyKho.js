const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * NhatKyKho – Bảng ĐẦU PHIẾU giao dịch kho
 * 
 * Quan hệ:
 *   NhatKyKho  1 ──────────── N  ChiTietNhatKyKho
 *   NguoiDung  1 ──────────── N  NhatKyKho
 * 
 * Mỗi phiếu (NhatKyKho) chứa NHIỀU dòng chi tiết (ChiTietNhatKyKho),
 * mỗi dòng chi tiết tương ứng với MỘT nguyên liệu.
 */
const NhatKyKho = sequelize.define(
    "NhatKyKho",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ma_phieu: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Mã phiếu duy nhất, dùng để tra cứu (VD: PN001, PX002, KK003)"
        },
        loai_giao_dich: {
            type: DataTypes.ENUM("NHAP_HANG", "HUY_HANG", "KIEM_KE_CHOT_LO", "XUAT_BAN"),
            allowNull: false,
        },
        id_nguoi_thuc_hien: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: "FK → NguoiDung.id"
        },
        thoi_gian: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        ghi_chu: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "Ghi chú tùy chọn cho phiếu"
        },
    },
    {
        tableName: "NhatKyKho",
        timestamps: false,
    }
);

module.exports = NhatKyKho;
