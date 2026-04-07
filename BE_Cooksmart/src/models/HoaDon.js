const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const HoaDon = sequelize.define(
    "HoaDon",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_ban: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        id_nhan_vien: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        tong_tien: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        phuong_thuc_tt: {
            type: DataTypes.ENUM("TienMat", "ChuyenKhoan"),
            defaultValue: "TienMat",
        },
        trang_thai_hd: {
            type: DataTypes.ENUM("ChoXuLy", "DangPhucVu", "DaThanhToan", "DaHuy"),
            defaultValue: "ChoXuLy",
        },
        thoi_gian_tao: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        id_khuyen_mai: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        giam_gia: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        da_chot_kho: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "HoaDon",
        timestamps: false,
        indexes: [],
    }
);

module.exports = HoaDon;
