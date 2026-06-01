require('dotenv').config();
const db = require('./src/config/db');

async function dropAllForeignKeys() {
    try {
        console.log("Đang kết nối database...");
        await db.authenticate();
        
        console.log("Đang lấy danh sách tất cả các khóa ngoại...");
        
        const [results] = await db.query(`
            SELECT CONSTRAINT_NAME, TABLE_NAME 
            FROM information_schema.TABLE_CONSTRAINTS 
            WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
              AND TABLE_SCHEMA = 'cooksmart';
        `);

        if (results.length === 0) {
            console.log("Không có khóa ngoại nào cần xóa.");
            return;
        }

        console.log(`Tìm thấy ${results.length} khóa ngoại. Đang tiến hành xóa toàn bộ...`);
        
        // Tắt kiểm tra khóa ngoại tạm thời
        await db.query('SET FOREIGN_KEY_CHECKS = 0;');

        for (const row of results) {
            try {
                await db.query(`ALTER TABLE \`${row.TABLE_NAME}\` DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\`;`);
                console.log(`✅ Đã xóa ${row.CONSTRAINT_NAME} trong bảng ${row.TABLE_NAME}`);
            } catch (err) {
                console.error(`❌ Lỗi xóa ${row.CONSTRAINT_NAME}: ${err.message}`);
            }
        }

        // Bật lại kiểm tra khóa ngoại
        await db.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log("\n=================================");
        console.log("Hoàn tất dọn dẹp! Bây giờ bạn hãy vào server.js, bật lại .sync({ alter: true }) đúng 1 lần rồi chạy server để nó tạo lại khóa ngoại chuẩn, sau đó tắt đi nhé.");
        
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        process.exit();
    }
}

dropAllForeignKeys();
