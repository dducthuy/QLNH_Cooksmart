const sequelize = require("../config/db");

// ===================== IMPORT MODELS =====================
const NguoiDung      = require("./NguoiDung");
const BanAn          = require("./BanAn");
const DanhMuc        = require("./DanhMuc");
const MonAn          = require("./MonAn");
const NguyenLieu     = require("./NguyenLieu");
const DinhMucMonAn   = require("./DinhMucMonAn");
const NhatKyKho      = require("./NhatKyKho");
const HoaDon         = require("./HoaDon");
const ChiTietHoaDon  = require("./ChiTietHoaDon");
const KetCa          = require("./KetCa");
const BaoCaoHaoHut   = require("./BaoCaoHaoHut");
const BaoCaoTaiChinh = require("./BaoCaoTaiChinh");
const ThongBao       = require("./ThongBao");
const KhuyenMai      = require("./KhuyenMai");
const Combo          = require("./Combo");
const ChiTietCombo   = require("./ChiTietCombo");
const ChiTieuCa      = require("./ChiTieuCa");

// ===================== ASSOCIATIONS =====================

// [DanhMuc] 1 -- N [MonAn]  (ON DELETE SET NULL)
DanhMuc.hasMany(MonAn, { foreignKey: "id_danh_muc", onDelete: "SET NULL" });
MonAn.belongsTo(DanhMuc, { foreignKey: "id_danh_muc" });

// [MonAn] 1 -- N [DinhMucMonAn]  (ON DELETE CASCADE)
MonAn.hasMany(DinhMucMonAn, { foreignKey: "id_mon_an", onDelete: "CASCADE" });
DinhMucMonAn.belongsTo(MonAn, { foreignKey: "id_mon_an" });

// [NguyenLieu] 1 -- N [DinhMucMonAn]
NguyenLieu.hasMany(DinhMucMonAn, { foreignKey: "id_nguyen_lieu" });
DinhMucMonAn.belongsTo(NguyenLieu, { foreignKey: "id_nguyen_lieu" });

// [NguyenLieu] 1 -- N [NhatKyKho]
NguyenLieu.hasMany(NhatKyKho, { foreignKey: "id_nguyen_lieu" });
NhatKyKho.belongsTo(NguyenLieu, { foreignKey: "id_nguyen_lieu" });

// [NguoiDung] 1 -- N [NhatKyKho]
NguoiDung.hasMany(NhatKyKho, { foreignKey: "id_nguoi_thuc_hien" });
NhatKyKho.belongsTo(NguoiDung, { foreignKey: "id_nguoi_thuc_hien" });

// [BanAn] 1 -- N [HoaDon]
BanAn.hasMany(HoaDon, { foreignKey: "id_ban" });
HoaDon.belongsTo(BanAn, { foreignKey: "id_ban" });

// [NguoiDung] 1 -- N [HoaDon]
NguoiDung.hasMany(HoaDon, { foreignKey: "id_nhan_vien" });
HoaDon.belongsTo(NguoiDung, { foreignKey: "id_nhan_vien" });

// [HoaDon] 1 -- N [ChiTietHoaDon]  (ON DELETE CASCADE)
HoaDon.hasMany(ChiTietHoaDon, { foreignKey: "id_hoa_don", onDelete: "CASCADE" });
ChiTietHoaDon.belongsTo(HoaDon, { foreignKey: "id_hoa_don" });

// [MonAn] 1 -- N [ChiTietHoaDon]
MonAn.hasMany(ChiTietHoaDon, { foreignKey: "id_mon_an" });
ChiTietHoaDon.belongsTo(MonAn, { foreignKey: "id_mon_an" });

// [NguoiDung] 1 -- N [KetCa]
NguoiDung.hasMany(KetCa, { foreignKey: "id_nhan_vien" });
KetCa.belongsTo(NguoiDung, { foreignKey: "id_nhan_vien" });

// [KetCa] 1 -- N [HoaDon]
KetCa.hasMany(HoaDon, { foreignKey: "id_ket_ca" });
HoaDon.belongsTo(KetCa, { foreignKey: "id_ket_ca" });

// [NguyenLieu] 1 -- N [BaoCaoHaoHut]
NguyenLieu.hasMany(BaoCaoHaoHut, { foreignKey: "id_nguyen_lieu" });
BaoCaoHaoHut.belongsTo(NguyenLieu, { foreignKey: "id_nguyen_lieu" });

// [KhuyenMai] 1 -- N [HoaDon]
KhuyenMai.hasMany(HoaDon, { foreignKey: "id_khuyen_mai" });
HoaDon.belongsTo(KhuyenMai, { foreignKey: "id_khuyen_mai" });

// [Combo] 1 -- N [ChiTietCombo]
Combo.hasMany(ChiTietCombo, { foreignKey: "id_combo", onDelete: "CASCADE" });
ChiTietCombo.belongsTo(Combo, { foreignKey: "id_combo" });

// [MonAn] 1 -- N [ChiTietCombo]
MonAn.hasMany(ChiTietCombo, { foreignKey: "id_mon_an" });
ChiTietCombo.belongsTo(MonAn, { foreignKey: "id_mon_an" });

Combo.hasMany(ChiTietHoaDon, { foreignKey: "id_combo" });
ChiTietHoaDon.belongsTo(Combo, { foreignKey: "id_combo" });

// [KetCa] 1 -- N [ChiTieuCa]
KetCa.hasMany(ChiTieuCa, { foreignKey: "id_ket_ca" });
ChiTieuCa.belongsTo(KetCa, { foreignKey: "id_ket_ca" });

// [NguoiDung] 1 -- N [ChiTieuCa]
NguoiDung.hasMany(ChiTieuCa, { foreignKey: "id_nhan_vien" });
ChiTieuCa.belongsTo(NguoiDung, { foreignKey: "id_nhan_vien" });

// BaoCaoTaiChinh & ThongBao không có FK (standalone tables)

// ===================== EXPORTS =====================
module.exports = {
    sequelize,
    NguoiDung,
    BanAn,
    DanhMuc,
    MonAn,
    NguyenLieu,
    DinhMucMonAn,
    NhatKyKho,
    HoaDon,
    ChiTietHoaDon,
    KetCa,
    BaoCaoHaoHut,
    BaoCaoTaiChinh,
    ThongBao,
    KhuyenMai,
    Combo,
    ChiTietCombo,
    ChiTieuCa,
};
