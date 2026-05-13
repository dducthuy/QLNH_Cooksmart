const { Combo, ChiTietCombo, MonAn, sequelize } = require("../models");
const AppError = require("../utils/AppError");


exports.layTatCaCombo = async (req, res, next) => {
    try {
        const combos = await Combo.findAll({
            include: [
                {
                    model: ChiTietCombo,
                    as: "ChiTietCombos",
                    include: [
                        { model: MonAn, attributes: ["id", "ten_mon", "gia_tien", "hinh_anh_mon"] }
                    ]
                }
            ],
            order: [["ten_combo", "ASC"]]
        });

        res.status(200).json({ status: "success", results: combos.length, data: combos });
    } catch (error) {
        next(error);
    }
};


exports.layTatCaComboPublic = async (req, res, next) => {
    try {
        const combos = await Combo.findAll({
            where: { trang_thai: true },
            include: [
                {
                    model: ChiTietCombo,
                    as: "ChiTietCombos",
                    include: [
                        { model: MonAn, attributes: ["id", "ten_mon", "gia_tien", "hinh_anh_mon"] }
                    ]
                }
            ],
            order: [["ten_combo", "ASC"]]
        });

        res.status(200).json({ status: "success", results: combos.length, data: combos });
    } catch (error) {
        next(error);
    }
};


exports.layChiTietCombo = async (req, res, next) => {
    try {
        const combo = await Combo.findByPk(req.params.id, {
            include: [
                {
                    model: ChiTietCombo,
                    as: "ChiTietCombos",
                    include: [
                        { model: MonAn, attributes: ["id", "ten_mon", "gia_tien", "hinh_anh_mon"] }
                    ]
                }
            ]
        });

        if (!combo) return next(new AppError("Combo không tồn tại", 404));

        res.status(200).json({ status: "success", data: combo });
    } catch (error) {
        next(error);
    }
};


exports.taoCombo = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { ten_combo, gia_tien, hinh_anh_combo, mo_ta, chi_tiet_combo } = req.body;

        if (!ten_combo || !gia_tien) {
            await t.rollback();
            return next(new AppError("Tên combo và giá tiền là bắt buộc", 400));
        }

        const combo = await Combo.create({ 
            ten_combo, gia_tien, hinh_anh_combo, mo_ta, trang_thai: true 
        }, { transaction: t });

        if (chi_tiet_combo && Array.isArray(chi_tiet_combo) && chi_tiet_combo.length > 0) {
            const chiTiet = chi_tiet_combo.map(ct => ({
                id_combo: combo.id,
                id_mon_an: ct.id_mon_an,
                so_luong: ct.so_luong || 1
            }));
            await ChiTietCombo.bulkCreate(chiTiet, { transaction: t });
        }

        await t.commit();

        const result = await Combo.findByPk(combo.id, {
            include: [{ 
                model: ChiTietCombo, 
                as: "ChiTietCombos",
                include: [{ model: MonAn, attributes: ["id", "ten_mon", "gia_tien"] }] 
            }]
        });

        
        const io = req.app.get("socketio");
        if (io) {
            io.emit("cap_nhat_combo", { id: combo.id, message: "Combo mới được tạo" });
        }

        res.status(201).json({ status: "success", message: "Tạo combo thành công", data: result });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};


exports.capNhatCombo = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const combo = await Combo.findByPk(req.params.id);
        if (!combo) {
            await t.rollback();
            return next(new AppError("Combo không tồn tại", 404));
        }

        const { ten_combo, gia_tien, hinh_anh_combo, mo_ta, trang_thai, chi_tiet_combo } = req.body;

        await combo.update({ ten_combo, gia_tien, hinh_anh_combo, mo_ta, trang_thai }, { transaction: t });

        
        if (chi_tiet_combo && Array.isArray(chi_tiet_combo)) {
            await ChiTietCombo.destroy({ where: { id_combo: combo.id }, transaction: t });
            if (chi_tiet_combo.length > 0) {
                const chiTiet = chi_tiet_combo.map(ct => ({
                    id_combo: combo.id,
                    id_mon_an: ct.id_mon_an,
                    so_luong: ct.so_luong || 1
                }));
                await ChiTietCombo.bulkCreate(chiTiet, { transaction: t });
            }
        }

        await t.commit();

        
        const result = await Combo.findByPk(combo.id, {
            include: [{ 
                model: ChiTietCombo, 
                as: "ChiTietCombos",
                include: [{ model: MonAn, attributes: ["id", "ten_mon", "gia_tien"] }] 
            }]
        });

        
        const io = req.app.get("socketio");
        if (io) {
            io.emit("cap_nhat_combo", { id: combo.id, message: "Combo đã được cập nhật" });
        }

        res.status(200).json({ status: "success", message: "Cập nhật combo thành công", data: result });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};


exports.xoaCombo = async (req, res, next) => {
    try {
        const combo = await Combo.findByPk(req.params.id);
        if (!combo) return next(new AppError("Combo không tồn tại", 404));

        
        
        await combo.destroy();

        
        const io = req.app.get("socketio");
        if (io) {
            io.emit("cap_nhat_combo", { id: combo.id, message: "Combo đã được xóa" });
        }

        res.status(200).json({ status: "success", message: "Đã xóa combo vĩnh viễn" });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return next(new AppError("Không thể xóa combo này vì đã có trong lịch sử hóa đơn. Vui lòng tắt 'Trạng thái hoạt động' để ẩn nó thay vì xóa.", 400));
        }
        next(error);
    }
};
