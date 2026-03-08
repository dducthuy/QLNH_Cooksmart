const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BanAn = sequelize.define(
    "BanAn",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        so_ban: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        vi_tri: {
            type: DataTypes.STRING(100), 
            allowNull: true,
        },
        ma_qr_code: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },
        trang_thai_ban: {
            type: DataTypes.ENUM("Trong", "DangPhucVu", "DatTruoc"),
            defaultValue: "Trong",
        },
    },
    {
        tableName: "BanAn",
        timestamps: false,
    }
);

module.exports = BanAn;
