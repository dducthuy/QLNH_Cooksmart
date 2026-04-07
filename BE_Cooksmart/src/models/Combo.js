const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Combo = sequelize.define(
    "Combo",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ten_combo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        gia_tien: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        hinh_anh_combo: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        mo_ta: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "Combo",
        timestamps: false,
    }
);

module.exports = Combo;
