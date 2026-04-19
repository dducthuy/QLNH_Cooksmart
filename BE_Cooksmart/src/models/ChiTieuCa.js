const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ChiTieuCa = sequelize.define(
    "ChiTieuCa",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_ket_ca: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        id_nhan_vien: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        ly_do: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        so_tien: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },
        thoi_gian_chi: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "ChiTieuCa",
        timestamps: false,
    }
);

module.exports = ChiTieuCa;
