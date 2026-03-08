const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ThongBao = sequelize.define(
    "ThongBao",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        loai_thong_bao: {
            type: DataTypes.ENUM("DON_MOI", "MON_XONG", "YEU_CAU_TT", "HET_HANG"),
            allowNull: false,
        },
        noi_dung: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        da_doc: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        thoi_gian: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "ThongBao",
        timestamps: false,
    }
);

module.exports = ThongBao;
