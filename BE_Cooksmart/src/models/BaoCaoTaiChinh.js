const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BaoCaoTaiChinh = sequelize.define(
    "BaoCaoTaiChinh",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        thoi_gian: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        doanh_thu_thuan: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        gia_von_ban_hang: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        tong_hao_hut: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        loi_nhuan_rong: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
    },
    {
        tableName: "BaoCaoTaiChinh",
        timestamps: false,
    }
);

module.exports = BaoCaoTaiChinh;
