const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BaoCaoHaoHut = sequelize.define(
    "BaoCaoHaoHut",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ngay_chot: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        id_nguyen_lieu: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        luong_ban_ly_thuyet: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        luong_du_thuc_te: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        luong_hao_hut: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        gia_tri_hao_hut: {
            type: DataTypes.DECIMAL(10, 2), // luong_hao_hut * gia_nhap_gan_nhat
            allowNull: true,
        },
    },
    {
        tableName: "BaoCaoHaoHut",
        timestamps: false,
        indexes: [],
    }
);

module.exports = BaoCaoHaoHut;
