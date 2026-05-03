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
        loai_quan_ly: {
            type: DataTypes.ENUM("TU_DONG", "THU_CONG"),
            defaultValue: "THU_CONG",
            allowNull: false,
        },
        so_luong_ton: {
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
