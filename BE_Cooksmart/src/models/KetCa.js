const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const KetCa = sequelize.define(
    "KetCa",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_nhan_vien: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        thoi_gian_bat_dau: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        thoi_gian_ket_thuc: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tien_dau_ca: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        tong_tien_mat_he_thong: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        tong_chuyen_khoan_he_thong: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        tien_mat_thuc_te_ban_giao: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        tien_chenh_lech: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        trang_thai_ca: {
            type: DataTypes.ENUM("DangChay", "DaKetThuc"),
            defaultValue: "DangChay",
        },
        // ── Kiểm duyệt Admin (Audit) ──────────────────────────────────────────
        da_kiem_duyet: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        ghi_chu_kiem_duyet: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        id_admin_kiem_duyet: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        thoi_gian_kiem_duyet: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "KetCa",
        timestamps: false,
        indexes: [],
    }
);

module.exports = KetCa;
