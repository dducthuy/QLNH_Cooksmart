const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const KhuyenMai = sequelize.define(
    "KhuyenMai",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ma_km: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: true,
        },
        ten_km: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        loai_km: {
            type: DataTypes.ENUM("PhanTram", "SoTien"),
            allowNull: false,
        },
        gia_tri_km: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        gia_tri_dh_toi_thieu: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        ngay_bat_dau: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        ngay_ket_thuc: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        so_luong: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0, 
        },
        da_dung: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "KhuyenMai",
        timestamps: true,
    }
);

module.exports = KhuyenMai;
