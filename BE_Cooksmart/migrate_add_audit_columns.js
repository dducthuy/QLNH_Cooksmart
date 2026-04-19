/**
 * MIGRATION SCRIPT – Thêm các cột Kiểm duyệt (Audit) vào bảng KetCa
 * 
 * Cách chạy: node migrate_add_audit_columns.js
 * Chỉ cần chạy MỘT LẦN DUY NHẤT.
 * Script tự kiểm tra xem cột đã tồn tại chưa trước khi thêm (idempotent).
 */

require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || "mysql",
        logging: false,
    }
);

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        await sequelize.authenticate();
        console.log("✅ Kết nối database thành công!");

        // Lấy danh sách cột hiện có trong bảng KetCa
        const tableDescription = await queryInterface.describeTable("KetCa");
        const existingColumns = Object.keys(tableDescription);
        console.log("📋 Các cột hiện có:", existingColumns.join(", "));

        // Danh sách các cột cần thêm
        const columnsToAdd = [
            {
                name: "da_kiem_duyet",
                definition: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
            },
            {
                name: "ghi_chu_kiem_duyet",
                definition: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
            },
            {
                name: "id_admin_kiem_duyet",
                definition: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
            },
            {
                name: "thoi_gian_kiem_duyet",
                definition: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
        ];

        let soColonDaThem = 0;

        for (const col of columnsToAdd) {
            if (existingColumns.includes(col.name)) {
                console.log(`⏭️  Bỏ qua '${col.name}' – Cột đã tồn tại.`);
            } else {
                await queryInterface.addColumn("KetCa", col.name, col.definition);
                console.log(`✅ Đã thêm cột '${col.name}' vào bảng KetCa.`);
                soColonDaThem++;
            }
        }

        if (soColonDaThem === 0) {
            console.log("\n🎉 Tất cả cột đã tồn tại. Không có gì cần thêm.");
        } else {
            console.log(`\n🎉 Migration hoàn tất. Đã thêm ${soColonDaThem} cột mới.`);
        }

    } catch (error) {
        console.error("❌ Migration thất bại:", error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log("🔌 Đã đóng kết nối database.");
    }
}

migrate();
