const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");

const NguoiDung = sequelize.define(
    "NguoiDung",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        ten_dang_nhap: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        mat_khau: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ho_ten: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        vai_tro: {
            type: DataTypes.ENUM("Admin", "ThuNgan", "PhucVu", "Bep"),
            allowNull: false,
        },
        trang_thai: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "NguoiDung",
        timestamps: false,
        hooks: {
            // Tự động hash mật khẩu trước khi TẠO user mới
            beforeCreate: async (nguoiDung) => {
                if (nguoiDung.mat_khau) {
                    const salt = await bcrypt.genSalt(12);
                    nguoiDung.mat_khau = await bcrypt.hash(nguoiDung.mat_khau, salt);
                }
            },
            // Tự động hash mật khẩu trước khi CẬP NHẬT (nếu có đổi mật khẩu)
            beforeUpdate: async (nguoiDung) => {
                if (nguoiDung.changed("mat_khau")) {
                    const salt = await bcrypt.genSalt(12);
                    nguoiDung.mat_khau = await bcrypt.hash(nguoiDung.mat_khau, salt);
                }
            },
        },
    }
);

module.exports = NguoiDung;

