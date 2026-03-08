const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const NguyenLieu = sequelize.define(
    "NguyenLieu",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ten_nguyen_lieu: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        don_vi_tinh: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        so_luong_kho_tong: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        so_luong_tai_bep: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        gia_nhap_gan_nhat: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
    },
    {
        tableName: "NguyenLieu",
        timestamps: false,
    }
);

module.exports = NguyenLieu;
