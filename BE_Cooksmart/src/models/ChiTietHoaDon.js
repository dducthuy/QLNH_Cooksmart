const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ChiTietHoaDon = sequelize.define(
    "ChiTietHoaDon",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_hoa_don: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        id_mon_an: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        so_luong: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        trang_thai_mon: {
            type: DataTypes.ENUM("DangCho", "DangNau", "DaXong"),
            defaultValue: "DangCho",
        },
    },
    {
        tableName: "ChiTietHoaDon",
        timestamps: false,
    }
);

module.exports = ChiTietHoaDon;
