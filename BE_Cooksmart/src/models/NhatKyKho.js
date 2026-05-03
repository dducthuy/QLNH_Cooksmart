const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const NhatKyKho = sequelize.define(
    "NhatKyKho",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_nguyen_lieu: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        id_nguoi_thuc_hien: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        loai_giao_dich: {
            type: DataTypes.ENUM("NHAP_HANG", "HUY_HANG", "KIEM_KE_CHOT_LO", "XUAT_BAN"),
            allowNull: false,
        },
        so_luong: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        gia_nhap_lo_hang: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        thoi_gian: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        da_chot_doi_soat: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "NhatKyKho",
        timestamps: false,
        indexes: [],
    }
);

module.exports = NhatKyKho;
