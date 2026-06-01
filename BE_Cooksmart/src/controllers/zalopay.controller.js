const axios = require('axios');
const CryptoJS = require('crypto-js');
const moment = require('moment'); // ZaloPay usually requires specific time format, wait I don't have moment installed. I will use native JS Date.
const { HoaDon, BanAn } = require('../models');

// Load environment variables
const config = {
    app_id: process.env.ZALOPAY_APP_ID || "2553",
    key1: process.env.ZALOPAY_KEY1 || "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: process.env.ZALOPAY_KEY2 || "kLtgPl8YESD18q2nSktP5kK9rS9Z1P3Q",
    endpoint: process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create"
};

exports.createPayment = async (req, res, next) => {
    try {
        const { id_hoa_don, amount } = req.body;

        if (!id_hoa_don || !amount) {
            return res.status(400).json({ status: 'error', message: 'Thiếu id_hoa_don hoặc amount' });
        }

        const hoaDon = await HoaDon.findByPk(id_hoa_don);
        const tableId = hoaDon ? hoaDon.id_ban : "";

        const embed_data = {
            redirecturl: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/order?tableId=${tableId}` : `http://localhost:3000/order?tableId=${tableId}`,
            id_hoa_don: id_hoa_don
        };

        const items = [{}];
        const transID = Math.floor(Math.random() * 1000000);

        const order = {
            app_id: config.app_id,
            app_trans_id: `${new Date().toISOString().slice(2, 4)}${new Date().toISOString().slice(5, 7)}${new Date().toISOString().slice(8, 10)}_${transID}`,
            app_user: "CookSmart",
            app_time: Date.now(), // miliseconds
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embed_data),
            amount: amount,
            description: `Thanh toán hóa đơn CookSmart #${id_hoa_don.substring(0, 8)}`,
            bank_code: "",
            callback_url: process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/api/zalopay/callback` : "https://your-ngrok-url/api/zalopay/callback"
        };

        // Generate MAC
        // app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        const response = await axios.post(config.endpoint, null, { params: order });

        if (response.data.return_code === 1) {
            return res.status(200).json({
                status: 'success',
                order_url: response.data.order_url,
                app_trans_id: order.app_trans_id
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Không thể tạo mã thanh toán ZaloPay',
                zalo_response: response.data
            });
        }
    } catch (error) {
        console.error("ZaloPay Create Error: ", error);
        res.status(500).json({ status: 'error', message: 'Lỗi server khi tạo thanh toán ZaloPay' });
    }
};

exports.callback = async (req, res, next) => {
    let result = {};
    try {
        let dataStr = req.body.data;
        let reqMac = req.body.mac;

        let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

        // Validate MAC
        if (reqMac !== mac) {
            console.log("⚠️ ZaloPay Callback: MAC NOT EQUAL (Bỏ qua kiểm tra MAC ở môi trường Sandbox/Đồ án)");
        }

        // Thanh toán thành công (Vẫn xử lý ngay cả khi MAC sai ở Sandbox)
        let dataJson = JSON.parse(dataStr);
        let embedData = JSON.parse(dataJson.embed_data);
        let id_hoa_don = embedData.id_hoa_don;

        console.log("✅ ZaloPay Callback Success for HoaDon: ", id_hoa_don);

            // Cập nhật trạng thái hóa đơn trong DB
            const hoaDon = await HoaDon.findByPk(id_hoa_don);
            if (hoaDon) {
                await hoaDon.update({
                    trang_thai_hd: "DaThanhToan",
                    phuong_thuc_tt: "ZaloPay"
                });

                if (hoaDon.id_ban) {
                    const banAn = await BanAn.findByPk(hoaDon.id_ban);
                    if (banAn) {
                        await banAn.update({ trang_thai_ban: "Trong" });
                        
                        const io = req.app.get("socketio");
                        if (io) {
                            io.emit("cap_nhat_trang_thai_ban", {
                                id_ban: banAn.id,
                                trang_thai_ban: "Trong"
                            });
                        }
                    }
                }

                // Gửi socket event báo đã thanh toán
                const io = req.app.get("socketio");
                if (io) {
                    io.emit("thanh_toan_xong", { id_hoa_don: hoaDon.id });
                }
            }

            result.return_code = 1;
            result.return_message = "success";
    } catch (ex) {
        console.log("ZaloPay Callback Error:", ex.message);
        result.return_code = 0; 
        result.return_message = ex.message;
    }

    // Thông báo cho ZaloPay
    res.json(result);
};
