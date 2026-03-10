const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DinhMucMonAn = sequelize.define(
    "DinhMucMonAn",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_mon_an: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        id_nguyen_lieu: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        luong_tieu_hao: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        tableName: "DinhMucMonAn",
        timestamps: false,
        indexes: [],
    }
);

module.exports = DinhMucMonAn;
