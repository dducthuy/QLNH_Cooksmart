const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LoaiNguyenLieu = sequelize.define(
    "LoaiNguyenLieu",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ten_loai: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        tableName: "LoaiNguyenLieu",
        timestamps: false,
    }
);

module.exports = LoaiNguyenLieu;
