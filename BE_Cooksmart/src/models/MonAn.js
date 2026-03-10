const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MonAn = sequelize.define(
    "MonAn",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_danh_muc: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        ten_mon: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        gia_tien: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        hinh_anh_mon: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        mo_ta_ai: {
            type: DataTypes.TEXT, // Dữ liệu để AI Chatbot tư vấn cho khách
            allowNull: true,
        },
        con_hang: {
            type: DataTypes.BOOLEAN, // Bếp báo hết món real-time
            defaultValue: true,
        },
    },
    {
        tableName: "MonAn",
        timestamps: false,
        indexes: [],
    }
);

module.exports = MonAn;
