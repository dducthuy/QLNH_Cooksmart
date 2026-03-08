const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DanhMuc = sequelize.define(
    "DanhMuc",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ten_danh_muc: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        tableName: "DanhMuc",
        timestamps: false,
    }
);

module.exports = DanhMuc;
