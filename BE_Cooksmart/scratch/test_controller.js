require("dotenv").config();
const { layTatCaHoaDon } = require("../src/controllers/hoaDon.controller");

async function test() {
    const req = {
        query: {
            trang_thai_hd: 'ChoXuLy'
        }
    };
    const res = {
        statusCode: 200,
        status: function(s) { this.statusCode = s; return this; },
        json: function(data) { 
            console.log("Response Status:", this.statusCode);
            console.log("Response Data:", JSON.stringify(data, null, 2));
            return this;
        }
    };
    const next = (err) => {
        if (err) console.error("NEXT ERROR:", err);
    };

    try {
        await layTatCaHoaDon(req, res, next);
    } catch (e) {
        console.error("CATCH ERROR:", e);
    }
}

test();

