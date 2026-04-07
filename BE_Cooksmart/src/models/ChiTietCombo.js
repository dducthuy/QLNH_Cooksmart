const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ChiTietCombo = sequelize.define(
    "ChiTietCombo",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_combo: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        id_mon_an: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        so_luong: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
    },
    {
        tableName: "ChiTietCombo",
        timestamps: false,
    }
);

module.exports = ChiTietCombo;
