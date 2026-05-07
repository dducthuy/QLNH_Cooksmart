
require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const { Server } = require("socket.io");
const db = require("./src/models/index");

// 1. Khởi tạo Server HTTP
const server = http.createServer(app);

// 2. Khởi tạo Socket.io với CORS
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});


app.set("socketio", io);

// ===================== THEO DÕI USER ONLINE =====================
// Map: userId → Set<socketId>
const onlineUsers = new Map();
app.set("onlineUsers", onlineUsers);

// 3. Xử lý sự kiện Socket.io Real-time
io.on("connection", (socket) => {
    console.log("⚡ Client kết nối:", socket.id);

    // --- Đăng ký user online ---
    socket.on("dang_nhap", (userId) => {
        if (!userId) return;
        socket.userId = userId;

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        // Phát sự kiện cho tất cả client biết user này vừa online
        io.emit("user_online", { userId });
        console.log(`🟢 User ${userId} online (${onlineUsers.get(userId).size} kết nối)`);
    });

    socket.on("join_room_bep", (room_name = "khu_vuc_bep") => {
        socket.join(room_name);
        console.log(`👨‍🍳 Màn hình Bếp (${socket.id}) đã tham gia room: ${room_name}`);
    });

    socket.on("khach_dat_mon", (data) => {
        console.log("🔔 Đơn mới từ bàn:", data.id_ban);
        io.to("khu_vuc_bep").emit("thong_bao_moi", data);
        io.emit("thong_bao_moi", data);
    });

    socket.on("cap_nhat_trang_thai_mon", (data) => {
        console.log("🍳 Trạng thái món cập nhật:", data);
        io.emit("trang_thai_mon_da_doi", data);
    });

    socket.on("bao_het_mon", (data) => {
        console.log("❗ Hết món:", data.ten_mon);
        io.emit("het_hang_thong_bao", data);
    });

    socket.on("disconnect", () => {
        console.log("❌ Client ngắt kết nối:", socket.id);


        const userId = socket.userId;
        if (userId && onlineUsers.has(userId)) {
            onlineUsers.get(userId).delete(socket.id);
            if (onlineUsers.get(userId).size === 0) {
                onlineUsers.delete(userId);

                io.emit("user_offline", { userId });
                console.log(`🔴 User ${userId} offline`);
            }
        }
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server CookSmart đang chạy tại: http://localhost:${PORT}`);
});


db.sequelize
    .sync() // Bỏ { alter: true } để tránh tạo nhiều index khóa ngoại bị trùng lặp
    .then(() => {
        console.log("✅ Đồng bộ Database hoàn tất – tất cả 13 bảng sẵn sàng!");
    })
    .catch((err) => {
        console.error("❌ Lỗi đồng bộ Database:", err.message);
    });
